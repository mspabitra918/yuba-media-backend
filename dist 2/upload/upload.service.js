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
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = exports.MAX_CV_BYTES = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const crypto_1 = require("crypto");
const supabase_js_1 = require("@supabase/supabase-js");
const ALLOWED_MIME = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx"]);
exports.MAX_CV_BYTES = 5 * 1024 * 1024;
let UploadService = UploadService_1 = class UploadService {
    logger = new common_1.Logger(UploadService_1.name);
    client;
    bucket;
    constructor() {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        this.bucket = process.env.SUPABASE_CV_BUCKET || "applicant-cvs";
        if (!url || !key) {
            throw new Error("Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
        }
        this.client = (0, supabase_js_1.createClient)(url, key, {
            auth: { persistSession: false },
        });
    }
    isAllowed(file) {
        const ext = (0, path_1.extname)(file.originalname).toLowerCase();
        return ALLOWED_MIME.has(file.mimetype) && ALLOWED_EXT.has(ext);
    }
    async saveCv(file) {
        const ext = (0, path_1.extname)(file.originalname).toLowerCase();
        const objectKey = `${Date.now()}-${(0, crypto_1.randomUUID)()}${ext}`;
        const { error } = await this.client.storage
            .from(this.bucket)
            .upload(objectKey, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error) {
            this.logger.error(`Supabase upload failed: ${error.message}`);
            throw new common_1.InternalServerErrorException("Could not store the uploaded file.");
        }
        this.logger.log(`Uploaded CV → ${this.bucket}/${objectKey}`);
        return objectKey;
    }
    async getSignedUrl(objectKey, expiresInSec = 60 * 5) {
        const { data, error } = await this.client.storage
            .from(this.bucket)
            .createSignedUrl(objectKey, expiresInSec);
        if (error || !data) {
            this.logger.error(`Could not create signed URL: ${error?.message ?? "unknown error"}`);
            throw new common_1.InternalServerErrorException("Could not generate CV download URL.");
        }
        return data.signedUrl;
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UploadService);
//# sourceMappingURL=upload.service.js.map