import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";

import { databaseConfig } from "./config/database.config";
import { ApplicantsModule } from "./applicants/applicants.module";
import { LeadsModule } from "./leads/leads.module";
import { MailModule } from "./mail/mail.module";
import { UploadModule } from "./upload/upload.module";
import { AuthModule } from "./auth/auth.module";
import { Applicant } from "./applicants/applicant.model";
import { Lead } from "./leads/lead.model";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        ...databaseConfig(),
        models: [Applicant, Lead],
      }),
    }),
    MailModule,
    UploadModule,
    AuthModule,
    ApplicantsModule,
    LeadsModule,
  ],
})
export class AppModule {}
