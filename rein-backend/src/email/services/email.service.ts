import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service'; // Adjust path as needed
import * as nodemailer from 'nodemailer';
import {
  EmailType,
  EmailStatus,
  SendEmailOptions,
  WelcomeEmailData,
  StreakReminderData,
  StreakLossData,
  WeeklyDigestData,
} from '../types/email.types';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private fromName: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private templateService: EmailTemplateService,
  ) {
    // Initialize Nodemailer with Gmail
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates (for development)
      },
      pool: true, // Use connection pooling
      maxConnections: 5,
      maxMessages: 100,
    });

    // Add error handler to prevent crashes
    this.transporter.on('error', (error) => {
      this.logger.error(`📧 SMTP connection error: ${error.message}`);
    });

    this.fromEmail = this.configService.get<string>('SMTP_USER') || 'noreply@rein.app';
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'Rein';
    
    // Verify connection
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Email service connected successfully');
    } catch (error) {
      this.logger.error(`❌ Email service connection failed: ${error.message}`);
    }
  }

  /**
   * Core method to send any email via Nodemailer
   */
  private async sendEmail(
    options: SendEmailOptions,
    userId: string,
    emailType: EmailType,
  ): Promise<boolean> {
    try {
      // Check if user has opted out of this email type (Phase 2)
      // For now, we'll skip this check in MVP
      // const hasOptedIn = await this.hasUserOptedIn(userId, emailType);
      // if (!hasOptedIn) {
      //   this.logger.log(`User ${userId} has opted out of ${emailType} emails`);
      //   return false;
      // }

      // Send email via Nodemailer
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      // Log successful send
      await this.logEmail(userId, emailType, EmailStatus.SENT, null, {
        messageId: info.messageId,
        response: info.response,
      });

      this.logger.log(
        `✅ Sent ${emailType} email to ${options.to} (ID: ${info.messageId})`,
      );

      return true;
    } catch (error) {
      // Log failed send
      await this.logEmail(
        userId,
        emailType,
        EmailStatus.FAILED,
        error.message,
        { error: error.toString() },
      );

      this.logger.error(
        `❌ Failed to send ${emailType} email to ${options.to}: ${error.message}`,
      );

      return false;
    }
  }

  /**
   * Send welcome email when user creates first resolution
   */
  async sendWelcomeEmail(
    userEmail: string,
    userId: string,
    data: WelcomeEmailData,
  ): Promise<boolean> {
    const { html, text } = this.templateService.renderWelcomeEmail(data);
    const subject = this.templateService.getWelcomeSubject(data.resolutionTitle);

    return this.sendEmail(
      { to: userEmail, subject, html, text },
      userId,
      EmailType.WELCOME,
    );
  }

  /**
   * Send streak reminder when user hasn't completed tasks today
   */
  async sendStreakReminder(
    userEmail: string,
    userId: string,
    data: StreakReminderData,
  ): Promise<boolean> {
    const { html, text } = this.templateService.renderStreakReminder(data);
    const subject = this.templateService.getStreakReminderSubject(
      data.currentStreak,
    );

    return this.sendEmail(
      { to: userEmail, subject, html, text },
      userId,
      EmailType.STREAK_REMINDER,
    );
  }

  /**
   * Send streak loss alert when streak breaks
   */
  async sendStreakLossAlert(
    userEmail: string,
    userId: string,
    data: StreakLossData,
  ): Promise<boolean> {
    const { html, text } = this.templateService.renderStreakLossAlert(data);
    const subject = this.templateService.getStreakLossSubject(data.lostStreak);

    return this.sendEmail(
      { to: userEmail, subject, html, text },
      userId,
      EmailType.STREAK_LOSS,
    );
  }

  /**
   * Send weekly digest with user's progress
   */
  async sendWeeklyDigest(
    userEmail: string,
    userId: string,
    data: WeeklyDigestData,
  ): Promise<boolean> {
    const { html, text } = this.templateService.renderWeeklyDigest(data);
    const subject = this.templateService.getWeeklyDigestSubject(
      data.weekStats.tasksCompleted,
    );

    return this.sendEmail(
      { to: userEmail, subject, html, text },
      userId,
      EmailType.WEEKLY_DIGEST,
    );
  }

  /**
   * Log email send attempt to database
   */
  private async logEmail(
    userId: string,
    type: EmailType,
    status: EmailStatus,
    errorMessage: string | null,
    metadata?: any,
  ): Promise<void> {
    try {
      await this.prisma.emailLog.create({
        data: {
          userId,
          type,
          status,
          errorMessage,
          metadata: metadata || {},
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log email: ${error.message}`);
    }
  }

  /**
   * Check if user has opted into specific email type (Phase 2)
   */
  private async hasUserOptedIn(
    userId: string,
    emailType: EmailType,
  ): Promise<boolean> {
    try {
      const preferences = await this.prisma.emailPreferences.findUnique({
        where: { userId },
      });

      if (!preferences) return true; // Default to opt-in if no preferences set

      // Map email types to preference fields
      const preferenceMap = {
        [EmailType.WELCOME]: preferences.welcomeEmail,
        [EmailType.STREAK_REMINDER]: preferences.streakReminder,
        [EmailType.STREAK_LOSS]: preferences.streakLossAlert,
        [EmailType.WEEKLY_DIGEST]: preferences.weeklyDigest,
      };

      return preferenceMap[emailType] ?? true;
    } catch (error) {
      this.logger.error(
        `Failed to check email preferences for user ${userId}: ${error.message}`,
      );
      return true; // Default to sending if check fails
    }
  }

  /**
   * Check if email was sent recently to prevent duplicates
   */
  async wasEmailSentRecently(
    userId: string,
    emailType: EmailType,
    hoursAgo: number = 24,
  ): Promise<boolean> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);

      const recentEmail = await this.prisma.emailLog.findFirst({
        where: {
          userId,
          type: emailType,
          status: EmailStatus.SENT,
          sentAt: {
            gte: cutoffTime,
          },
        },
      });

      return !!recentEmail;
    } catch (error) {
      this.logger.error(`Failed to check recent emails: ${error.message}`);
      return false;
    }
  }
}