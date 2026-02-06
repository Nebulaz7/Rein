import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnchorService } from '../../anchor/anchor.service';
import { CommitmentStatus } from '../../anchor/types/anchor.types';
import { LazyJobScheduler } from '../../common/lazy-job-scheduler.service';

@Injectable()
export class SlackSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SlackSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private anchorService: AnchorService,
    private lazyJobScheduler: LazyJobScheduler,
  ) {}

  /**
   * Register jobs on module init
   */
  async onModuleInit() {
    // Register Slack reminder job (runs every 1 hour)
    this.lazyJobScheduler.registerJob(
      'slack-reminders',
      1, // every 1 hour
      () => this.checkSlackReminders(),
    );

    // Register pending commitments check (runs every 1 hour)
    this.lazyJobScheduler.registerJob(
      'slack-pending-commitments',
      1, // every 1 hour
      () => this.checkPendingCommitments(),
    );
  }

  /**
   * Check for Slack reminders
   * Sends reminder if:
   * - User has Slack connected
   * - User has pending tasks for today
   * - User's streak >= 3 days
   * - User hasn't received reminder today
   */
  async checkSlackReminders() {
    this.logger.log('Starting Slack reminder check...');

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // First, get all connected Slack users
      const slackConnections = await this.prisma.slackConnection.findMany({
        select: {
          userId: true,
        },
      });

      const connectedUserIds = slackConnections.map((sc) => sc.userId);

      // Find users with active resolutions and streaks >= 3
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: connectedUserIds },
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
        },
      });

      let sentCount = 0;

      for (const user of users) {

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

        // Check if we already sent a reminder for this user today
        const recentCommitments = await this.anchorService.getCommitmentsByUser(
          user.id,
        );

        const sentToday = recentCommitments.some((commitment) => {
          const commitmentDate = new Date(commitment.createdAt);
          return commitmentDate.toDateString() === today.toDateString();
        });

        if (sentToday) {
          this.logger.log(`Skipping user ${user.id} - already sent today`);
          continue;
        }

        // Create commitment and send reminder
        const taskList = todaysTasks.map((t) => t.title).join('\n• ');
        const commitmentText = `Don't break your ${highestStreak}-day streak! Complete today's tasks:\n• ${taskList}`;

        try {
          // Get user's Slack connection to get the channel/DM
          const slackConnection = await this.prisma.slackConnection.findUnique({
            where: { userId: user.id },
          });

          if (!slackConnection) {
            this.logger.warn(`User ${user.id} has no Slack connection`);
            continue;
          }

          // Create commitment
          const commitment = await this.anchorService.createCommitment({
            userId: user.id,
            platformUserId: slackConnection.slackUserId,
            commitmentText,
            deadline: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            channelOrDm: slackConnection.slackUserId, // DM to user
          });

          if (commitment.success && commitment.commitmentId) {
            // Send initial reminder
            await this.anchorService.sendReminder(commitment.commitmentId);
            sentCount++;
            this.logger.log(
              `Sent Slack reminder to user ${user.id} (streak: ${highestStreak}, tasks: ${todaysTasks.length})`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to send Slack reminder to user ${user.id}: ${error.message}`,
          );
        }
      }

      this.logger.log(`Sent ${sentCount} Slack reminders`);
    } catch (error) {
      this.logger.error(`Error in Slack reminder job: ${error.message}`);
    }
  }

  /**
   * Check for commitments that need follow-up reminders
   * Note: This is a simplified version - full reminder logic is in AnchorService
   */
  async checkPendingCommitments() {
    this.logger.log('Checking pending commitments for follow-ups...');

    try {
      const allCommitments = await this.anchorService.getAllCommitments();

      let followUpCount = 0;
      let escalateCount = 0;

      for (const commitment of allCommitments) {
        // Skip if already done or escalated
        if (
          commitment.status === CommitmentStatus.DONE ||
          commitment.status === CommitmentStatus.ESCALATED
        ) {
          continue;
        }

        // Check if commitment is overdue
        const now = new Date();
        const deadline = new Date(commitment.deadline);
        const isOverdue = now > deadline;

        if (!commitment.reminders || commitment.reminders.length === 0) {
          continue;
        }

        const lastReminder = commitment.reminders[0]; // Already sorted by desc
        const lastReminderTime = new Date(lastReminder.sentAt);
        const hoursSinceLastReminder =
          (now.getTime() - lastReminderTime.getTime()) / (1000 * 60 * 60);

        // Send follow-up every 4 hours, max 3 reminders
        if (hoursSinceLastReminder >= 4 && commitment.reminders.length < 3) {
          await this.anchorService.sendReminder(commitment.id);
          followUpCount++;
          this.logger.log(
            `Sent follow-up reminder for commitment ${commitment.id}`,
          );
        }

        // Escalate if max reminders reached and still pending/overdue
        if (
          commitment.reminders.length >= 3 &&
          (commitment.status === CommitmentStatus.PENDING ||
            commitment.status === CommitmentStatus.OVERDUE) &&
          isOverdue
        ) {
          await this.anchorService.escalateUnresponsive(
            commitment.id,
            'Maximum reminders reached without response',
          );
          escalateCount++;
          this.logger.log(`Escalated commitment ${commitment.id}`);
        }
      }

      this.logger.log(
        `Sent ${followUpCount} follow-up reminders, escalated ${escalateCount} commitments`,
      );
    } catch (error) {
      this.logger.error(`Error checking pending commitments: ${error.message}`);
    }
  }

  /**
   * Test method to trigger Slack reminder for specific user
   */
  async triggerSlackReminderTest(userId: string): Promise<void> {
    this.logger.log(`Testing Slack reminder for user ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        resolutions: {
          where: { status: 'active' },
          include: { streak: true },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has Slack connected
    const slackConnection = await this.prisma.slackConnection.findUnique({
      where: { userId: user.id },
    });

    if (!slackConnection) {
      throw new Error('User does not have Slack connected');
    }

    const highestStreak =
      Math.max(...user.resolutions.map((r) => r.streak?.currentStreak || 0)) ||
      0;

    const commitment = await this.anchorService.createCommitment({
      userId: user.id,
      platformUserId: slackConnection.slackUserId,
      commitmentText: `Test reminder: Keep your ${highestStreak}-day streak going!`,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      channelOrDm: slackConnection.slackUserId, // DM to user
    });

    if (commitment.success && commitment.commitmentId) {
      await this.anchorService.sendReminder(commitment.commitmentId);
      this.logger.log(`Test Slack reminder sent to user ${userId}`);
    }
  }
}
