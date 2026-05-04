import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { LeadsService } from "./leads.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { RolesGuard } from "../common/guards/roles.guard";

@Controller("leads")
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post() // user can send general meesage to the tuba media team
  async create(@Body() dto: CreateLeadDto) {
    const lead = await this.leads.create(dto);
    return {
      ok: true,
      id: lead.id,
      message: "We received your inquiry.",
    };
  }

  @Get() // show all the message to the yuba team
  @UseGuards(RolesGuard)
  async list(
    @Query("inquiryType") inquiryType?: string,
    @Query("date") date?: string,
  ) {
    return this.leads.findAll({ inquiryType, date });
  }

  @Get(":id") // show all the message to the yuba team by there id
  @UseGuards(RolesGuard)
  async one(@Param("id") id: string) {
    return this.leads.findOne(id);
  }
}
