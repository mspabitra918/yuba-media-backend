import { Model } from "sequelize-typescript";
export type ApplicantStatus = "new" | "review" | "interview" | "rejected";
export declare class Applicant extends Model<Applicant> {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    experience: string;
    location: string;
    cvUrl: string;
    coverLetter: string | null;
    linkedinUrl: string | null;
    availability: string | null;
    status: ApplicantStatus;
}
