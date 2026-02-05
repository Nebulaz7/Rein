import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { ResolutionService } from './resolution.service';
import { GoalScoringService } from '../analytics/goal-scoring.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('resolution')
export class ResolutionController {
  constructor(
    private readonly resolutionService: ResolutionService,
    private readonly goalScoringService: GoalScoringService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post()
  async create(@Body() body: { userId: string; title: string; goal: string; roadmap: any; suggestedPlatforms?: string[] }) {
    const { userId, title, goal, roadmap, suggestedPlatforms } = body;
    return this.resolutionService.create(userId, title, goal, roadmap, suggestedPlatforms);
  }

  @Get('user/:userId')
  async getAllByUser(@Param('userId') userId: string) {
    return this.resolutionService.findAllByUser(userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Query('userId') userId?: string) {
    const resolution = await this.resolutionService.findOne(id, userId);
    if (!resolution) {
      throw new NotFoundException('Resolution not found');
    }
    return resolution;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Query('userId') userId: string) {
    return this.resolutionService.delete(id, userId);
  }

  @Patch(':id/public')
  async togglePublic(@Param('id') id: string, @Body() body: { userId: string; isPublic: boolean }) {
    return this.resolutionService.togglePublic(id, body.userId, body.isPublic);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string, @Query('userId') userId?: string) {
    const stats = await this.resolutionService.getResolutionStats(id, userId);
    if (!stats) {
      throw new NotFoundException('Resolution not found');
    }
    return stats;
  }

  @Get(':id/tasks')
  async getTasks(@Param('id') id: string, @Query('userId') userId?: string) {
    const tasks = await this.resolutionService.getResolutionTasks(id, userId);
    if (!tasks) {
      throw new NotFoundException('Resolution not found');
    }
    return tasks;
  }

  @Get(':id/tasks/upcoming')
  async getUpcomingTasks(@Param('id') id: string, @Query('userId') userId?: string, @Query('limit') limit?: string) {
    const tasks = await this.resolutionService.getUpcomingTasks(id, userId, limit ? parseInt(limit) : 5);
    if (!tasks) {
      throw new NotFoundException('Resolution not found');
    }
    return tasks;
  }

  @Patch(':id/tasks/:taskId')
  async updateTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: { userId: string; completed: boolean },
  ) {
    return this.resolutionService.updateTaskStatus(id, taskId, body.userId, body.completed);
  }

  @Patch(':id/tasks/:taskId/github')
  async updateTaskGitHub(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: { 
      userId: string; 
      githubIssueUrl?: string;
      githubRepoUrl?: string;
      githubIssueNumber?: number;
      githubDeclined?: boolean;
    },
  ) {
    return this.resolutionService.updateTaskGitHubMetadata(id, taskId, body.userId, {
      githubIssueUrl: body.githubIssueUrl,
      githubRepoUrl: body.githubRepoUrl,
      githubIssueNumber: body.githubIssueNumber,
      githubDeclined: body.githubDeclined,
    });
  }

  @Post(':id/tasks/:taskId/github/decline')
  async declineTaskGitHubSync(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: { userId: string },
  ) {
    return this.resolutionService.updateTaskGitHubMetadata(id, taskId, body.userId, {
      githubDeclined: true,
    });
  }

  @Post('resolutions/:id/score')
async scoreResolution(
  @Param('id') id: string,
  @Body() body: { userContext?: any },
) {
  const resolution = await this.prismaService.resolution.findUnique({
    where: { id },
  });
  
  if (!resolution) {
    throw new NotFoundException('Resolution not found');
  }
  
  // Transform to match expected interface
  const resolutionData = {
    title: resolution.title,
    goal: resolution.goal,
    roadmap: resolution.roadmap,
    suggestedPlatforms: Array.isArray(resolution.suggestedPlatforms) 
      ? resolution.suggestedPlatforms as string[]
      : undefined,
  };
  
  return this.goalScoringService.scoreGoal(id, resolutionData, body.userContext);
}
}