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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const applicants_service_1 = require("./applicants.service");
const create_applicant_dto_1 = require("./dto/create-applicant.dto");
const admin_guard_1 = require("../auth/admin.guard");
const upload_service_1 = require("../upload/upload.service");
let ApplicantsController = class ApplicantsController {
    applicants;
    upload;
    constructor(applicants, upload) {
        this.applicants = applicants;
        this.upload = upload;
    }
    async create(body, cv) {
        try {
            const applicant = await this.applicants.create(body, cv);
            return {
                ok: true,
                id: applicant.id,
                message: "Application received.",
            };
        }
        catch (error) {
            console.log("Error creating applicant:", error);
            throw new common_1.InternalServerErrorException("Error creating applicant.");
        }
    }
    async list(position, status, date) {
        return this.applicants.findAll({
            position,
            status,
            date,
        });
    }
    async stats() {
        return this.applicants.stats();
    }
    async one(id) {
        return this.applicants.findOne(id);
    }
    async updateStatus(id, status) {
        return this.applicants.updateStatus(id, status);
    }
    async downloadCv(id, res) {
        const applicant = await this.applicants.findOne(id);
        const signedUrl = await this.upload.getSignedUrl(applicant.cvUrl);
        const upstream = await fetch(signedUrl);
        if (!upstream.ok) {
            throw new common_1.InternalServerErrorException("Could not retrieve CV.");
        }
        const buffer = Buffer.from(await upstream.arrayBuffer());
        const ext = (0, path_1.extname)(applicant.cvUrl) || ".pdf";
        const safeName = applicant.fullName.replace(/[^\w.-]+/g, "_");
        res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${safeName}-cv${ext}"`);
        res.send(buffer);
    }
};
exports.ApplicantsController = ApplicantsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("cv", {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_applicant_dto_1.CreateApplicantDto, Object]),
    __metadata("design:returntype", Promise)
], ApplicantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(admin_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)("position")),
    __param(1, (0, common_1.Query)("status")),
    __param(2, (0, common_1.Query)("date")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ApplicantsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("stats"),
    (0, common_1.UseGuards)(admin_guard_1.RolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApplicantsController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.UseGuards)(admin_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicantsController.prototype, "one", null);
__decorate([
    (0, common_1.Patch)(":id/status"),
    (0, common_1.UseGuards)(admin_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApplicantsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(":id/cv"),
    (0, common_1.UseGuards)(admin_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApplicantsController.prototype, "downloadCv", null);
exports.ApplicantsController = ApplicantsController = __decorate([
    (0, common_1.Controller)("applicants"),
    __metadata("design:paramtypes", [applicants_service_1.ApplicantsService,
        upload_service_1.UploadService])
], ApplicantsController);
//# sourceMappingURL=applicants.controller.js.map