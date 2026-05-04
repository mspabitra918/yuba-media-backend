import { LeadsService } from "./leads.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
export declare class LeadsController {
    private readonly leads;
    constructor(leads: LeadsService);
    create(dto: CreateLeadDto): Promise<{
        ok: boolean;
        id: string;
        message: string;
    }>;
    list(inquiryType?: string, date?: string): Promise<import("./lead.model").Lead[]>;
    one(id: string): Promise<import("./lead.model").Lead>;
}
