import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GitHubService } from './github.service';

// You'll need to implement your own auth guard
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('github')
// @UseGuards(JwtAuthGuard) // Uncomment when you have auth
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  /**
   * Get GitHub OAuth authorization URL
   * GET /github/auth-url?redirect_uri=...&userId=...
   */
  @Get('auth-url')
  getAuthUrl(
    @Query('redirect_uri') redirectUri: string, 
    @Query('userId') userId: string,
    @Request() req: any
  ) {
    // Prefer query param userId, fallback to authenticated user
    const actualUserId = userId || req.user?.id || 'temp-user-id';
    return {
      url: this.githubService.getAuthorizationUrl(actualUserId, redirectUri),
    };
  }

  /**
   * Connect GitHub account (called after OAuth callback)
   * POST /github/connect
   * Body: { code: "github_oauth_code", userId: "user-id" }
   */
  @Post('connect')
  async connect(
    @Body('code') code: string, 
    @Body('userId') userId: string,
    @Request() req: any
  ) {
    // Prefer body userId, fallback to authenticated user
    const actualUserId = userId || req.user?.id || 'temp-user-id';
    
    const account = await this.githubService.connectAccount({
      userId: actualUserId,
      code,
    });

    return {
      success: true,
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        avatarUrl: account.avatarUrl,
        connectedAt: account.connectedAt,
      },
    };
  }

  /**
   * Get current user's GitHub account
   * GET /github/account?userId=...
   */
  @Get('account')
  async getAccount(
    @Query('userId') userId: string,
    @Request() req: any
  ) {
    // Prefer query param userId, fallback to authenticated user
    const actualUserId = userId || req.user?.id || 'temp-user-id';
    const account = await this.githubService.getAccount(actualUserId);

    return {
      id: account.id,
      username: account.username,
      email: account.email,
      avatarUrl: account.avatarUrl,
      connectedAt: account.connectedAt,
      lastSyncAt: account.lastSyncAt,
      isActive: account.isActive,
    };
  }

  /**
   * Disconnect GitHub account
   * DELETE /github/account?userId=...
   */
  @Delete('account')
  async disconnect(
    @Query('userId') userId: string,
    @Request() req: any
  ) {
    // Prefer query param userId, fallback to authenticated user
    const actualUserId = userId || req.user?.id || 'temp-user-id';
    await this.githubService.disconnectAccount(actualUserId);

    return {
      success: true,
      message: 'GitHub account disconnected',
    };
  }

  /**
   * Create a GitHub issue
   * POST /github/issues
   * Body: { owner: string, repo: string, title: string, body?: string, labels?: string[], assignees?: string[] }
   */
  @Post('issues')
  async createIssue(
    @Body() body: {
      owner: string;
      repo: string;
      title: string;
      body?: string;
      labels?: string[];
      assignees?: string[];
    },
    @Query('userId') userId: string,
    @Request() req: any,
  ) {
    const actualUserId = userId || req.user?.id || 'temp-user-id';
    
    const issue = await this.githubService.createIssue({
      userId: actualUserId,
      owner: body.owner,
      repo: body.repo,
      title: body.title,
      body: body.body,
      labels: body.labels,
      assignees: body.assignees,
    });

    return {
      success: true,
      issue,
    };
  }
}