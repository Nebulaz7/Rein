import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type Octokit = any;

export interface CreateIssuesRequest {
  resolutionId: string;
  repoName?: string; // Optional - will auto-generate if not provided
  autoCreateRepo?: boolean; // Default true
}

export interface CreatedIssue {
  nodeId: string;
  issueNumber: number;
  issueUrl: string;
  title: string;
}

@Injectable()
export class GitHubIssueService {
  private readonly logger = new Logger(GitHubIssueService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create GitHub issues for all practical nodes in a resolution
   * Automatically creates repo if it doesn't exist
   */
  async createIssuesForResolution(
    userId: string,
    request: CreateIssuesRequest
  ): Promise<{
    success: boolean;
    repoCreated: boolean;
    repoUrl: string;
    createdIssues: CreatedIssue[];
    failedIssues: Array<{ nodeId: string; error: string }>;
  }> {
    this.logger.log(`Creating GitHub issues for resolution ${request.resolutionId}`);

    // Get resolution with roadmap
    const resolution = await this.prisma.resolution.findFirst({
      where: {
        id: request.resolutionId,
        userId,
      },
    });

    if (!resolution) {
      throw new BadRequestException('Resolution not found');
    }

    // Get user's GitHub token
    const githubConnection = await this.prisma.gitHubConnection.findUnique({
      where: { userId },
    });

    if (!githubConnection) {
      throw new BadRequestException(
        'GitHub not connected. Please connect your GitHub account first.'
      );
    }

    // Initialize Octokit
    const octokit = await this.createOctokit(githubConnection.accessToken);

    // Get authenticated user's username
    const { data: user } = await octokit.users.getAuthenticated();
    const repoOwner = user.login;

    // Generate repo name if not provided
    const repoName = request.repoName || this.generateRepoName(resolution.title);

    this.logger.log(`Target repo: ${repoOwner}/${repoName}`);

    // Check if repo exists, create if not
    let repoCreated = false;
    let repoUrl = '';

    try {
      // Try to get the repo
      const { data: repo } = await octokit.repos.get({
        owner: repoOwner,
        repo: repoName,
      });
      repoUrl = repo.html_url;
      this.logger.log(`Repository already exists: ${repoUrl}`);
    } catch (error: any) {
      if (error.status === 404 && (request.autoCreateRepo !== false)) {
        // Repo doesn't exist - create it
        this.logger.log(`Repository not found. Creating new repo: ${repoName}`);
        
        const { data: newRepo } = await octokit.repos.createForAuthenticatedUser({
          name: repoName,
          description: `Learning journey: ${resolution.title}`,
          private: false, // Make public by default (user can change later)
          auto_init: true, // Initialize with README
        });

        repoUrl = newRepo.html_url;
        repoCreated = true;
        this.logger.log(`Repository created: ${repoUrl}`);

        // Wait a moment for GitHub to fully initialize the repo
        await this.sleep(2000);
      } else {
        throw error;
      }
    }

    // Parse roadmap and extract practical nodes
    const roadmap = resolution.roadmap as any;
    const stages = Array.isArray(roadmap) ? roadmap : [];
    
    const practicalNodes = this.extractPracticalNodes(stages);

    if (practicalNodes.length === 0) {
      this.logger.warn('No practical nodes found in resolution');
      return {
        success: true,
        repoCreated,
        repoUrl,
        createdIssues: [],
        failedIssues: [],
      };
    }

    this.logger.log(`Found ${practicalNodes.length} practical nodes to sync`);

    // Create issues for each practical node
    const createdIssues: CreatedIssue[] = [];
    const failedIssues: Array<{ nodeId: string; error: string }> = [];

    for (const { stage, node } of practicalNodes) {
      try {
        const issue = await this.createIssue(
          octokit,
          repoOwner,
          repoName,
          node,
          stage,
          resolution.title
        );

        createdIssues.push({
          nodeId: node.id,
          issueNumber: issue.number,
          issueUrl: issue.html_url,
          title: node.title,
        });

        // Update NodeProgress with GitHub metadata
        await this.prisma.nodeProgress.updateMany({
          where: {
            userId,
            resolutionId: request.resolutionId,
            nodeId: node.id,
          },
          data: {
            githubIssueNumber: issue.number,
            githubIssueUrl: issue.html_url,
          },
        });

        this.logger.log(`Created issue #${issue.number} for node ${node.id}`);
      } catch (error: any) {
        this.logger.error(`Failed to create issue for node ${node.id}: ${error.message}`);
        failedIssues.push({
          nodeId: node.id,
          error: error.message,
        });
      }

      // Rate limit protection
      await this.sleep(1000);
    }

    // Store sync metadata in resolution
    await this.prisma.resolution.update({
      where: { id: request.resolutionId },
      data: {
        githubSynced: true,
        githubRepoUrl: repoUrl,
        githubSyncedAt: new Date(),
      },
    });

    return {
      success: failedIssues.length === 0,
      repoCreated,
      repoUrl,
      createdIssues,
      failedIssues,
    };
  }

  /**
   * Generate a GitHub-friendly repo name from resolution title
   */
  private generateRepoName(title: string): string {
    // Convert to lowercase, replace spaces/special chars with hyphens
    let repoName = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100); // GitHub repo name max length

    // Add "learning" prefix if not already present
    if (!repoName.includes('learning') && !repoName.includes('journey')) {
      repoName = `learning-${repoName}`;
    }

    return repoName;
  }

