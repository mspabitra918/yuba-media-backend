import { Model } from "sequelize-typescript";
export type InquiryType = "client" | "general";
export declare class Lead extends Model<Lead> {
    id: string;
    fullName: string;
    email: string;
    company: string | null;
    phone: string | null;
    inquiryType: InquiryType;
    message: string;
    crmSynced: boolean;
}
