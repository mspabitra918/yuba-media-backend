"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LeadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const lead_model_1 = require("./lead.model");
const mail_service_1 = require("../mail/mail.service");
const sequelize_2 = require("sequelize");
let LeadsService = LeadsService_1 = class LeadsService {
    model;
    mail;
    logger = new common_1.Logger(LeadsService_1.name);
    constructor(model, mail) {
        this.model = model;
        this.mail = mail;
    }
    async create(dto) {
        try {
            const lead = await this.model.create({
                fullName: dto.fullName,
                email: dto.email,
                company: dto.company ?? null,
                phone: dto.phone ?? null,
                inquiryType: dto.inquiryType,
                message: dto.message,
                crmSynced: false,
            });
            try {
                const salesInbox = process.env.SALES_INBOX || "sales@yubamedia.com";
                await Promise.all([
                    this.mail.sendLeadConfirmation(lead.email, lead.fullName),
                    this.mail.sendLeadAlert(salesInbox, lead.fullName, lead.inquiryType, lead.id),
                ]);
            }
            catch (mailErr) {
                this.logger.warn(`Lead saved but email failed: ${mailErr.message}`);
            }
            return lead;
        }
        catch (err) {
            this.logger.error("Failed to create lead", err);
            throw new common_1.InternalServerErrorException("Could not submit your inquiry. Please try again.");
        }
    }
    async findAll(filters) {
        try {
            const where = {};
            if (filters.inquiryType)
                where.inquiryType = filters.inquiryType;
            if (filters.date) {
                const startOfDay = new Date(filters.date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(filters.date);
                endOfDay.setHours(23, 59, 59, 999);
                where.created_at = {
                    [sequelize_2.Op.between]: [startOfDay, endOfDay],
                };
            }
            return await this.model.findAll({
                where,
                order: [["created_at", "DESC"]],
            });
        }
        catch (err) {
            this.logger.error("Failed to list leads", err);
            throw new common_1.InternalServerErrorException("Could not load leads.");
        }
    }
    async findOne(id) {
        try {
            const lead = await this.model.findByPk(id);
            if (!lead)
                throw new common_1.NotFoundException("Lead not found.");
            return lead;
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
            this.logger.error("Failed to fetch lead", err);
            throw new common_1.InternalServerErrorException("Could not load lead.");
        }
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = LeadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(lead_model_1.Lead)),
    __metadata("design:paramtypes", [Object, mail_service_1.MailService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map