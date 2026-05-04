import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";

import { Lead } from "./lead.model";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { MailService } from "../mail/mail.service";
import { Op } from "sequelize";

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectModel(Lead) private readonly model: typeof Lead,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateLeadDto): Promise<Lead> {
    try {
      const lead = await this.model.create({
        fullName: dto.fullName,
        email: dto.email,
        company: dto.company ?? null,
        phone: dto.phone ?? null,
        inquiryType: dto.inquiryType,
        message: dto.message,
        crmSynced: false,
      } as Partial<Lead> as Lead);

      try {
        const salesInbox = process.env.SALES_INBOX || "sales@yubamedia.com";
        await Promise.all([
          this.mail.sendLeadConfirmation(lead.email, lead.fullName),
          this.mail.sendLeadAlert(
            salesInbox,
            lead.fullName,
            lead.inquiryType,
            lead.id,
          ),
        ]);
      } catch (mailErr) {
        this.logger.warn(
          `Lead saved but email failed: ${(mailErr as Error).message}`,
        );
      }

      return lead;
    } catch (err) {
      this.logger.error("Failed to create lead", err as Error);
      throw new InternalServerErrorException(
        "Could not submit your inquiry. Please try again.",
      );
    }
  }

  async findAll(filters: { inquiryType?: string; date?: string }) {
    try {
      const where: Record<string, unknown> = {};
      if (filters.inquiryType) where.inquiryType = filters.inquiryType;

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
      this.logger.error("Failed to list leads", err as Error);
      throw new InternalServerErrorException("Could not load leads.");
    }
  }

  async findOne(id: string): Promise<Lead> {
    try {
      const lead = await this.model.findByPk(id);
      if (!lead) throw new NotFoundException("Lead not found.");
      return lead;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error("Failed to fetch lead", err as Error);
      throw new InternalServerErrorException("Could not load lead.");
    }
  }
}
