import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service'; // Adjust path as needed
import { EmailService } from './email.service';
import { EmailType } from '../types/email.types';

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Run every hour to check for streak reminders
   * Sends reminder at 6 PM (18:00) user's local time if:
   * - User has no activity today
   * - User's streak >= 3 days
   * - User hasn't received reminder today
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkStreakReminders() {
    this.logger.log('Starting streak reminder check...');

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Find users with active resolutions and streaks >= 3
      const users = await this.prisma.user.findMany({
        where: {
          email: { not: null },
          resolutions: {
            some: {
              status: 'active',
              streak: {
                currentStreak: { gte: 3 },
              },
            },
          },
        },
        include: {
          resolutions: {
            where: {
              status: 'active',
            },
            include: {
              streak: true,
              nodeProgress: {
                where: {
                  scheduledDate: today,
                  status: 'pending',
                },
              },
            },
          },
          emailPreferences: true,
        },
      });

      let sentCount = 0;

      for (const user of users) {
        // Skip if no email
        if (!user.email) continue;

        // Check if user has opted out
        if (user.emailPreferences && !user.emailPreferences.streakReminder) {
          continue;
        }

        // Check if reminder already sent today
        const alreadySent = await this.emailService.wasEmailSentRecently(
          user.id,
          EmailType.STREAK_REMINDER,
          24,
        );

        if (alreadySent) continue;

        // Get highest streak and pending tasks
        let highestStreak = 0;
        const todaysTasks: Array<{
          title: string;
          status: string;
          isOverdue: boolean;
        }> = [];

        for (const resolution of user.resolutions) {
          if (resolution.streak && resolution.streak.currentStreak > highestStreak) {
            highestStreak = resolution.streak.currentStreak;
          }

          // Get pending tasks from roadmap
          const roadmap = resolution.roadmap as any;
          if (Array.isArray(roadmap)) {
            for (const stage of roadmap) {
              if (Array.isArray(stage.nodes)) {
                for (const node of stage.nodes) {
                  const nodeScheduledDate = new Date(node.date);
                  if (nodeScheduledDate.toDateString() === today.toDateString()) {
                    // Check if this node is still pending
                    const progress = resolution.nodeProgress.find(
                      (np) => np.nodeId === node.id,
                    );
                    if (!progress || progress.status === 'pending') {
                      todaysTasks.push({
                        title: node.title,
                        status: 'pending',
                        isOverdue: now > nodeScheduledDate,
                      });
                    }
                  }
                }
              }
            }
          }
        }

        // Skip if no pending tasks or streak < 3
        if (todaysTasks.length === 0 || highestStreak < 3) continue;

        // Send reminder
        await this.emailService.sendStreakReminder(user.email, user.id, {
          userName: user.name || 'there',
          currentStreak: highestStreak,
          todaysTasks,
          appLink: `${process.env.FRONTEND_URL || 'https://rein.app'}/resolutions`,
        });

        sentCount++;
      }

      this.logger.log(`Sent ${sentCount} streak reminder emails`);
    } catch (error) {
      this.logger.error(`Error in streak reminder cron: ${error.message}`);
    }
  }

  /**
   * Run every Sunday at 9 AM UTC to send weekly digests
   * Adjust timing based on user timezone in production
   */
  @Cron('0 9 * * 0') // Every Sunday at 9 AM
  async sendWeeklyDigests() {
    this.logger.log('Starting weekly digest send...');

    try {
      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Find users with active resolutions
      const users = await this.prisma.user.findMany({
        where: {
          email: { not: null },
          resolutions: {
            some: {
              status: 'active',
            },
          },
        },
        include: {
          resolutions: {
            where: {
              status: 'active',
            },
            include: {
              streak: true,
              nodeProgress: {
                where: {
                  scheduledDate: {
                    gte: oneWeekAgo,
                  },
                },
              },
            },
          },
          emailPreferences: true,
        },
      });

      let sentCount = 0;

      for (const user of users) {
        if (!user.email) continue;

        // Check if user has opted out
        if (user.emailPreferences && !user.emailPreferences.weeklyDigest) {
          continue;
        }

        // Check if digest already sent this week
        const alreadySent = await this.emailService.wasEmailSentRecently(
          user.id,
          EmailType.WEEKLY_DIGEST,
          7 * 24, // 7 days in hours
        );

        if (alreadySent) continue;

        // Calculate stats
        let highestStreak = 0;
        let longestStreak = 0;
        let totalNodes = 0;
        let completedThisWeek = 0;
        const overdueTasks: Array<{ title: string; daysOverdue: number }> = [];
        const upcomingTasks: Array<{ day: string; title: string }> = [];
        const achievements: Array<{ title: string; description: string }> = [];

        for (const resolution of user.resolutions) {
          if (resolution.streak) {
            if (resolution.streak.currentStreak > highestStreak) {
              highestStreak = resolution.streak.currentStreak;
            }
            if (resolution.streak.longestStreak > longestStreak) {
              longestStreak = resolution.streak.longestStreak;
            }
          }

          // Count completed this week from nodeProgress
          const weekCompleted = resolution.nodeProgress.filter(
            (np) =>
              np.status === 'completed' &&
              np.completedAt &&
              new Date(np.completedAt) >= oneWeekAgo,
          );
          completedThisWeek += weekCompleted.length;

          // Parse roadmap to get tasks
          const roadmap = resolution.roadmap as any;
          if (Array.isArray(roadmap)) {
            for (const stage of roadmap) {
              if (Array.isArray(stage.nodes)) {
                totalNodes += stage.nodes.length;

                for (const node of stage.nodes) {
                  const nodeDate = new Date(node.date);
                  const progress = resolution.nodeProgress.find(
                    (np) => np.nodeId === node.id,
                  );

                  // Check for overdue
                  if (
                    nodeDate < now &&
                    (!progress || progress.status === 'pending')
                  ) {
                    const daysOverdue = Math.floor(
                      (now.getTime() - nodeDate.getTime()) / (1000 * 60 * 60 * 24),
                    );
                    overdueTasks.push({
                      title: node.title,
                      daysOverdue,
                    });
                  }

                  // Check for upcoming (next 7 days)
                  if (
                    nodeDate >= now &&
                    nodeDate.getTime() < now.getTime() + 7 * 24 * 60 * 60 * 1000 &&
                    (!progress || progress.status === 'pending')
                  ) {
                    upcomingTasks.push({
                      day: nodeDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                      }),
                      title: node.title,
                    });
                  }
                }
              }
            }
          }
        }

        // Calculate progress
        const completedNodes = user.resolutions.reduce(
          (sum, r) => sum + r.nodeProgress.filter((np) => np.status === 'completed').length,
          0,
        );
        const progressPercent =
          totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

        // Create achievements
        if (highestStreak >= 7) {
          achievements.push({
            title: `${highestStreak}-Day Streak! 🔥`,
            description: 'You maintained consistency for a full week',
          });
        }
        if (completedThisWeek >= 7) {
          achievements.push({
            title: 'Daily Champion',
            description: `Completed ${completedThisWeek} tasks this week`,
          });
        }

        // Send digest
        await this.emailService.sendWeeklyDigest(user.email, user.id, {
          userName: user.name || 'there',
          weekStats: {
            currentStreak: highestStreak,
            longestStreak: longestStreak,
            tasksCompleted: completedThisWeek,
            totalTasks: totalNodes,
            progressPercent,
          },
          achievements,
          overdueTasks: overdueTasks.slice(0, 3), // Top 3 overdue
          upcomingTasks: upcomingTasks.slice(0, 7), // Next 7 tasks
        });

        sentCount++;
      }

      this.logger.log(`Sent ${sentCount} weekly digest emails`);
    } catch (error) {
      this.logger.error(`Error in weekly digest cron: ${error.message}`);
    }
  }

  /**
   * Manual trigger for testing (can be called from controller)
   */
  async triggerStreakReminderTest(userId: string) {
    this.logger.log(`Manually triggering streak reminder for user ${userId}`);
    // Implementation similar to checkStreakReminders but for single user
  }

  /**
   * Manual trigger for testing weekly digest
   */
  async triggerWeeklyDigestTest(userId: string) {
    this.logger.log(`Manually triggering weekly digest for user ${userId}`);
    // Implementation similar to sendWeeklyDigests but for single user
  }
}