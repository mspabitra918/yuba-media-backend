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
var ApplicantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const applicant_model_1 = require("./applicant.model");
const mail_service_1 = require("../mail/mail.service");
const upload_service_1 = require("../upload/upload.service");
const sequelize_2 = require("sequelize");
const VALID_STATUSES = [
    "new",
    "review",
    "interview",
    "rejected",
];
let ApplicantsService = ApplicantsService_1 = class ApplicantsService {
    model;
    upload;
    mail;
    logger = new common_1.Logger(ApplicantsService_1.name);
    constructor(model, upload, mail) {
        this.model = model;
        this.upload = upload;
        this.mail = mail;
    }
    async create(dto, cv) {
        if (!cv) {
            throw new common_1.BadRequestException("CV file is required.");
        }
        if (cv.size > upload_service_1.MAX_CV_BYTES) {
            throw new common_1.BadRequestException("CV must be smaller than 5MB.");
        }
        if (!this.upload.isAllowed(cv)) {
            throw new common_1.BadRequestException("CV must be a PDF or DOCX file.");
        }
        let cvUrl;
        try {
            cvUrl = await this.upload.saveCv(cv);
        }
        catch (err) {
            this.logger.error("CV upload failed", err);
            throw new common_1.InternalServerErrorException("Could not save your CV. Please try again.");
        }
        try {
            const applicant = await this.model.create({
                fullName: dto.fullName,
                email: dto.email,
                phone: dto.phone,
                position: dto.position,
                experience: dto.experience,
                location: dto.location,
                cvUrl,
                coverLetter: dto.coverLetter ?? null,
                linkedinUrl: dto.linkedinUrl ?? null,
                availability: dto.availability ?? null,
                status: "new",
            });
            try {
                const careersInbox = process.env.CAREERS_INBOX || "careers@yubamedia.com";
                await Promise.all([
                    this.mail.sendApplicantConfirmation(applicant.email, applicant.fullName, applicant.position),
                    this.mail.sendApplicantAlert(careersInbox, applicant.fullName, applicant.position, applicant.id),
                ]);
            }
            catch (mailErr) {
                this.logger.warn(`Applicant saved but email failed: ${mailErr.message}`);
            }
            return applicant;
        }
        catch (err) {
            this.logger.error("Failed to create applicant", err);
            throw new common_1.InternalServerErrorException("Could not save your application. Please try again.");
        }
    }
    async findAll(filters) {
        try {
            const where = {};
            if (filters.position)
                where.position = filters.position;
            if (filters.status)
                where.status = filters.status;
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
            this.logger.error("Failed to list applicants", err);
            throw new common_1.InternalServerErrorException("Could not load applicants.");
        }
    }
    async findOne(id) {
        try {
            const applicant = await this.model.findByPk(id);
            if (!applicant)
                throw new common_1.NotFoundException("Applicant not found.");
            return applicant;
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
            this.logger.error("Failed to fetch applicant", err);
            throw new common_1.InternalServerErrorException("Could not load applicant.");
        }
    }
    async updateStatus(id, status) {
        if (!VALID_STATUSES.includes(status)) {
            throw new common_1.BadRequestException(`status must be one of: ${VALID_STATUSES.join(", ")}`);
        }
        try {
            const applicant = await this.findOne(id);
            applicant.status = status;
            await applicant.save();
            try {
                await this.mail.sendApplicantStatusUpdate(applicant.email, applicant.fullName, applicant.position, applicant.status);
            }
            catch (error) {
                this.logger.warn(`Applicant status updated but email failed: ${error.message}`);
            }
            return applicant;
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException ||
                err instanceof common_1.BadRequestException) {
                throw err;
            }
            this.logger.error("Failed to update applicant status", err);
            throw new common_1.InternalServerErrorException("Could not update applicant.");
        }
    }
    async stats() {
        try {
            const sinceMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
            const all = await this.model.findAll();
            return {
                total: all.length,
                newThisWeek: all.filter((a) => {
                    const created = a.get("created_at");
                    return (created?.getTime?.() ?? 0) >= sinceMs;
                }).length,
                underReview: all.filter((a) => a.status === "review").length,
                interview: all.filter((a) => a.status === "interview").length,
            };
        }
        catch (err) {
            this.logger.error("Failed to compute applicant stats", err);
            throw new common_1.InternalServerErrorException("Could not load stats.");
        }
    }
};
exports.ApplicantsService = ApplicantsService;
exports.ApplicantsService = ApplicantsService = ApplicantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(applicant_model_1.Applicant)),
    __metadata("design:paramtypes", [Object, upload_service_1.UploadService,
        mail_service_1.MailService])
], ApplicantsService);
//# sourceMappingURL=applicants.service.js.map