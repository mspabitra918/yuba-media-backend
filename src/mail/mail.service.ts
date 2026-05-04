import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Mailgun from "mailgun.js";
import FormData from "form-data";

export interface MailMessage {
  to: string;
  subject: string;
  body: string;
}

export type ApplicantStatus = "new" | "review" | "interview" | "rejected";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private mailgun: any;
  private domain: string;

  constructor(private readonly config: ConfigService) {
    const mailgun = new Mailgun(FormData);
    this.mailgun = mailgun.client({
      username: "api",
      key: this.config.get<string>("MAILGUN_API_KEY") ?? "",
      url:
        this.config.get<string>("MAILGUN_API_URL") ?? "https://api.mailgun.net",
    });
    this.domain = this.config.get<string>("MAILGUN_DOMAIN") ?? "";
  }

  private async send(payload: MailMessage): Promise<void> {
    try {
      this.logger.log(`Attempting to send email to ${payload.to}...`);
      const response = await this.mailgun.messages.create(this.domain, {
        from: this.config.get<string>(
          "MAILGUN_FROM",
          "Yuba Media <noreply@yubamedia.com>",
        ),
        to: payload.to,
        subject: payload.subject,
        text: payload.body,
      });
      this.logger.log(
        `Email sent successfully to ${payload.to}: ${payload.subject}. ID: ${response.id}`,
      );
    } catch (err: any) {
      this.logger.error(
        `Failed to send email to ${payload.to}`,
        err.stack || err.message || err,
      );
      if (err.details) {
        this.logger.error(`Error details: ${err.details}`);
      }
    }
  }

  async sendApplicantConfirmation(
    toEmail: string,
    fullName: string,
    position: string,
  ) {
    await this.send({
      to: toEmail,
      subject: "We received your application — Yuba Media",
      body: `Hi ${fullName},\n\nThanks for applying for ${position} at Yuba Media. Our team will review your CV and be in touch shortly.\n\n— Yuba Media Talent Team`,
    });
  }

  async sendApplicantStatusUpdate(
    toEmail: string,
    fullName: string,
    position: string,
    status: ApplicantStatus,
  ) {
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

  async sendApplicantAlert(
    careersInbox: string,
    fullName: string,
    position: string,
    applicantId: string,
  ) {
    await this.send({
      to: careersInbox,
      subject: `New application: ${fullName} — ${position}`,
      body: `New applicant submitted via the careers form.\n\nName: ${fullName}\nPosition: ${position}\nApplicant ID: ${applicantId}\n\nView in the admin dashboard.`,
    });
  }

  async sendLeadConfirmation(toEmail: string, fullName: string) {
    await this.send({
      to: toEmail,
      subject: "Thanks for reaching out — Yuba Media",
      body: `Hi ${fullName},\n\nThanks for getting in touch with Yuba Media. A member of our team will get back to you within one business day.\n\n— Yuba Media`,
    });
  }

  async sendLeadAlert(
    salesInbox: string,
    fullName: string,
    inquiryType: string,
    leadId: string,
  ) {
    await this.send({
      to: salesInbox,
      subject: `New lead: ${fullName} — ${inquiryType}`,
      body: `New inquiry from the website.\n\nName: ${fullName}\nType: ${inquiryType}\nLead ID: ${leadId}`,
    });
  }
}
