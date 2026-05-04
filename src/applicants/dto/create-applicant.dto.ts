import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";

export const POSITIONS = [
  "Voice Process Agent",
  "Voice Trainer",
  "Team Leader — Voice Ops",
  "Sales Development Representative (SDR)",
  "Quality Analyst — Voice",
] as const;

export const EXPERIENCE_BRACKETS = [
  "0–1 years",
  "1–3 years",
  "3–5 years",
  "5+ years",
] as const;

export const AVAILABILITY = [
  "Immediately",
  "2 weeks",
  "1 month",
  "Other",
] as const;

export class CreateApplicantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  phone!: string;

  @IsIn(POSITIONS as unknown as string[])
  position!: string;

  @IsIn(EXPERIENCE_BRACKETS as unknown as string[])
  experience!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  location!: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsIn(AVAILABILITY as unknown as string[])
  availability?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  @MaxLength(2000)
  coverLetter?: string;
}
