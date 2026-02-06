import { Controller, Get, Query, Res, Logger, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { SlackAuthService } from './slack-auth.service';

@Controller('auth/slack')
export class SlackAuthController {
  private readonly logger = new Logger(SlackAuthController.name);

  constructor(private readonly slackOAuthService: SlackAuthService) {}

  /**
   * GET /auth/slack/connect?userId=alice
   * Initiates OAuth flow - redirects user to Slack
   */
  @Get('connect')
  async initiateOAuth(@Query('userId') userId: string, @Res() res: Response) {
    if (!userId) {
      throw new HttpException(
        'userId query parameter required',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(`Initiating OAuth for user: ${userId}`);

    const authUrl = this.slackOAuthService.getAuthorizationUrl(userId);
    return res.redirect(authUrl);
  }

  /**
   * GET /auth/slack/callback?code=xxx&state=yyy
   * Slack redirects here after user authorizes
   */
  @Get('callback')
  async handleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    if (!code || !state) {
      throw new HttpException(
        'Missing code or state parameter',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const connection = await this.slackOAuthService.handleCallback(code, state);
      
      this.logger.log(
        `Successfully connected Slack for user ${connection.userId}`,
      );

      // Redirect back to your frontend with success
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/home`);
    } catch (error) {
      this.logger.error(`OAuth callback failed: ${error.message}`);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/settings?slack=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  /**
   * GET /auth/slack/status?userId=alice
   * Check if user has connected Slack
   */
  @Get('status')
  async getConnectionStatus(@Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException(
        'userId query parameter required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const connection = await this.slackOAuthService.getConnection(userId);
    
    return {
      connected: !!connection,
      workspace: connection?.workspaceName,
      slackUser: connection?.slackUserName,
      connectedAt: connection?.connectedAt,
    };
  }

  /**
   * DELETE /auth/slack/disconnect?userId=alice
   * Disconnect Slack account
   */
  @Get('disconnect')
  async disconnect(@Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException(
        'userId query parameter required',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.slackOAuthService.disconnect(userId);
    
    return {
      success: true,
      message: 'Slack account disconnected',
    };
  }
}