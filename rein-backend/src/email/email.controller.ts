import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { EmailSchedulerService } from './services/email-scheduler.service';

/**
 * Email controller for testing email functionality
 * In production, add authentication guards
 */
@Controller('email')
export class EmailController {
  constructor(
    private emailService: EmailService,
    private schedulerService: EmailSchedulerService,
  ) {}

  /**
   * Test endpoint: Send welcome email
   * POST /email/test/welcome
   */
  @Post('test/welcome')
  async testWelcomeEmail(
    @Body()
    body: {
      email: string;
      userId: string;
      userName: string;
      resolutionTitle: string;
      resolutionId?: string;
    },
  ) {
    const success = await this.emailService.sendWelcomeEmail(
      body.email,
      body.userId,
      {
        userName: body.userName,
        resolutionTitle: body.resolutionTitle,
        totalNodes: 12,
        durationInDays: 90,
        firstNodeTitle: 'Introduction to the basics',
        firstNodeDate: 'Tomorrow, Feb 5',
        resolutionId: body.resolutionId || 'test-resolution-id', // Use provided ID or default
      },
    );

    return {
      success,
      message: success
        ? 'Welcome email sent successfully'
        : 'Failed to send welcome email',
    };
  }

  /**
   * Test endpoint: Send streak reminder
   * POST /email/test/streak-reminder
   */
  @Post('test/streak-reminder')
  async testStreakReminder(
    @Body()
    body: {
      email: string;
      userId: string;
      userName: string;
      currentStreak: number;
    },
  ) {
    const success = await this.emailService.sendStreakReminder(
      body.email,
      body.userId,
      {
        userName: body.userName,
        currentStreak: body.currentStreak,
        todaysTasks: [
          {
            title: 'Complete Module 3: Advanced Concepts',
            status: 'pending',
            isOverdue: false,
          },
          {
            title: 'Review yesterday\'s notes',
            status: 'pending',
            isOverdue: true,
          },
        ],
        appLink: `${process.env.FRONTEND_URL || 'https://rein.app'}/resolutions`,
      },
    );

    return {
      success,
      message: success
        ? 'Streak reminder sent successfully'
        : 'Failed to send streak reminder',
    };
  }

  /**
   * Test endpoint: Send streak loss alert
   * POST /email/test/streak-loss
   */
  @Post('test/streak-loss')
  async testStreakLoss(
    @Body()
    body: {
      email: string;
      userId: string;
      userName: string;
      lostStreak: number;
    },
  ) {
    const success = await this.emailService.sendStreakLossAlert(
      body.email,
      body.userId,
      {
        userName: body.userName,
        lostStreak: body.lostStreak,
        longestStreak: Math.max(body.lostStreak + 5, body.lostStreak),
        lastActivityDate: 'February 2, 2026',
        missedTasksCount: 3,
        currentProgress: 65,
      },
    );

    return {
      success,
      message: success
        ? 'Streak loss alert sent successfully'
        : 'Failed to send streak loss alert',
    };
  }

  /**
   * Test endpoint: Send weekly digest
   * POST /email/test/weekly-digest
   */
  @Post('test/weekly-digest')
  async testWeeklyDigest(
    @Body() body: { email: string; userId: string; userName: string },
  ) {
    const success = await this.emailService.sendWeeklyDigest(
      body.email,
      body.userId,
      {
        userName: body.userName,
        weekStats: {
          currentStreak: 12,
          longestStreak: 15,
          tasksCompleted: 18,
          totalTasks: 25,
          progressPercent: 72,
        },
        achievements: [
          {
            title: '12-Day Streak! 🔥',
            description: 'You maintained consistency for almost 2 weeks',
          },
          {
            title: 'Completed Stage 2',
            description: 'Advanced Concepts - All tasks done!',
          },
        ],
        overdueTasks: [
          {
            title: 'Submit final project',
            daysOverdue: 2,
          },
        ],
        upcomingTasks: [
          { day: 'Monday', title: 'Start Module 4' },
          { day: 'Tuesday', title: 'Complete practice exercises' },
          { day: 'Wednesday', title: 'Review and quiz' },
        ],
      },
    );

    return {
      success,
      message: success
        ? 'Weekly digest sent successfully'
        : 'Failed to send weekly digest',
    };
  }

  /**
   * Test endpoint: Trigger streak reminder cron for specific user
   * POST /email/test/cron/streak-reminder/:userId
   */
  @Post('test/cron/streak-reminder/:userId')
  async testStreakReminderCron(@Param('userId') userId: string) {
    await this.schedulerService.triggerStreakReminderTest(userId);
    return {
      success: true,
      message: 'Streak reminder cron triggered',
    };
  }

  /**
   * Test endpoint: Trigger weekly digest cron for specific user
   * POST /email/test/cron/weekly-digest/:userId
   */
  @Post('test/cron/weekly-digest/:userId')
  async testWeeklyDigestCron(@Param('userId') userId: string) {
    await this.schedulerService.triggerWeeklyDigestTest(userId);
    return {
      success: true,
      message: 'Weekly digest cron triggered',
    };
  }

  /**
   * Health check endpoint
   * GET /email/health
   */
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'email',
      timestamp: new Date().toISOString(),
    };
  }
}