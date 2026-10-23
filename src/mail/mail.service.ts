import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface MailMessage {
  to: string;
  subject: string;
  body: string;
}

export type ApplicantStatus = "new" | "review" | "interview" | "rejected";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const transport = this.config.get<string>("MAIL_TRANSPORT", "smtp");

    if (transport !== "smtp") {
      throw new Error(
        `Unsupported MAIL_TRANSPORT "${transport}". Expected "smtp".`,
      );
    }

    const host = this.config.get<string>("SMTP_HOST");
    const port = Number(this.config.get<string>("SMTP_PORT", "587"));
    const user = this.config.get<string>("SMTP_USER");
    const password = this.config.get<string>("SMTP_PASSWORD");
    const secure = this.config.get<string>("SMTP_SECURE", "false") === "true";

    this.from = this.config.get<string>("SMTP_FROM") ?? user ?? "";

    if (!host || !user || !password || !this.from) {
      throw new Error(
        "SMTP configuration is incomplete. Check SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.",
      );
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("SMTP_PORT must be a valid port number.");
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: password,
      },
    });

    this.logger.log("SMTP mail transport initialized.");
  }

  private async send(payload: MailMessage): Promise<void> {
    this.logger.log(`Attempting to send email to ${payload.to}...`);

    try {
      const response = await this.transporter.sendMail({
        from: this.from,
        to: payload.to,
        subject: payload.subject,
        text: payload.body,
      });

      this.logger.log(
        `Email sent successfully to ${payload.to}: ${payload.subject}. Message ID: ${response.messageId}`,
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));

      this.logger.error(
        `Failed to send email to ${payload.to}: ${error.message}`,
        error.stack,
      );

      throw err;
    }
  }

  async sendApplicantConfirmation(
    toEmail: string,
    fullName: string,
    position: string,
  ): Promise<void> {
    await this.send({
      to: toEmail,
      subject: "We received your application — Yuba Media",
      body: `Hi ${fullName},

Thanks for applying for ${position} at Yuba Media. Our team will review your CV and be in touch shortly.

— Yuba Media Talent Team`,
    });
  }

  async sendApplicantStatusUpdate(
    toEmail: string,
    fullName: string,
    position: string,
    status: ApplicantStatus,
  ): Promise<void> {
    let message = "";

    switch (status) {
      case "new":
        message =
          "We've received your application and it is currently in our system.";
        break;

      case "review":
        message =
          "Your application is currently under review by our hiring team.";
        break;

      case "interview":
        message =
          "Good news! You have been shortlisted for the interview stage. Our team will contact you with further details shortly.";
        break;

      case "rejected":
        message =
          "Thank you for your interest. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.";
        break;
    }

    await this.send({
      to: toEmail,
      subject: "Application Status Update — Yuba Media",
      body: `Hi ${fullName},

${message}

Position: ${position}

We appreciate your interest in Yuba Media.

— Yuba Media Talent Team`,
    });
  }

  async sendApplicantAlert(
    careersInbox: string,
    fullName: string,
    position: string,
    applicantId: string,
  ): Promise<void> {
    await this.send({
      to: careersInbox,
      subject: `New application: ${fullName} — ${position}`,
      body: `New applicant submitted via the careers form.

Name: ${fullName}
Position: ${position}
Applicant ID: ${applicantId}

View in the admin dashboard.`,
    });
  }

  async sendLeadConfirmation(toEmail: string, fullName: string): Promise<void> {
    await this.send({
      to: toEmail,
      subject: "Thanks for reaching out — Yuba Media",
      body: `Hi ${fullName},

Thanks for getting in touch with Yuba Media. A member of our team will get back to you within one business day.

— Yuba Media`,
    });
  }

  async sendLeadAlert(
    salesInbox: string,
    fullName: string,
    inquiryType: string,
    leadId: string,
  ): Promise<void> {
    await this.send({
      to: salesInbox,
      subject: `New lead: ${fullName} — ${inquiryType}`,
      body: `New inquiry from the website.

Name: ${fullName}
Type: ${inquiryType}
Lead ID: ${leadId}`,
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log("SMTP connection verified successfully.");
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));

      this.logger.error(
        `SMTP connection verification failed: ${error.message}`,
      );

      return false;
    }
  }
}
