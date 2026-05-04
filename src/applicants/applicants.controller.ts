import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
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
import { extname } from "path";

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
    try {
      const applicant = await this.applicants.create(body, cv);
      return {
        ok: true,
        id: applicant.id,
        message: "Application received.",
      };
    } catch (error) {
      console.log("Error creating applicant:", error);
      throw new InternalServerErrorException("Error creating applicant.");
    }
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

  @Get(":id/cv") //  admin can download each applicant cv
  @UseGuards(RolesGuard)
  async downloadCv(@Param("id") id: string, @Res() res: Response) {
    const applicant = await this.applicants.findOne(id);
    const signedUrl = await this.upload.getSignedUrl(applicant.cvUrl);

    const upstream = await fetch(signedUrl);
    if (!upstream.ok) {
      throw new InternalServerErrorException("Could not retrieve CV.");
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    const ext = extname(applicant.cvUrl) || ".pdf";
    const safeName = applicant.fullName.replace(/[^\w.-]+/g, "_");

    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}-cv${ext}"`,
    );
    res.send(buffer);
  }
}
