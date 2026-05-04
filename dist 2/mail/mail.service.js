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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mailgun_js_1 = __importDefault(require("mailgun.js"));
const form_data_1 = __importDefault(require("form-data"));
let MailService = MailService_1 = class MailService {
    config;
    logger = new common_1.Logger(MailService_1.name);
    mailgun;
    domain;
    constructor(config) {
        this.config = config;
        const mailgun = new mailgun_js_1.default(form_data_1.default);
        this.mailgun = mailgun.client({
            username: "api",
            key: this.config.get("MAILGUN_API_KEY") ?? "",
            url: this.config.get("MAILGUN_API_URL") ?? "https://api.mailgun.net",
        });
        this.domain = this.config.get("MAILGUN_DOMAIN") ?? "";
    }
    async send(payload) {
        try {
            this.logger.log(`Attempting to send email to ${payload.to}...`);
            const response = await this.mailgun.messages.create(this.domain, {
                from: this.config.get("MAILGUN_FROM", "Yuba Media <noreply@yubamedia.com>"),
                to: payload.to,
                subject: payload.subject,
                text: payload.body,
            });
            this.logger.log(`Email sent successfully to ${payload.to}: ${payload.subject}. ID: ${response.id}`);
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${payload.to}`, err.stack || err.message || err);
            if (err.details) {
                this.logger.error(`Error details: ${err.details}`);
            }
        }
    }
    async sendApplicantConfirmation(toEmail, fullName, position) {
        await this.send({
            to: toEmail,
            subject: "We received your application — Yuba Media",
            body: `Hi ${fullName},\n\nThanks for applying for ${position} at Yuba Media. Our team will review your CV and be in touch shortly.\n\n— Yuba Media Talent Team`,
        });
    }
    async sendApplicantStatusUpdate(toEmail, fullName, position, status) {
        let message = "";
        switch (status) {
            case "new":
                message = `We’ve received your application and it is currently in our system.`;
                break;
            case "review":
                message = `Your application is currently under review by our hiring team.`;
                break;
            case "interview":
                message = `Good news! You have been shortlisted for the interview stage. Our team will contact you with further details shortly.`;
                break;
            case "rejected":
                message = `Thank you for your interest. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.`;
                break;
        }
        await this.send({
            to: toEmail,
            subject: `Application Status Update — Yuba Media`,
            body: `Hi ${fullName},

${message}

Position: ${position}

We appreciate your interest in Yuba Media.

— Yuba Media Talent Team`,
        });
    }
    async sendApplicantAlert(careersInbox, fullName, position, applicantId) {
        await this.send({
            to: careersInbox,
            subject: `New application: ${fullName} — ${position}`,
            body: `New applicant submitted via the careers form.\n\nName: ${fullName}\nPosition: ${position}\nApplicant ID: ${applicantId}\n\nView in the admin dashboard.`,
        });
    }
    async sendLeadConfirmation(toEmail, fullName) {
        await this.send({
            to: toEmail,
            subject: "Thanks for reaching out — Yuba Media",
            body: `Hi ${fullName},\n\nThanks for getting in touch with Yuba Media. A member of our team will get back to you within one business day.\n\n— Yuba Media`,
        });
    }
    async sendLeadAlert(salesInbox, fullName, inquiryType, leadId) {
        await this.send({
            to: salesInbox,
            subject: `New lead: ${fullName} — ${inquiryType}`,
            body: `New inquiry from the website.\n\nName: ${fullName}\nType: ${inquiryType}\nLead ID: ${leadId}`,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map