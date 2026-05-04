import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";

import { Applicant } from "./applicant.model";
import { ApplicantsController } from "./applicants.controller";
import { ApplicantsService } from "./applicants.service";

@Module({
  imports: [SequelizeModule.forFeature([Applicant])],
  controllers: [ApplicantsController],
  providers: [ApplicantsService],
})
export class ApplicantsModule {}