  /**
   * Extract practical nodes from roadmap stages
   */
  private extractPracticalNodes(
    stages: any[]
  ): Array<{ stage: any; node: any }> {
    const practicalNodes: Array<{ stage: any; node: any }> = [];

    stages.forEach((stage) => {
      if (stage.nodes && Array.isArray(stage.nodes)) {
        stage.nodes.forEach((node: any) => {
          if (node.isPractical === true && node.githubReady === true) {
            practicalNodes.push({ stage, node });
          }
        });
      }
    });

    return practicalNodes;
  }

  /**
   * Create a single GitHub issue with enhanced formatting
   */
  private async createIssue(
    octokit: Octokit,
    owner: string,
    repo: string,
    node: any,
    stage: any,
    resolutionTitle: string
  ) {
    const body = this.formatIssueBody(node, stage, resolutionTitle);

    const response = await octokit.issues.create({
      owner,
      repo,
      title: `🎯 ${node.title}`,
      body,
      labels: [
        'rein-task',
        'practical',
        stage.title.toLowerCase().replace(/\s+/g, '-'),
      ],
    });

    return response.data;
  }

  /**
   * Format issue body with enhanced details
   */
  private formatIssueBody(node: any, stage: any, resolutionTitle: string): string {
    const resources = node.resources || [];
    
    let body = `> **Part of:** ${resolutionTitle}\n`;
    body += `> **Stage:** ${stage.title}\n\n`;
    body += `---\n\n`;
    
    body += `## 🎯 What to Build\n\n${node.description}\n\n`;
    
    body += `## 📅 Scheduled Date\n\n${node.scheduledDate}\n\n`;
    
    if (resources.length > 0) {
      body += `## 📚 Resources\n\n`;
      resources.forEach((resource: any, index: number) => {
        body += `${index + 1}. **[${resource.title}](${resource.link})** *(${resource.type})*\n`;
        if (resource.description) {
          body += `   > ${resource.description}\n\n`;
        }
      });
    }

    body += `## ✅ Completion Checklist\n\n`;
    body += `- [ ] Review all resources above\n`;
    body += `- [ ] Set up project structure\n`;
    body += `- [ ] Implement core functionality\n`;
    body += `- [ ] Test and verify it works\n`;
    body += `- [ ] Commit and push code\n`;
    body += `- [ ] Close this issue (updates your Rein streak automatically)\n\n`;
    
    body += `---\n\n`;
    body += `<sub>🤖 Auto-generated by [Rein](https://rein.app) | `;
    body += `[View in Rein](https://rein.app/resolutions/${node.id})</sub>\n`;

    return body;
  }

  /**
   * Get GitHub sync status for a resolution
   */
  async getSyncStatus(userId: string, resolutionId: string) {
    const resolution = await this.prisma.resolution.findFirst({
      where: {
        id: resolutionId,
        userId,
      },
    });

    if (!resolution) {
      throw new BadRequestException('Resolution not found');
    }

    const nodeProgress = await this.prisma.nodeProgress.findMany({
      where: {
        userId,
        resolutionId,
        githubIssueNumber: { not: null },
      },
    });

    return {
      synced: resolution.githubSynced || false,
      repoUrl: resolution.githubRepoUrl,
      syncedAt: resolution.githubSyncedAt,
      syncedIssueCount: nodeProgress.length,
      issues: nodeProgress.map((np) => ({
        nodeId: np.nodeId,
        issueNumber: np.githubIssueNumber,
        issueUrl: np.githubIssueUrl,
        status: np.status,
      })),
    };
  }

  /**
   * List user's GitHub repositories (for repo selection UI)
   */
  async listUserRepositories(userId: string) {
    const githubConnection = await this.prisma.gitHubConnection.findUnique({
      where: { userId },
    });

    if (!githubConnection) {
      throw new BadRequestException('GitHub not connected');
    }

    const octokit = await this.createOctokit(githubConnection.accessToken);

    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    return repos.map((repo) => ({
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      private: repo.private,
    }));
  }

  /**
   * Helper to create Octokit instance with dynamic import
   */
  private async createOctokit(accessToken: string): Promise<any> {
    const { Octokit } = await import('@octokit/rest');
    return new Octokit({ auth: accessToken });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}