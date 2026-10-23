import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { extname, join, basename } from "path";
import { randomUUID } from "crypto";
import { existsSync, mkdirSync, writeFile, unlink } from "fs";
import { promisify } from "util";

const writeFileAsync = promisify(writeFile);
const unlinkAsync = promisify(unlink);

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

  private readonly uploadDir = join(process.cwd(), "uploads", "cvs");

  constructor() {
    // Create the directory if it doesn't exist.
    mkdirSync(this.uploadDir, { recursive: true });
  }

  isAllowed(file: Express.Multer.File): boolean {
    if (!file?.originalname || !file?.mimetype) {
      return false;
    }

    const ext = extname(file.originalname).toLowerCase();

    return (
      ALLOWED_MIME.has(file.mimetype) &&
      ALLOWED_EXT.has(ext) &&
      file.size <= MAX_CV_BYTES
    );
  }

  async saveCv(file: Express.Multer.File): Promise<string> {
    if (!this.isAllowed(file)) {
      throw new InternalServerErrorException(
        "Invalid CV file. Only PDF, DOC, and DOCX files up to 5 MB are allowed.",
      );
    }

    const ext = extname(file.originalname).toLowerCase();
    const objectKey = `${Date.now()}-${randomUUID()}${ext}`;
    const filePath = join(this.uploadDir, objectKey);

    try {
      await writeFileAsync(filePath, file.buffer, {
        flag: "wx",
        mode: 0o600,
      });

      this.logger.log(`CV saved locally: ${objectKey}`);

      // Store this returned key in your database.
      return objectKey;
    } catch (error) {
      this.logger.error(
        `Local CV upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );

      throw new InternalServerErrorException(
        "Could not store the uploaded file.",
      );
    }
  }

  getCvPath(objectKey: string): string {
    // Accept only generated CV filenames, not arbitrary paths.
    const filename = basename(objectKey);

    if (
      filename !== objectKey ||
      !/^\d+-[0-9a-f-]+\.(pdf|doc|docx)$/i.test(filename)
    ) {
      throw new NotFoundException("CV not found.");
    }

    return join(this.uploadDir, filename);
  }

  async deleteCv(objectKey: string): Promise<void> {
    const filePath = this.getCvPath(objectKey);

    try {
      await unlinkAsync(filePath);
      this.logger.log(`Deleted local CV: ${objectKey}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new NotFoundException("CV not found.");
      }

      this.logger.error(`Could not delete CV: ${objectKey}`);

      throw new InternalServerErrorException(
        "Could not delete the uploaded file.",
      );
    }
  }

  async getCvBuffer(objectKey: string): Promise<Buffer> {
    const filePath = this.getCvPath(objectKey);

    try {
      const { readFile } = await import("fs/promises");
      return await readFile(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new NotFoundException("CV not found.");
      }

      throw new InternalServerErrorException(
        "Could not read the uploaded file.",
      );
    }
  }
}
