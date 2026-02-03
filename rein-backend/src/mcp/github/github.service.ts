import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { GitHubAccount } from '@prisma/client';

type Octokit = any;

export interface ConnectGitHubDto {
  userId: string;
  code: string; // OAuth code from GitHub
}

export interface GitHubUser {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
  name: string;
}

export interface CreateIssueDto {
  userId: string;
  owner: string;
  repo: string;
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly webhookUrl: string;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {
    // Get from environment variables
    this.clientId = process.env.GITHUB_CLIENT_ID!;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET!;
    this.webhookUrl = process.env.GITHUB_WEBHOOK_URL || 'https://yourapp.com/api/github/webhook';
  }

  /**
   * Step 1: Generate GitHub OAuth URL for user to authorize
   */
  getAuthorizationUrl(userId: string, redirectUri: string): string {
    const scopes = ['user:email', 'repo'].join(' ');
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

    return `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}`;
  }

  /**
   * Step 2: Exchange OAuth code for access token and connect account
   */
  async connectAccount(dto: ConnectGitHubDto): Promise<GitHubAccount> {
    this.logger.log(`Connecting GitHub account for user ${dto.userId}`);

    try {
      // Exchange code for access token
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          'https://github.com/login/oauth/access_token',
          {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code: dto.code,
          },
          {
            headers: { Accept: 'application/json' },
          },
        ),
      );

      const { access_token, scope } = tokenResponse.data;

      if (!access_token) {
        throw new BadRequestException('Failed to get access token from GitHub');
      }

      // Get GitHub user info
      const octokit = await this.createOctokit(access_token);
      const { data: githubUser } = await octokit.users.getAuthenticated();

      // Get user email if not public
      let email = githubUser.email;
      if (!email) {
        try {
          const { data: emails } = await octokit.users.listEmailsForAuthenticatedUser();
          const primaryEmail = emails.find((e) => e.primary);
          email = primaryEmail?.email || emails[0]?.email;
        } catch (error) {
          // Email endpoint might not be accessible, use a fallback
          this.logger.warn('Could not fetch user emails, using fallback');
          email = `${githubUser.login}@users.noreply.github.com`;
        }
      }

      // Check if account already exists
      let account = await this.prisma.gitHubAccount.findUnique({
        where: { userId: dto.userId },
      });

      if (account) {
        // Update existing account
        account = await this.prisma.gitHubAccount.update({
          where: { userId: dto.userId },
          data: {
            githubId: String(githubUser.id),
            username: githubUser.login,
            email,
            avatarUrl: githubUser.avatar_url,
            accessToken: access_token, // Encrypt this in production!
            scopes: scope?.split(',') || [],
            isActive: true,
            metadata: {
              name: githubUser.name,
              bio: githubUser.bio,
              location: githubUser.location,
              publicRepos: githubUser.public_repos,
            },
            lastSyncAt: new Date(),
          },
        });
      } else {
        // Create new account
        account = await this.prisma.gitHubAccount.create({
          data: {
            userId: dto.userId,
            githubId: String(githubUser.id),
            username: githubUser.login,
            email,
            avatarUrl: githubUser.avatar_url,
            accessToken: access_token,
            scopes: scope?.split(',') || [],
            isActive: true,
            metadata: {
              name: githubUser.name,
              bio: githubUser.bio,
              location: githubUser.location,
              publicRepos: githubUser.public_repos,
            },
            lastSyncAt: new Date(),
          },
        });
      }

      this.logger.log(`Successfully connected GitHub account for user ${dto.userId}`);
      return account;
    } catch (error) {
      this.logger.error(`Failed to connect GitHub account: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to connect GitHub account');
    }
  }

  /**
   * Helper to create Octokit instance with dynamic import
   */
  private async createOctokit(accessToken: string): Promise<any> {
    const { Octokit } = await import('@octokit/rest');
    return new Octokit({ auth: accessToken });
  }

  /**
   * Get user's GitHub account
   */
  async getAccount(userId: string): Promise<GitHubAccount> {
    const account = await this.prisma.gitHubAccount.findUnique({
      where: { userId },
    });

    if (!account || !account.isActive) {
      throw new NotFoundException('GitHub account not connected');
    }

    return account;
  }

  /**
   * Disconnect GitHub account
   */
  async disconnectAccount(userId: string): Promise<void> {
    await this.prisma.gitHubAccount.delete({
      where: { userId },
    });
  }

  /**
   * Create a GitHub issue
   */
  async createIssue(dto: CreateIssueDto): Promise<any> {
    this.logger.log(`Creating GitHub issue for user ${dto.userId} in ${dto.owner}/${dto.repo}`);

    try {
      // Get user's GitHub account
      const account = await this.getAccount(dto.userId);

      // Create Octokit instance with user's access token
      const octokit = await this.createOctokit(account.accessToken);

      // Create the issue
      const { data: issue } = await octokit.issues.create({
        owner: dto.owner,
        repo: dto.repo,
        title: dto.title,
        body: dto.body,
        labels: dto.labels,
        assignees: dto.assignees,
      });

      this.logger.log(`Created issue #${issue.number} in ${dto.owner}/${dto.repo}`);

      return {
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        state: issue.state,
        createdAt: issue.created_at,
      };
    } catch (error) {
      this.logger.error(`Failed to create GitHub issue: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create GitHub issue: ${error.message}`);
    }
  }
}