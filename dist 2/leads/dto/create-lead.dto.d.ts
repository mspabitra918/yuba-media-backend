export declare const INQUIRY_TYPES: readonly ["client", "general"];
export declare class CreateLeadDto {
    fullName: string;
    email: string;
    company?: string | null;
    phone?: string | null;
    inquiryType: "client" | "general";
    message: string;
}
