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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateApplicantDto = exports.AVAILABILITY = exports.EXPERIENCE_BRACKETS = exports.POSITIONS = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
exports.POSITIONS = [
    "Voice Process Agent",
    "Voice Trainer",
    "Team Leader — Voice Ops",
    "Sales Development Representative (SDR)",
    "Quality Analyst — Voice",
];
exports.EXPERIENCE_BRACKETS = [
    "0–1 years",
    "1–3 years",
    "3–5 years",
    "5+ years",
];
exports.AVAILABILITY = [
    "Immediately",
    "2 weeks",
    "1 month",
    "Other",
];
class CreateApplicantDto {
    fullName;
    email;
    phone;
    position;
    experience;
    location;
    availability;
    linkedinUrl;
    coverLetter;
}
exports.CreateApplicantDto = CreateApplicantDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateApplicantDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateApplicantDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], CreateApplicantDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsIn)(exports.POSITIONS),
    __metadata("design:type", String)
], CreateApplicantDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsIn)(exports.EXPERIENCE_BRACKETS),
    __metadata("design:type", String)
], CreateApplicantDto.prototype, "experience", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], CreateApplicantDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === "" ? undefined : value)),
    (0, class_validator_1.IsIn)(exports.AVAILABILITY),
    __metadata("design:type", String)
], CreateApplicantDto.prototype, "availability", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === "" ? undefined : value)),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateApplicantDto.prototype, "linkedinUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === "" ? undefined : value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateApplicantDto.prototype, "coverLetter", void 0);
//# sourceMappingURL=create-applicant.dto.js.map