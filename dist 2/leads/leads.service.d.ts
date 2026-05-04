import { Lead } from "./lead.model";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { MailService } from "../mail/mail.service";
export declare class LeadsService {
    private readonly model;
    private readonly mail;
    private readonly logger;
    constructor(model: typeof Lead, mail: MailService);
    create(dto: CreateLeadDto): Promise<Lead>;
    findAll(filters: {
        inquiryType?: string;
        date?: string;
    }): Promise<Lead[]>;
    findOne(id: string): Promise<Lead>;
}
