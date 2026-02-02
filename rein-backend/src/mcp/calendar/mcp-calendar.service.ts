import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { ParsedResolution } from '../../common/types/index';
import { PrismaService } from '../../prisma/prisma.service';

interface CalendarEvent {
  summary: string;
  description: string;
  start: { dateTime: string };
  end: { dateTime: string };
  reminders?: { useDefault: boolean };
}

export interface CreatedEvent {
  id?: string | null;
  htmlLink?: string | null;
  summary?: string | null;
}

@Injectable()
export class McpCalendarService {
  private readonly logger = new Logger(McpCalendarService.name);

  constructor(private readonly prisma: PrismaService) {}

  async addRoadmapToCalendar(
    userId: string,
    roadmap: ParsedResolution,
    options: {
      calendarId?: string;
      startDate?: string;
      dryRun?: boolean;
    } = {},
  ) {
    const { calendarId = 'primary', startDate, dryRun = false } = options;

    try {
      const tokens = await this.getTokensFromDb(userId);
      if (!tokens) {
        return { success: false, error: 'Calendar not connected – please connect your Google Calendar' };
      }

      const oauth2Client = this.createOAuthClient(tokens);
      
      // Auto-refresh if expired
      if (tokens.expiry_date && tokens.expiry_date <= Date.now()) {
        this.logger.log('Token expired – refreshing...');
        const { credentials } = await oauth2Client.refreshAccessToken();
        await this.saveTokensToDb(userId, credentials);
        oauth2Client.setCredentials(credentials);
      }

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const events = this.generateEventsFromRoadmap(roadmap, startDate);

      if (dryRun) {
        return {
          success: true,
          dryRun: true,
          eventCount: events.length,
          preview: events.slice(0, 6).map(e => ({
            summary: e.summary,
            date: e.start.dateTime.split('T')[0],
          })),
          message: 'Preview ready. Confirm to create events.',
        };
      }

      const created: CreatedEvent[] = [];
      for (const event of events) {
        try {
          const res = await calendar.events.insert({
            calendarId,
            requestBody: event,
          });
          created.push({
            id: res.data.id,
            htmlLink: res.data.htmlLink,
            summary: res.data.summary,
          });
        } catch (insertError: any) {
          this.logger.warn(`Failed to create event "${event.summary}":`, insertError.message);
        }
      }

      this.logger.log(`Successfully created ${created.length} events for user ${userId}`);
      return {
        success: true,
        eventCount: created.length,
        events: created.filter(e => e.id), // only successful ones
        message: 'Roadmap added to Google Calendar!',
      };
    } catch (error: any) {
      this.logger.error('Calendar MCP failed:', error.message);
      return {
        success: false,
        error: error.message.includes('invalid_grant')
          ? 'Calendar access revoked – please reconnect'
          : error.message || 'Failed to add to calendar',
      };
    }
  }

  private createOAuthClient(tokens: any) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      `${process.env.BACKEND_URL}/mcp/calendar/callback`,
    );
    oauth2Client.setCredentials(tokens);
    return oauth2Client;
  }

  async getTokensFromDb(userId: string): Promise<any | null> {
    const connection = await this.prisma.calendarConnection.findUnique({
      where: { userId },
    });

    if (!connection) {
      this.logger.log(`No calendar connection found for user ${userId}`);
      return null;
    }

    // Convert to Google OAuth token format
    return {
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken,
      token_type: connection.tokenType,
      expiry_date: connection.expiryDate ? Number(connection.expiryDate) : undefined,
      scope: connection.scope,
    };
  }

  private async saveTokensToDb(userId: string, tokens: any): Promise<void> {
    // Convert expiry_date to string to avoid BigInt serialization issues
    const expiryDateString = tokens.expiry_date ? String(tokens.expiry_date) : null;
    
    try {
      await this.prisma.calendarConnection.upsert({
        where: { userId },
        create: {
          userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenType: tokens.token_type,
          expiryDate: expiryDateString,
          scope: tokens.scope,
        },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenType: tokens.token_type,
          expiryDate: expiryDateString,
          scope: tokens.scope,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Saved tokens for user ${userId}`);
    } catch (error: any) {
      this.logger.error('Failed to save calendar tokens:', error.message);
      throw new Error('Failed to save calendar connection');
    }
  }

  async storeTokens(userId: string, tokens: any) {
    this.logger.log(`Storing tokens for user ${userId}`);
    await this.saveTokensToDb(userId, tokens);
    this.logger.log(`Tokens stored successfully for user ${userId}`);
  }

  /**
   * Disconnect calendar - remove tokens from database
   */
  async disconnect(userId: string): Promise<boolean> {
    this.logger.log(`Disconnecting calendar for user ${userId}`);
    
    try {
      await this.prisma.calendarConnection.delete({
        where: { userId },
      });
      this.logger.log(`Calendar disconnected for user ${userId}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to disconnect calendar: ${error.message}`);
      return false;
    }
  }

  // Keep generateEventsFromRoadmap unchanged
  private generateEventsFromRoadmap(roadmap: ParsedResolution, startDateIso?: string): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    let currentDate = startDateIso ? new Date(startDateIso) : new Date();

    for (const stage of roadmap) {
      // Stage kickoff event
      events.push({
        summary: `🚀 Start: ${stage.title}`,
        description: `Stage: ${stage.title} - ${stage.nodes.length} topics to cover`,
        start: { dateTime: new Date(currentDate).toISOString() },
        end: { dateTime: new Date(currentDate.getTime() + 120 * 60 * 1000).toISOString() }, // 2 hours
        reminders: { useDefault: true },
      });

      // One event per node (topic)
      for (const node of stage.nodes) {
        const nodeDate = new Date(currentDate);
        nodeDate.setDate(nodeDate.getDate() + Math.floor(Math.random() * 5) + 1); // spread out

        events.push({
          summary: `📚 ${node.title}`,
          description: `${node.description}\n\nResources:\n${node.resources.map(r => `• ${r.title}: ${r.link}`).join('\n')}`,
          start: { dateTime: nodeDate.toISOString() },
          end: { dateTime: new Date(nodeDate.getTime() + 90 * 60 * 1000).toISOString() }, // 1.5 hours
          reminders: { useDefault: true },
        });
      }

      // Move to next stage (approx 1–2 weeks later)
      currentDate.setDate(currentDate.getDate() + 10 + stage.nodes.length);
    }

    return events;
  }
}