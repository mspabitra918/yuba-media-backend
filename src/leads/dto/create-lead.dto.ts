import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export const INQUIRY_TYPES = ["client", "general"] as const;

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  company?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @IsIn(INQUIRY_TYPES as unknown as string[])
  inquiryType!: "client" | "general";

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message!: string;
}
