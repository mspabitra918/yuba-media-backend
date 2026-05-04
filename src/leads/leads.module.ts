import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";

import { Lead } from "./lead.model";
import { LeadsController } from "./leads.controller";
import { LeadsService } from "./leads.service";

@Module({
  imports: [SequelizeModule.forFeature([Lead])],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
