import { Applicant } from "./applicant.model";
import { CreateApplicantDto } from "./dto/create-applicant.dto";
import { MailService } from "../mail/mail.service";
import { UploadService } from "../upload/upload.service";
export declare class ApplicantsService {
    private readonly model;
    private readonly upload;
    private readonly mail;
    private readonly logger;
    constructor(model: typeof Applicant, upload: UploadService, mail: MailService);
    create(dto: CreateApplicantDto, cv: Express.Multer.File | undefined): Promise<Applicant>;
    findAll(filters: {
        position?: string;
        status?: string;
        date?: string;
    }): Promise<Applicant[]>;
    findOne(id: string): Promise<Applicant>;
    updateStatus(id: string, status: string): Promise<Applicant>;
    stats(): Promise<{
        total: number;
        newThisWeek: number;
        underReview: number;
        interview: number;
    }>;
}
