import { Injectable } from '@nestjs/common';
import {
  WelcomeEmailData,
  StreakReminderData,
  StreakLossData,
  WeeklyDigestData,
} from '../types/email.types';
import {
  welcomeTemplate,
  welcomeTemplatePlainText,
} from '../templates/welcome.template';
import {
  streakReminderTemplate,
  streakReminderTemplatePlainText,
} from '../templates/streak-reminder.template';
import {
  streakLossTemplate,
  streakLossTemplatePlainText,
} from '../templates/streak-loss.template';
import {
  weeklyDigestTemplate,
  weeklyDigestTemplatePlainText,
} from '../templates/weekly-digest.template';

@Injectable()
export class EmailTemplateService {
  /**
   * Render welcome email template
   */
  renderWelcomeEmail(data: WelcomeEmailData): { html: string; text: string } {
    return {
      html: welcomeTemplate(data),
      text: welcomeTemplatePlainText(data),
    };
  }

  /**
   * Render streak reminder email template
   */
  renderStreakReminder(
    data: StreakReminderData,
  ): { html: string; text: string } {
    return {
      html: streakReminderTemplate(data),
      text: streakReminderTemplatePlainText(data),
    };
  }

  /**
   * Render streak loss alert email template
   */
  renderStreakLossAlert(data: StreakLossData): { html: string; text: string } {
    return {
      html: streakLossTemplate(data),
      text: streakLossTemplatePlainText(data),
    };
  }

  /**
   * Render weekly digest email template
   */
  renderWeeklyDigest(data: WeeklyDigestData): { html: string; text: string } {
    return {
      html: weeklyDigestTemplate(data),
      text: weeklyDigestTemplatePlainText(data),
    };
  }

  /**
   * Generate subject line for welcome email
   */
  getWelcomeSubject(resolutionTitle: string): string {
    return `🎯 Your journey to ${resolutionTitle} begins now!`;
  }

  /**
   * Generate subject line for streak reminder
   */
  getStreakReminderSubject(streak: number): string {
    return `🔥 Don't break your ${streak}-day streak!`;
  }

  /**
   * Generate subject line for streak loss
   */
  getStreakLossSubject(lostStreak: number): string {
    return `⚠️ Your ${lostStreak}-day streak just ended`;
  }

  /**
   * Generate subject line for weekly digest
   */
  getWeeklyDigestSubject(tasksCompleted: number): string {
    return `📊 Your week with Rein: ${tasksCompleted} tasks completed`;
  }
}