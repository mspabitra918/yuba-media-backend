import { ConfigService } from "@nestjs/config";
export interface MailMessage {
    to: string;
    subject: string;
    body: string;
}
export type ApplicantStatus = "new" | "review" | "interview" | "rejected";
export declare class MailService {
    private readonly config;
    private readonly logger;
    private mailgun;
    private domain;
    constructor(config: ConfigService);
    private send;
    sendApplicantConfirmation(toEmail: string, fullName: string, position: string): Promise<void>;
    sendApplicantStatusUpdate(toEmail: string, fullName: string, position: string, status: ApplicantStatus): Promise<void>;
    sendApplicantAlert(careersInbox: string, fullName: string, position: string, applicantId: string): Promise<void>;
    sendLeadConfirmation(toEmail: string, fullName: string): Promise<void>;
    sendLeadAlert(salesInbox: string, fullName: string, inquiryType: string, leadId: string): Promise<void>;
}
