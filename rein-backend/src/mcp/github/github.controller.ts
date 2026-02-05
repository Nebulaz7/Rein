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
import { GitHubIssueService, CreateIssuesRequest } from './github-issue.service';
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

  /**
   * Create a GitHub repository
   * POST /github/create-repo
   * Body: { name: string, description?: string, private?: boolean, userId: string }
   */
  @Post('create-repo')
  async createRepository(
    @Body() body: {
      name: string;
      description?: string;
      private?: boolean;
      autoInit?: boolean;
    },
    @Query('userId') userId: string,
    @Request() req: any,
  ) {
    const actualUserId = userId || req.user?.id || 'temp-user-id';
    
    const repo = await this.githubService.createRepository({
      userId: actualUserId,
      name: body.name,
      description: body.description,
      private: body.private,
      autoInit: body.autoInit,
    });

    return {
      success: true,
      repository: repo,
    };
  }

  /**
   * Create a GitHub issue for a roadmap task
   * POST /github/create-issue
   * Body: { repoUrl: "owner/repo", task: TaskData, userId: string }
   */
  @Post('create-issue')
  async createIssueForTask(
    @Body() body: {
      repoUrl: string; // format: "owner/repo"
      task: {
        title: string;
        description: string;
        scheduledDate?: string;
        stageTitle?: string;
        resources?: Array<{ type: string; title: string; url: string }>;
      };
      labels?: string[];
    },
    @Query('userId') userId: string,
    @Request() req: any,
  ) {
    const actualUserId = userId || req.user?.id || 'temp-user-id';
    
    // Parse owner/repo from repoUrl
    const [owner, repo] = body.repoUrl.split('/');
    
    if (!owner || !repo) {
      return {
        success: false,
        error: 'Invalid repository URL. Expected format: owner/repo',
      };
    }

    // Format task as GitHub issue markdown
    const issueBody = this.githubService.formatTaskAsIssue(body.task);
    
    // Default labels for learning tasks
    const labels = body.labels || ['rein-ai', 'learning-task'];
    
    const issue = await this.githubService.createIssue({
      userId: actualUserId,
      owner,
      repo,
      title: body.task.title,
      body: issueBody,
      labels,
    });

    return {
      success: true,
      issue,
      repoUrl: body.repoUrl,
    };
  }

  /**
   * Get user's GitHub repositories
   * GET /github/repositories?userId=...
   */
  @Get('repositories')
  async getRepositories(
    @Query('userId') userId: string,
    @Query('sort') sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'updated',
    @Request() req: any,
  ) {
    const actualUserId = userId || req.user?.id || 'temp-user-id';
    
    const repos = await this.githubService.getUserRepositories(actualUserId, { sort });

    return {
      success: true,
      repositories: repos,
    };
  }
}