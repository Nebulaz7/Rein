import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResolutionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, title: string, goal: string, roadmap: any) {
    // Ensure user exists in the database
    await this.ensureUserExists(userId);

    // Calculate start and end dates from roadmap
    const { startDate, endDate } = this.extractDatesFromRoadmap(roadmap);

    return await this.prisma.resolution.create({
      data: {
        userId,
        title,
        goal,
        roadmap,
        startDate,
        endDate,
      },
    });
  }

  /**
   * Ensure user exists in database, create if not
   */
  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Create user if doesn't exist
      await this.prisma.user.create({
        data: {
          id: userId,
          email: null,
          name: null,
        },
      });
    }
  }

  async findAllByUser(userId: string) {
    console.log('Finding resolution for userId:', userId);

    const data = await this.prisma.resolution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Query result:', { data });
    return data;
  }

  async findOne(id: string, userId?: string) {
    const whereCondition = userId
      ? {
          id,
          OR: [
            { userId },
            { isPublic: true },
          ],
        }
      : {
          id,
          isPublic: true,
        };

    return await this.prisma.resolution.findFirst({
      where: whereCondition,
    });
  }

  async delete(id: string, userId: string) {
    await this.prisma.resolution.delete({
      where: {
        id,
        userId,
      },
    });

    return { success: true };
  }

  async togglePublic(id: string, userId: string, isPublic: boolean) {
    await this.prisma.resolution.update({
      where: {
        id,
        userId,
      },
      data: {
        isPublic,
      },
    });

    return { success: true };
  }

  async getResolutionStats(id: string, userId?: string) {
    const resolution = await this.findOne(id, userId);
    if (!resolution) {
      return null;
    }

    // Parse roadmap to extract nodes
    const roadmap = resolution.roadmap as any;
    const stages = Array.isArray(roadmap) ? roadmap : [];
    
    let allNodes: any[] = [];
    stages.forEach((stage: any) => {
      if (stage.nodes && Array.isArray(stage.nodes)) {
        allNodes = [...allNodes, ...stage.nodes];
      }
    });

    const totalTasks = allNodes.length;
    const completedTasks = allNodes.filter((node: any) => node.completed === true).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate streak (simplified - days with completed tasks in last 30 days)
    // For now, return a mock value - this would need task completion timestamps
    const streak = 12; // TODO: Implement actual streak calculation with task history

    // Health status based on progress
    let healthStatus = 'getting-started';
    if (progress >= 80) healthStatus = 'elite';
    else if (progress >= 60) healthStatus = 'strong';
    else if (progress >= 40) healthStatus = 'building';

    // AI Coach message (simplified)
    const coachMessage = this.generateCoachMessage(progress, completedTasks, totalTasks, streak);

    // Clean the title and description/goal for display - use different cleaning methods
    const cleanTitle = this.cleanGoalTitle(resolution.title);
    const cleanDescription = this.cleanGoalDescription(resolution.goal);

    // Use stored dates or fallback to calculated dates
    const startDate = resolution.startDate 
      ? resolution.startDate.toISOString().split('T')[0]
      : resolution.createdAt.toISOString().split('T')[0];
    
    const endDate = resolution.endDate
      ? resolution.endDate.toISOString().split('T')[0]
      : this.calculateTargetDate(resolution.createdAt, stages.length);

    return {
      resolution: {
        id: resolution.id,
        title: cleanTitle,
        description: cleanDescription,
        startDate: startDate,
        targetDate: endDate,
      },
      stats: {
        streak,
        progress,
        healthStatus,
        totalTasks,
        completedTasks,
        remainingTasks: totalTasks - completedTasks,
      },
      coachMessage,
    };
  }

  async getResolutionTasks(id: string, userId?: string) {
    const resolution = await this.findOne(id, userId);
    if (!resolution) {
      return null;
    }

    const roadmap = resolution.roadmap as any;
    const stages = Array.isArray(roadmap) ? roadmap : [];
    
    let allTasks: any[] = [];
    stages.forEach((stage: any, stageIndex: number) => {
      if (stage.nodes && Array.isArray(stage.nodes)) {
        const tasksFromNodes = stage.nodes.map((node: any) => ({
          id: node.id,
          title: node.title,
          description: node.description,
          time: node.scheduledDate, // Map scheduledDate to time for display
          completed: node.completed || false,
          platform: 'calendar', // Default to calendar for now
          stageNumber: stageIndex + 1,
          stageTitle: stage.title,
          resources: node.resources || [],
        }));
        allTasks = [...allTasks, ...tasksFromNodes];
      }
    });

    return {
      tasks: allTasks,
      totalCount: allTasks.length,
      completedCount: allTasks.filter((t: any) => t.completed === true).length,
    };
  }

  async getUpcomingTasks(id: string, userId?: string, limit: number = 5) {
    const resolution = await this.findOne(id, userId);
    if (!resolution) {
      return null;
    }

    const roadmap = resolution.roadmap as any;
    const stages = Array.isArray(roadmap) ? roadmap : [];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    let upcomingNodes: any[] = [];
    stages.forEach((stage: any, stageIndex: number) => {
      if (stage.nodes && Array.isArray(stage.nodes)) {
        const nodes = stage.nodes
          .filter((node: any) => !node.completed && node.scheduledDate >= today)
          .map((node: any) => ({
            id: node.id,
            title: node.title,
            description: node.description,
            time: node.scheduledDate,
            completed: node.completed || false,
            platform: 'calendar',
            stageNumber: stageIndex + 1,
            stageTitle: stage.title,
            resources: node.resources || [],
          }));
        upcomingNodes = [...upcomingNodes, ...nodes];
      }
    });

    // Sort by scheduledDate ascending
    upcomingNodes.sort((a, b) => a.time.localeCompare(b.time));

    return {
      tasks: upcomingNodes.slice(0, limit),
      totalUpcoming: upcomingNodes.length,
    };
  }

  async updateTaskStatus(id: string, taskId: string, userId: string, completed: boolean) {
    const resolution = await this.findOne(id, userId);
    if (!resolution) {
      throw new NotFoundException('Resolution not found');
    }

    // Parse and update the roadmap
    const roadmap = resolution.roadmap as any;
    const stages = Array.isArray(roadmap) ? roadmap : [];
    
    let taskFound = false;
    const updatedStages = stages.map((stage: any) => {
      if (stage.nodes && Array.isArray(stage.nodes)) {
        const updatedNodes = stage.nodes.map((node: any) => {
          if (node.id === taskId) {
            taskFound = true;
            return { ...node, completed };
          }
          return node;
        });
        return { ...stage, nodes: updatedNodes };
      }
      return stage;
    });

    if (!taskFound) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.resolution.update({
      where: { id, userId },
      data: { roadmap: updatedStages },
    });

    return { success: true, taskId, completed };
  }

  private calculateTargetDate(startDate: Date, weekCount: number): string {
    const target = new Date(startDate);
    target.setDate(target.getDate() + (weekCount * 7));
    return target.toISOString().split('T')[0];
  }

  private generateCoachMessage(progress: number, completed: number, total: number, streak: number) {
    let message = '';
    let confidence = 0;

    if (progress >= 80) {
      message = `Outstanding progress! You've completed ${completed} out of ${total} tasks. Your ${streak}-day streak shows incredible consistency. Keep this momentum going!`;
      confidence = 95;
    } else if (progress >= 60) {
      message = `Great work! You're ${progress}% through your resolution with ${completed} tasks completed. Your ${streak}-day streak puts you ahead of schedule. Focus on maintaining this pace.`;
      confidence = 88;
    } else if (progress >= 40) {
      message = `Solid progress at ${progress}% completion. You've built a ${streak}-day streak—that's the habit forming. Consider tackling ${Math.min(3, total - completed)} tasks this week to maintain momentum.`;
      confidence = 82;
    } else if (progress >= 20) {
      message = `You're building momentum with ${completed} tasks completed. Your ${streak}-day streak is a great start. Try to increase your daily task completion to reach your goals faster.`;
      confidence = 75;
    } else {
      message = `Every journey starts with a single step! You've begun with ${completed} task${completed !== 1 ? 's' : ''} completed. Focus on building a consistent streak—start with just one task per day.`;
      confidence = 70;
    }

    return { message, confidence };
  }

  private cleanGoalTitle(rawGoal: string): string {
    let cleaned = rawGoal;

    // Remove "Here's what I understood:" and similar intro phrases
    cleaned = cleaned.replace(/^.*?(?:Here's what I understood|Here is what I understood|Understanding)[:\s]*\n*/i, '');
    
    // Extract content after first bullet point (handles both **text** and plain text)
    // Match the first bullet point line
    const firstBulletMatch = cleaned.match(/^[•\-*]\s*(.+?)(?:\n|$)/m);
    if (firstBulletMatch) {
      cleaned = firstBulletMatch[1].trim();
    } else {
      // If no bullet, try to get first line
      const lines = cleaned.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        cleaned = lines[0];
      }
    }
    
    // Remove all markdown formatting
    cleaned = cleaned
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/^[•\-*]\s+/gm, '') // Remove any remaining bullet points
      .trim();

    // Get just the first sentence if it's too long
    if (cleaned.length > 200) {
      const sentences = cleaned.split(/[.!?]\s+/);
      cleaned = sentences[0] + (sentences[0].endsWith('.') ? '' : '.');
    }

    return cleaned;
  }

  private cleanGoalDescription(rawGoal: string): string {
    let cleaned = rawGoal;

    // Remove "Here's what I understood:" and similar intro phrases
    cleaned = cleaned.replace(/^.*?(?:Here's what I understood|Here is what I understood|Understanding)[:\s]*\n*/i, '');
    
    // Keep all bullet points but clean them up
    // Just trim and ensure proper formatting
    cleaned = cleaned.trim();

    // If we still have the intro phrase somehow, remove it
    if (cleaned.toLowerCase().includes("here's what i understood") || 
        cleaned.toLowerCase().includes("here is what i understood")) {
      const lines = cleaned.split('\n').filter(line => 
        !line.toLowerCase().includes("here's what i understood") &&
        !line.toLowerCase().includes("here is what i understood")
      );
      cleaned = lines.join('\n');
    }

    return cleaned;
  }

  private extractDatesFromRoadmap(roadmap: any): { startDate: Date; endDate: Date } {
    const stages = Array.isArray(roadmap) ? roadmap : [];
    
    if (stages.length === 0) {
      // Default to 30 days if no roadmap
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 30);
      return { startDate: start, endDate: end };
    }

    // Find the earliest startDate and latest endDate from all stages
    let earliestStart: Date | null = null;
    let latestEnd: Date | null = null;

    stages.forEach((stage: any) => {
      if (stage.startDate) {
        const startDate = new Date(stage.startDate);
        if (!earliestStart || startDate < earliestStart) {
          earliestStart = startDate;
        }
      }
      if (stage.endDate) {
        const endDate = new Date(stage.endDate);
        if (!latestEnd || endDate > latestEnd) {
          latestEnd = endDate;
        }
      }
    });

    // Fallback if dates are not found in roadmap
    if (!earliestStart || !latestEnd) {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + (stages.length * 7)); // Assume 1 week per stage
      return { startDate: start, endDate: end };
    }

    return { startDate: earliestStart, endDate: latestEnd };
  }
}