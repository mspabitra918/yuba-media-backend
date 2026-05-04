export declare const POSITIONS: readonly ["Voice Process Agent", "Voice Trainer", "Team Leader — Voice Ops", "Sales Development Representative (SDR)", "Quality Analyst — Voice"];
export declare const EXPERIENCE_BRACKETS: readonly ["0–1 years", "1–3 years", "3–5 years", "5+ years"];
export declare const AVAILABILITY: readonly ["Immediately", "2 weeks", "1 month", "Other"];
export declare class CreateApplicantDto {
    fullName: string;
    email: string;
    phone: string;
    position: string;
    experience: string;
    location: string;
    availability?: string;
    linkedinUrl?: string;
    coverLetter?: string;
}
