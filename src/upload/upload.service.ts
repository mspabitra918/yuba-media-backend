import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { extname } from "path";
import { randomUUID } from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx"]);

export const MAX_CV_BYTES = 5 * 1024 * 1024;

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucket = process.env.SUPABASE_CV_BUCKET || "applicant-cvs";

    if (!url || !key) {
      throw new Error(
        "Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      );
    }

    this.client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }

  isAllowed(file: Express.Multer.File): boolean {
    const ext = extname(file.originalname).toLowerCase();
    return ALLOWED_MIME.has(file.mimetype) && ALLOWED_EXT.has(ext);
  }

  async saveCv(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname).toLowerCase();
    const objectKey = `${Date.now()}-${randomUUID()}${ext}`;

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(objectKey, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Supabase upload failed: ${error.message}`);
      throw new InternalServerErrorException(
        "Could not store the uploaded file.",
      );
    }

    this.logger.log(`Uploaded CV → ${this.bucket}/${objectKey}`);
    return objectKey;
  }

  async getSignedUrl(
    objectKey: string,
    expiresInSec = 60 * 5,
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(objectKey, expiresInSec);

    if (error || !data) {
      this.logger.error(
        `Could not create signed URL: ${error?.message ?? "unknown error"}`,
      );
      throw new InternalServerErrorException(
        "Could not generate CV download URL.",
      );
    }
    return data.signedUrl;
  }
}
