import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { McpCalendarService } from '../mcp/calendar/mcp-calendar.service';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private prisma: PrismaService,
    private calendarService: McpCalendarService,
  ) {}

  async getIntegrationsStatus(userId: string) {
    const [githubAccount, calendarConnection, slackConnection] = await Promise.all([
      this.prisma.gitHubAccount.findUnique({ where: { userId } }),
      this.prisma.calendarConnection.findUnique({ where: { userId } }),
      this.prisma.slackConnection.findUnique({ where: { userId } }),
    ]);

    return [
      {
        platform: 'github',
        connected: !!githubAccount,
        lastSync: githubAccount?.lastSyncAt?.toISOString(),
        accountInfo: githubAccount
          ? {
              username: githubAccount.username,
            }
          : undefined,
      },
      {
        platform: 'calendar',
        connected: !!calendarConnection,
        lastSync: calendarConnection?.updatedAt?.toISOString(),
        accountInfo: calendarConnection
          ? {
              email: 'Google Calendar',
            }
          : undefined,
      },
      {
        platform: 'slack',
        connected: !!slackConnection,
        lastSync: slackConnection?.updatedAt?.toISOString(),
        accountInfo: slackConnection
          ? {
              username: slackConnection.workspaceName || slackConnection.slackUserName || 'Slack',
            }
          : undefined,
      },
    ];
  }

  async syncCalendarRoadmap(userId: string, resolutionId: string) {
    try {
      // Get the resolution with its roadmap
      const resolution = await this.prisma.resolution.findUnique({
        where: { id: resolutionId },
        select: {
          roadmap: true,
          startDate: true,
        },
      });

      if (!resolution) {
        return {
          success: false,
          error: 'Resolution not found',
        };
      }

      // Sync to calendar using the calendar service
      const result = await this.calendarService.addRoadmapToCalendar(
        userId,
        resolution.roadmap as any,
        {
          startDate: resolution.startDate?.toISOString().split('T')[0],
        },
      );

      if (result.success) {
        this.logger.log(`Synced roadmap to calendar for user ${userId}`);
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to sync calendar:', error);
      return {
        success: false,
        error: error.message || 'Failed to sync calendar',
      };
    }
  }
}
