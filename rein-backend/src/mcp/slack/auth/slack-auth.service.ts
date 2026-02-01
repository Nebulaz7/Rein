import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class SlackAuthService {
  private readonly logger = new Logger(SlackAuthService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly prisma: PrismaService) {
    this.clientId = process.env.SLACK_CLIENT_ID!;
    this.clientSecret = process.env.SLACK_CLIENT_SECRET!;
    this.redirectUri = process.env.SLACK_REDIRECT_URI!; 

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error(
        'Missing Slack OAuth config: SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_REDIRECT_URI',
      );
    }

    this.logger.log('Slack OAuth service initialized');
  }

  /**
   * Generate authorization URL for user to visit
   */
  getAuthorizationUrl(userId: string): string {
    // Encode userId in state parameter (in production, use signed tokens)
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: 'chat:write,users:read,im:write',
      redirect_uri: this.redirectUri,
      state,
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  /**
   * Handle OAuth callback - exchange code for access token
   */
  async handleCallback(code: string, state: string) {
    // Decode userId from state
    const { userId } = JSON.parse(
      Buffer.from(state, 'base64').toString('utf-8'),
    );

    this.logger.log(`Processing OAuth callback for user: ${userId}`);

    try {
      // Exchange code for access token
      const response = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const data = response.data;

      if (!data.ok) {
        throw new Error(data.error || 'Slack OAuth failed');
      }

      // Store connection in database
      const connection = await this.prisma.slackConnection.upsert({
        where: { userId },
        create: {
          userId,
          workspaceId: data.team.id,
          workspaceName: data.team.name,
          botAccessToken: data.access_token,
          slackUserId: data.authed_user.id,
          slackUserName: data.authed_user.id, // We'll fetch the real name separately
          scope: data.scope,
        },
        update: {
          workspaceId: data.team.id,
          workspaceName: data.team.name,
          botAccessToken: data.access_token,
          slackUserId: data.authed_user.id,
          scope: data.scope,
          updatedAt: new Date(),
        },
      });

      // Optionally fetch user's real name
      await this.updateUserName(connection.userId, connection.botAccessToken);

      return connection;
    } catch (error) {
      this.logger.error(`OAuth exchange failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user's Slack connection
   */
  async getConnection(userId: string) {
    return this.prisma.slackConnection.findUnique({
      where: { userId },
    });
  }

  /**
   * Disconnect Slack account
   */
  async disconnect(userId: string) {
    const connection = await this.prisma.slackConnection.findUnique({
      where: { userId },
    });

    if (connection) {
      // Optionally revoke token with Slack
      try {
        await axios.post(
          'https://slack.com/api/auth.revoke',
          {},
          {
            headers: {
              Authorization: `Bearer ${connection.botAccessToken}`,
            },
          },
        );
      } catch (error) {
        this.logger.warn(`Failed to revoke Slack token: ${error.message}`);
      }

      // Delete from database
      await this.prisma.slackConnection.delete({
        where: { userId },
      });
    }
  }

  /**
   * Fetch and update user's display name from Slack
   */
  private async updateUserName(userId: string, botToken: string) {
    try {
      const connection = await this.prisma.slackConnection.findUnique({
        where: { userId },
      });

      if (!connection) return;

      const response = await axios.get('https://slack.com/api/users.info', {
        params: { user: connection.slackUserId },
        headers: {
          Authorization: `Bearer ${botToken}`,
        },
      });

      if (response.data.ok) {
        await this.prisma.slackConnection.update({
          where: { userId },
          data: {
            slackUserName: response.data.user.real_name || response.data.user.name,
          },
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch user name: ${error.message}`);
    }
  }
}