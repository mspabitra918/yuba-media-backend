import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import type { Response } from "express";
import { basename, extname } from "path";

import { ApplicantsService } from "./applicants.service";
import { CreateApplicantDto } from "./dto/create-applicant.dto";
import { RolesGuard } from "../auth/admin.guard";
import { UploadService } from "../upload/upload.service";

@Controller("applicants")
export class ApplicantsController {
  constructor(
    private readonly applicants: ApplicantsService,
    private readonly upload: UploadService,
  ) {}

  @Post() // new applicant
  @UseInterceptors(
    FileInterceptor("cv", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() body: CreateApplicantDto,
    @UploadedFile() cv: Express.Multer.File,
  ) {
    const applicant = await this.applicants.create(body, cv);
    return {
      ok: true,
      id: applicant.id,
      message: "Application received.",
    };
  }

  @Get() // collect all applicant
  @UseGuards(RolesGuard)
  async list(
    @Query("position") position?: string,
    @Query("status") status?: string,
    @Query("date") date?: string,
  ) {
    return this.applicants.findAll({
      position,
      status,
      date,
    });
  }

  @Get("stats") // collect all number of applicant
  @UseGuards(RolesGuard)
  async stats() {
    return this.applicants.stats();
  }

  @Get(":id") // show the applicant detilas via the applicant id
  @UseGuards(RolesGuard)
  async one(@Param("id") id: string) {
    return this.applicants.findOne(id);
  }

  @Patch(":id/status") // change the applicant status by her/him by id
  @UseGuards(RolesGuard)
  async updateStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.applicants.updateStatus(id, status);
  }

  @Get(":id/cv")
  async downloadCv(@Param("id") id: string, @Res() res: Response) {
    const applicant = await this.applicants.findOne(id);

    if (!applicant?.cvUrl) {
      throw new NotFoundException("CV not found.");
    }

    const cvBuffer = await this.upload.getCvBuffer(applicant.cvUrl);

    const ext = extname(applicant.cvUrl).toLowerCase();

    const contentTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    res.setHeader(
      "Content-Type",
      contentTypes[ext] ?? "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${basename(applicant.cvUrl)}"`,
    );
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.send(cvBuffer);
  }
}
