import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Applicant, ApplicantStatus } from "./applicant.model";
import { CreateApplicantDto } from "./dto/create-applicant.dto";
import { MailService } from "../mail/mail.service";
import { MAX_CV_BYTES, UploadService } from "../upload/upload.service";
import { Op } from "sequelize";

const VALID_STATUSES: ApplicantStatus[] = [
  "new",
  "review",
  "interview",
  "rejected",
];

@Injectable()
export class ApplicantsService {
  private readonly logger = new Logger(ApplicantsService.name);

  constructor(
    @InjectModel(Applicant) private readonly model: typeof Applicant,
    private readonly upload: UploadService,
    private readonly mail: MailService,
  ) {}

  async create(
    dto: CreateApplicantDto,
    cv: Express.Multer.File | undefined,
  ): Promise<Applicant> {
    if (!cv) {
      throw new BadRequestException("CV file is required.");
    }
    if (cv.size > MAX_CV_BYTES) {
      throw new BadRequestException("CV must be smaller than 5MB.");
    }
    if (!this.upload.isAllowed(cv)) {
      throw new BadRequestException("CV must be a PDF or DOCX file.");
    }

    let cvUrl: string;
    try {
      cvUrl = await this.upload.saveCv(cv);
    } catch (err) {
      this.logger.error("CV upload failed", err as Error);
      throw new InternalServerErrorException(
        "Could not save your CV. Please try again.",
      );
    }

    try {
      const applicant = await this.model.create({
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        position: dto.position,
        experience: dto.experience,
        location: dto.location,
        cvUrl,
        coverLetter: dto.coverLetter ?? null,
        linkedinUrl: dto.linkedinUrl ?? null,
        availability: dto.availability ?? null,
        status: "new",
      } as Partial<Applicant> as Applicant);

      try {
        const careersInbox =
          process.env.CAREERS_INBOX || "careers@yubamedia.com";
        await Promise.all([
          this.mail.sendApplicantConfirmation(
            applicant.email,
            applicant.fullName,
            applicant.position,
          ),
          this.mail.sendApplicantAlert(
            careersInbox,
            applicant.fullName,
            applicant.position,
            applicant.id,
          ),
        ]);
      } catch (mailErr) {
        this.logger.warn(
          `Applicant saved but email failed: ${(mailErr as Error).message}`,
        );
      }

      return applicant;
    } catch (err) {
      this.logger.error("Failed to create applicant", err as Error);
      throw new InternalServerErrorException(
        "Could not save your application. Please try again.",
      );
    }
  }

  async findAll(filters: {
    position?: string;
    status?: string;
    date?: string;
  }) {
    try {
      const where: Record<string, unknown> = {};
      if (filters.position) where.position = filters.position;
      if (filters.status) where.status = filters.status;

      // ✅ Filter by specific date
      if (filters.date) {
        const startOfDay = new Date(filters.date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(filters.date);
        endOfDay.setHours(23, 59, 59, 999);

        where.created_at = {
          [Op.between]: [startOfDay, endOfDay],
        };
      }

      return await this.model.findAll({
        where,
        order: [["created_at", "DESC"]],
      });
    } catch (err) {
      this.logger.error("Failed to list applicants", err as Error);
      throw new InternalServerErrorException("Could not load applicants.");
    }
  }

  async findOne(id: string): Promise<Applicant> {
    try {
      const applicant = await this.model.findByPk(id);
      if (!applicant) throw new NotFoundException("Applicant not found.");
      return applicant;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error("Failed to fetch applicant", err as Error);
      throw new InternalServerErrorException("Could not load applicant.");
    }
  }

  async updateStatus(id: string, status: string): Promise<Applicant> {
    if (!VALID_STATUSES.includes(status as ApplicantStatus)) {
      throw new BadRequestException(
        `status must be one of: ${VALID_STATUSES.join(", ")}`,
      );
    }

    try {
      const applicant = await this.findOne(id);
      applicant.status = status as ApplicantStatus;
      await applicant.save();

      try {
        await this.mail.sendApplicantStatusUpdate(
          applicant.email,
          applicant.fullName,
          applicant.position,
          applicant.status,
        );
      } catch (error) {
        this.logger.warn(
          `Applicant status updated but email failed: ${(error as Error).message}`,
        );
      }

      return applicant;
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      this.logger.error("Failed to update applicant status", err as Error);
      throw new InternalServerErrorException("Could not update applicant.");
    }
  }

  async stats() {
    try {
      const sinceMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const all = await this.model.findAll();
      return {
        total: all.length,
        newThisWeek: all.filter((a) => {
          const created = a.get("created_at") as Date | undefined;
          return (created?.getTime?.() ?? 0) >= sinceMs;
        }).length,
        underReview: all.filter((a) => a.status === "review").length,
        interview: all.filter((a) => a.status === "interview").length,
      };
    } catch (err) {
      this.logger.error("Failed to compute applicant stats", err as Error);
      throw new InternalServerErrorException("Could not load stats.");
    }
  }
}
