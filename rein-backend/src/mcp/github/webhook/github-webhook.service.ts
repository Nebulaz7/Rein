import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GitHubAccount, GitHubCommit } from '@prisma/client';
import { createHmac } from 'crypto';

@Injectable()
export class GitHubWebhookService {
  private readonly logger = new Logger(GitHubWebhookService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const hmac = createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return digest === signature;
  }

  /**
   * Process webhook event
   */
  async processWebhook(
    accountId: string,
    event: string,
    signature: string,
    payload: any,
  ): Promise<void> {
    this.logger.log(`Processing ${event} webhook for account ${accountId}`);

    // Get account with webhook secret
    const account = await this.prisma.gitHubAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || !account.isActive) {
      throw new UnauthorizedException('Account not found or inactive');
    }

    // Check if webhook secret exists
    if (!account.webhookSecret) {
      throw new UnauthorizedException('Webhook secret not configured');
    }

    // Verify signature
    const payloadString = JSON.stringify(payload);
    const isValid = this.verifySignature(payloadString, signature, account.webhookSecret);

    if (!isValid) {
      this.logger.warn(`Invalid webhook signature for account ${accountId}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Process based on event type
    switch (event) {
      case 'push':
        await this.handlePushEvent(account, payload);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event}`);
    }
  }

  /**
   * Handle push events (commits)
   */
  private async handlePushEvent(account: GitHubAccount, payload: any): Promise<void> {
    const commits = payload.commits || [];
    const repository = payload.repository.full_name;
    const branch = payload.ref.replace('refs/heads/', '');

    this.logger.log(
      `Processing ${commits.length} commits from ${repository}:${branch}`,
    );

    for (const commit of commits) {
      try {
        // Check if already exists
        const existing = await this.prisma.gitHubCommit.findUnique({
          where: {
            repository_commitSha: {
              repository,
              commitSha: commit.id,
            },
          },
        });

        if (existing) {
          this.logger.debug(`Commit ${commit.id} already exists, skipping`);
          continue;
        }

        // Create commit record
        await this.prisma.gitHubCommit.create({
          data: {
            accountId: account.id,
            repository,
            commitSha: commit.id,
            commitMessage: commit.message,
            branch,
            author: {
              name: commit.author.name,
              email: commit.author.email,
              username: commit.author.username,
            },
            url: commit.url,
            committedAt: new Date(commit.timestamp),
            commitData: commit,
            processed: false,
          },
        });

        this.logger.log(`Saved commit ${commit.id} from ${repository}`);

        // You can emit events here for other parts of your app to react
        // this.eventEmitter.emit('github.commit.created', { commit: commitRecord, account });
      } catch (error) {
        this.logger.error(`Failed to save commit ${commit.id}: ${error.message}`);
      }
    }
  }

  /**
   * Get commits by repository
   */
  async getCommitsByRepository(
    accountId: string,
    repository: string,
    limit = 50,
  ): Promise<GitHubCommit[]> {
    return this.prisma.gitHubCommit.findMany({
      where: { accountId, repository },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}