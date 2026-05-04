import type { Response } from "express";
import { ApplicantsService } from "./applicants.service";
import { CreateApplicantDto } from "./dto/create-applicant.dto";
import { UploadService } from "src/upload/upload.service";
export declare class ApplicantsController {
    private readonly applicants;
    private readonly upload;
    constructor(applicants: ApplicantsService, upload: UploadService);
    create(body: CreateApplicantDto, cv: Express.Multer.File): Promise<{
        ok: boolean;
        id: string;
        message: string;
    }>;
    list(position?: string, status?: string, date?: string): Promise<import("./applicant.model").Applicant[]>;
    stats(): Promise<{
        total: number;
        newThisWeek: number;
        underReview: number;
        interview: number;
    }>;
    one(id: string): Promise<import("./applicant.model").Applicant>;
    updateStatus(id: string, status: string): Promise<import("./applicant.model").Applicant>;
    downloadCv(id: string, res: Response): Promise<void>;
}
