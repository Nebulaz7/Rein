import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpikClientService } from '../ml/opik/opik-client.service';

export interface PerformanceSummary {
  period: {
    start: string;
    end: string;
    days: number;
  };
  
  activityBreakdown: {
    github: number;
    slack: number;
    calendar: number;
    total: number;
  };
  
  taskDistribution: {
    github: number;
    slack: number;
    calendar: number;
    total: number;
  };
  
  scores: {
    activityScore: number;      // 0-10
    consistencyScore: number;   // 0-10
    overallScore: number;       // 0-10
  };
  
  trends: {
    weekOverWeekChange: number; // percentage
    mostActiveDay: string;      // "Monday", "Tuesday", etc.
    activeDaysCount: number;
    inactiveDaysCount: number;
  };
  
  recommendations: string[];
  
  qualityMetrics: {
    goalClarity: number;        // 0-10 based on resolution completeness
    taskActionability: number;  // 0-10 based on task completion rate
    personalization: number;    // 0-10 based on platform engagement
  };
  
  auditInsights: {
    message: string;
    efficiency: number;         // 0-100
    stability: number;          // 0-100
  };
  
  weeklyProgress: Array<{
    day: string;
    completed: number;
    total: number;
  }>;
  
  historicalInsights: Array<{
    date: string;
    insight: string;
    type: 'achievement' | 'pattern' | 'recommendation';
  }>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private prisma: PrismaService,
    private opikService: OpikClientService,
  ) {}

  /**
   * Get resolution performance summary
   * Calculated on-demand when dashboard loads
   * Uses resolution's actual startDate and endDate from database
   */
  async getPerformanceSummary(
    resolutionId: string,
    days?: number, // Optional override, typically unused
  ): Promise<PerformanceSummary> {
    const trace = this.opikService.startTrace('user_performance_analysis', {
      resolutionId,
    });

    try {
      // Get resolution with start and end dates
      const resolution = await this.prisma.resolution.findUnique({
        where: { id: resolutionId },
        select: { 
          startDate: true, 
          endDate: true,
          createdAt: true,
        },
      });

      if (!resolution) {
        throw new Error('Resolution not found');
      }

      // Use resolution's actual dates, fallback to creation date and now
      const startDate = resolution.startDate || resolution.createdAt;
      const endDate = resolution.endDate || new Date();
      
      // Calculate actual number of days in the resolution period
      const actualDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      this.logger.log(`Analyzing resolution ${resolutionId} from ${startDate.toISOString()} to ${endDate.toISOString()} (${actualDays} days)`);

      // 1. Fetch activities
      const activities = await this.fetchResolutionActivities(resolutionId, startDate, endDate);
      
      const activitiesSpan = this.opikService.createSpan(trace, 'activities_fetched', {
        github_commits: activities.github.length,
        slack_messages: activities.slack.length,
        calendar_events: activities.calendar.length,
      });
      this.opikService.endSpan(activitiesSpan);

      // 2. Calculate scores
      const scores = this.calculateScores(activities, actualDays);
      
      const scoresSpan = this.opikService.createSpan(trace, 'scores_calculated', scores);
      this.opikService.logSpanScore(scoresSpan, 'activity_score', scores.activityScore);
      this.opikService.logSpanScore(scoresSpan, 'consistency_score', scores.consistencyScore);
      this.opikService.logSpanScore(scoresSpan, 'overall_score', scores.overallScore);
      this.opikService.endSpan(scoresSpan);

      // 3. Analyze trends
      const trends = await this.analyzeTrends(resolutionId, activities, startDate, endDate);
      
      const trendsSpan = this.opikService.createSpan(trace, 'trends_analyzed', trends);
      this.opikService.endSpan(trendsSpan);

      // 4. Generate recommendations (AI-powered)
      const recommendations = await this.generateRecommendations(activities, scores, trends, resolutionId);
      
      const recsSpan = this.opikService.createSpan(trace, 'recommendations_generated', {
        count: recommendations.length,
        recommendations,
      });
      this.opikService.endSpan(recsSpan);

      // 5. Calculate quality metrics
      const qualityMetrics = await this.calculateQualityMetrics(resolutionId, scores, activities);
      
      // 6. Generate audit insights
      const auditInsights = this.generateAuditInsights(activities, scores, trends);

      // 7. Generate weekly progress
      const weeklyProgress = this.generateWeeklyProgress(activities, startDate, endDate);

      // 8. Generate historical insights
      const historicalInsights = this.generateHistoricalInsights(activities, trends, scores);

      // 9. Get task distribution by platform from roadmap
      const taskDistribution = await this.getTaskDistributionByPlatform(resolutionId);

      this.opikService.endTrace(trace);

      return {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: actualDays,
        },
        activityBreakdown: {
          github: activities.github.length,
          slack: activities.slack.length,
          calendar: activities.calendar.length,
          total: activities.github.length + activities.slack.length + activities.calendar.length,
        },
        taskDistribution,
        scores,
        trends,
        recommendations,
        qualityMetrics,
        auditInsights,
        weeklyProgress,
        historicalInsights,
      };
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('Performance analysis failed', error);
      throw error;
    }
  }

  /**
   * Fetch all resolution activities
   */
  private async fetchResolutionActivities(
    resolutionId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // First get the resolution to get userId
    const resolution = await this.prisma.resolution.findUnique({
      where: { id: resolutionId },
      select: { userId: true },
    });

    if (!resolution) {
      throw new Error('Resolution not found');
    }

    const userId = resolution.userId;

    // Task completions from NodeProgress for this resolution
    const taskCompletions = await this.prisma.nodeProgress.findMany({
      where: {
        resolutionId,
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'completed',
      },
      orderBy: { completedAt: 'asc' },
      include: {
        resolution: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // GitHub commits for this user
    const githubAccount = await this.prisma.gitHubAccount.findUnique({
      where: { userId },
      include: {
        commits: {
          where: {
            committedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { committedAt: 'asc' },
        },
      },
    });

    // Check for connected integrations
    const calendarConnection = await this.prisma.calendarConnection.findUnique({
      where: { userId },
    });
    
    const slackConnection = await this.prisma.slackConnection.findUnique({
      where: { userId },
    });

    // Combine all activities
    // GitHub: commits from GitHubAccount
    const githubActivities = (githubAccount?.commits || []).map(commit => ({
      type: 'github_commit' as const,
      timestamp: commit.committedAt,
      data: commit,
    }));

    // Tasks: all completed tasks from NodeProgress
    // We attribute all task completions proportionally to connected platforms
    const taskActivities = taskCompletions.map(task => ({
      type: 'task_completion' as const,
      timestamp: task.completedAt!,
      data: task,
    }));

    // Distribute tasks among connected platforms for analytics
    const hasGithub = !!githubAccount;
    const hasSlack = !!slackConnection;
    const hasCalendar = !!calendarConnection;
    const connectedCount = [hasGithub, hasSlack, hasCalendar].filter(Boolean).length;

    return {
      github: [...githubActivities, ...taskActivities],
      slack: hasSlack ? taskActivities : [],
      calendar: hasCalendar ? taskActivities : [],
    };
  }

  /**
   * Calculate performance scores
   */
  private calculateScores(activities: any, days: number) {
    const totalActivities = 
      activities.github.length + 
      activities.slack.length + 
      activities.calendar.length;

    // Activity Score (0-10)
    // Based on: are you doing SOMETHING each day?
    // 0-2 activities/day = low (0-4)
    // 3-7 activities/day = medium (5-7)
    // 8+ activities/day = high (8-10)
    const avgActivitiesPerDay = totalActivities / days;
    let activityScore = 0;
    
    if (avgActivitiesPerDay >= 8) {
      activityScore = Math.min(10, 8 + (avgActivitiesPerDay - 8) * 0.2);
    } else if (avgActivitiesPerDay >= 3) {
      activityScore = 5 + ((avgActivitiesPerDay - 3) / 5) * 3;
    } else {
      activityScore = (avgActivitiesPerDay / 3) * 5;
    }

    // Consistency Score (0-10)
    // How many days were you active vs inactive
    const activitiesByDay = this.groupActivitiesByDay(activities);
    const activeDays = Object.keys(activitiesByDay).length;
    const consistencyScore = (activeDays / days) * 10;

    // Overall Score
    const overallScore = (activityScore + consistencyScore) / 2;

    return {
      activityScore: Math.round(activityScore * 10) / 10,
      consistencyScore: Math.round(consistencyScore * 10) / 10,
      overallScore: Math.round(overallScore * 10) / 10,
    };
  }

  /**
   * Analyze trends
   */
  private async analyzeTrends(
    resolutionId: string,
    activities: any,
    startDate: Date,
    endDate: Date,
  ) {
    // Group by day of week
    const activitiesByDayOfWeek = this.groupActivitiesByDayOfWeek(activities);
    
    // Find most active day
    const mostActiveDay = Object.entries(activitiesByDayOfWeek)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'No data';

    // Count active vs inactive days
    const activitiesByDay = this.groupActivitiesByDay(activities);
    const activeDaysCount = Object.keys(activitiesByDay).length;
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const inactiveDaysCount = totalDays - activeDaysCount;

    // Week-over-week change
    const previousWeekStart = new Date(startDate);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    
    const previousActivities = await this.fetchResolutionActivities(
      resolutionId,
      previousWeekStart,
      startDate,
    );
    
    const currentTotal = 
      activities.github.length + activities.slack.length + activities.calendar.length;
    const previousTotal = 
      previousActivities.github.length + 
      previousActivities.slack.length + 
      previousActivities.calendar.length;
    
    const weekOverWeekChange = previousTotal === 0 
      ? 100 
      : ((currentTotal - previousTotal) / previousTotal) * 100;

    return {
      weekOverWeekChange: Math.round(weekOverWeekChange),
      mostActiveDay,
      activeDaysCount,
      inactiveDaysCount,
    };
  }

  /**
   * Generate AI recommendations using Gemini
   * Only show after 1 completed task or 3 days of activity
   */
  private async generateRecommendations(
    activities: any,
    scores: any,
    trends: any,
    resolutionId: string,
  ): Promise<string[]> {
    const totalActivities = 
      activities.github.length + 
      activities.slack.length + 
      activities.calendar.length;

    // Don't show recommendations until threshold is met
    if (totalActivities === 0 || (totalActivities < 1 && trends.activeDaysCount < 3)) {
      return [];
    }

    try {
      // Start Opik trace
      const trace = this.opikService.startTrace(
        'analytics_recommendations',
        { resolutionId, scores, trends },
      );

      // Platform breakdown
      const githubCount = activities.github.length;
      const slackCount = activities.slack.length;
      const calendarCount = activities.calendar.length;

      const systemPrompt = `You are an expert productivity coach analyzing user performance data.
Generate 3-4 personalized, actionable recommendations based on the analytics.
Be specific, encouraging, and data-driven. Keep each recommendation under 100 characters.
Return a JSON array of strings like this: ["recommendation 1", "recommendation 2", ...]`;

      const userPrompt = `
User Analytics:
- Activity Score: ${scores.activityScore}/10
- Consistency Score: ${scores.consistencyScore}/10
- Overall Score: ${scores.overallScore}/10

Activity Breakdown:
- GitHub: ${githubCount} commits/tasks
- Slack: ${slackCount} messages/tasks
- Calendar: ${calendarCount} events

Trends:
- Most Active Day: ${trends.mostActiveDay}
- Active Days: ${trends.activeDaysCount}
- Week-over-Week Change: ${trends.weekOverWeekChange}%

Generate 3-4 specific recommendations to help this user improve.
`;

      const result = await this.opikService.llmGenerate(
        systemPrompt,
        userPrompt,
        trace,
      );

      // End trace
      this.opikService.endTrace(trace);

      // Parse response
      if (Array.isArray(result)) {
        return result.slice(0, 4);
      } else if (result?.recommendations && Array.isArray(result.recommendations)) {
        return result.recommendations.slice(0, 4);
      }

      // Fallback to rule-based
      return this.getRuleBasedRecommendations(activities, scores, trends);
      
    } catch (error) {
      this.logger.error('Failed to generate AI recommendations:', error.message);
      // Fallback to rule-based
      return this.getRuleBasedRecommendations(activities, scores, trends);
    }
  }

  /**
   * Fallback rule-based recommendations
   */
  private getRuleBasedRecommendations(
    activities: any,
    scores: any,
    trends: any,
  ): string[] {
    const recommendations: string[] = [];

    // Platform-based
    const githubCount = activities.github.length;
    const slackCount = activities.slack.length;
    const calendarCount = activities.calendar.length;

    if (githubCount > slackCount && githubCount > calendarCount) {
      recommendations.push(
        `You're most active on GitHub (${githubCount} commits). Consider setting more code-focused goals.`
      );
    } else if (slackCount > githubCount && slackCount > calendarCount) {
      recommendations.push(
        `You're most engaged on Slack (${slackCount} messages). Leverage this for accountability goals.`
      );
    }

    // Time-based
    if (trends.mostActiveDay && trends.mostActiveDay !== 'No data') {
      recommendations.push(
        `You're most productive on ${trends.mostActiveDay}s. Schedule important tasks on this day.`
      );
    }

    // Consistency
    if (scores.consistencyScore < 5) {
      recommendations.push(
        `Your consistency score is ${scores.consistencyScore}/10. Try to stay active at least 5 days per week.`
      );
    } else if (scores.consistencyScore >= 8) {
      recommendations.push(
        `Great consistency! You've been active ${trends.activeDaysCount} days this week. Keep it up!`
      );
    }

    // Activity level
    if (scores.activityScore < 5) {
      recommendations.push(
        `Your activity level is low. Aim for at least 3-5 meaningful actions per day.`
      );
    }

    // Trends
    if (trends.weekOverWeekChange > 20) {
      recommendations.push(
        `Activity up ${trends.weekOverWeekChange}% from last week! You're on fire 🔥`
      );
    } else if (trends.weekOverWeekChange < -20) {
      recommendations.push(
        `Activity down ${Math.abs(trends.weekOverWeekChange)}% from last week. Let's get back on track!`
      );
    }

    return recommendations.slice(0, 4); // Max 4 recommendations
  }

  /**
   * Helper: Group activities by day
   */
  private groupActivitiesByDay(activities: any): Record<string, number> {
    const byDay: Record<string, number> = {};

    // Group all activities by date
    [...activities.github, ...activities.slack, ...activities.calendar].forEach((activity: any) => {
      const day = new Date(activity.timestamp).toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    return byDay;
  }

  /**
   * Helper: Group activities by day of week
   */
  private groupActivitiesByDayOfWeek(activities: any): Record<string, number> {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const byDayOfWeek: Record<string, number> = {};

    // Group all activities by day of week
    [...activities.github, ...activities.slack, ...activities.calendar].forEach((activity: any) => {
      const dayOfWeek = days[new Date(activity.timestamp).getDay()];
      byDayOfWeek[dayOfWeek] = (byDayOfWeek[dayOfWeek] || 0) + 1;
    });

    return byDayOfWeek;
  }

  /**
   * Calculate quality metrics for Opik quality scores
   */
  private async calculateQualityMetrics(
    resolutionId: string,
    scores: any,
    activities: any,
  ) {
    // Fetch resolution and task data
    const resolution = await this.prisma.resolution.findUnique({
      where: { id: resolutionId },
      include: {
        nodeProgress: {
          select: {
            status: true,
            completedAt: true,
          },
        },
      },
    });

    if (!resolution) {
      return {
        goalClarity: 5.0,
        taskActionability: 5.0,
        personalization: 5.0,
      };
    }

    // Goal Clarity: Based on resolution completeness (title, goal, roadmap, dates)
    let goalClarity = 0;
    if (resolution.title) goalClarity += 2.5;
    if (resolution.goal) goalClarity += 2.5;
    if (resolution.startDate && resolution.endDate) goalClarity += 2.5;
    if (resolution.roadmap) goalClarity += 2.5;

    // Task Actionability: Based on task completion rate
    const totalTasks = resolution.nodeProgress.length;
    const completedTasks = resolution.nodeProgress.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const taskActionability = completionRate * 10;

    // Personalization: Based on platform engagement diversity
    const platformCount = [
      activities.github.length > 0,
      activities.slack.length > 0,
      activities.calendar.length > 0,
    ].filter(Boolean).length;
    
    let personalization = 5.0; // Base score
    if (platformCount === 1) personalization = 6.0;
    if (platformCount === 2) personalization = 8.0;
    if (platformCount === 3) personalization = 10.0;

    return {
      goalClarity: Math.round(goalClarity * 10) / 10,
      taskActionability: Math.round(taskActionability * 10) / 10,
      personalization: Math.round(personalization * 10) / 10,
    };
  }

  /**
   * Generate audit insights
   */
  private generateAuditInsights(
    activities: any,
    scores: any,
    trends: any,
  ) {
    const githubCount = activities.github.length;
    const slackCount = activities.slack.length;
    const calendarCount = activities.calendar.length;
    const total = githubCount + slackCount + calendarCount;

    // Generate contextual message
    let message = '';
    if (total === 0) {
      message = 'No activity detected yet. Start completing tasks to unlock insights.';
    } else if (githubCount > slackCount && githubCount > calendarCount) {
      message = `Your GitHub activity is high (${githubCount} commits), but ${
        calendarCount === 0 ? 'Calendar sessions are missing' : 'Slack engagement is low'
      }. Recommendation: Balance your workflow across platforms.`;
    } else if (slackCount > 0 && calendarCount === 0) {
      message = 'Strong Slack engagement detected. Consider scheduling calendar events to structure your work.';
    } else if (trends.activeDaysCount < 3) {
      message = `Only active ${trends.activeDaysCount} day(s) this period. Try to maintain consistency for better results.`;
    } else {
      message = `Good multi-platform engagement! Most productive on ${trends.mostActiveDay}s.`;
    }

    // Efficiency: Based on activity score
    const efficiency = Math.min(100, Math.round(scores.activityScore * 10));

    // Stability: Based on consistency score  
    const stability = Math.min(100, Math.round(scores.consistencyScore * 10));

    return {
      message,
      efficiency,
      stability,
    };
  }

  /**
   * Generate weekly progress data for charts
   */
  private generateWeeklyProgress(
    activities: any,
    startDate: Date,
    endDate: Date,
  ) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyProgress: Array<{ day: string; completed: number; total: number }> = [];

    // Get activities grouped by day
    const activitiesByDay = this.groupActivitiesByDay(activities);

    // Get last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      const dayOfWeek = days[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Adjust for Monday start

      const completed = activitiesByDay[dayStr] || 0;
      
      weeklyProgress.push({
        day: dayOfWeek,
        completed,
        total: completed, // For now, total = completed (we don't track scheduled tasks per day)
      });
    }

    return weeklyProgress;
  }

  /**
   * Generate historical insights based on activity patterns
   */
  private generateHistoricalInsights(
    activities: any,
    trends: any,
    scores: any,
  ) {
    const insights: Array<{ date: string; insight: string; type: 'achievement' | 'pattern' | 'recommendation' }> = [];
    
    const total = activities.github.length + activities.slack.length + activities.calendar.length;

    // Achievement insights
    if (trends.weekOverWeekChange > 50) {
      insights.push({
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        insight: `Activity increased by ${trends.weekOverWeekChange}% this week - excellent momentum!`,
        type: 'achievement',
      });
    }

    if (scores.consistencyScore >= 8) {
      insights.push({
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        insight: `Maintained ${trends.activeDaysCount} active days - consistency is your strength!`,
        type: 'achievement',
      });
    }

    // Pattern insights
    if (trends.mostActiveDay && trends.mostActiveDay !== 'No data') {
      insights.push({
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        insight: `${trends.mostActiveDay}s are your most productive days. Peak performance detected.`,
        type: 'pattern',
      });
    }

    if (activities.github.length > activities.slack.length + activities.calendar.length) {
      insights.push({
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        insight: `GitHub activity dominates your workflow. Consider balancing with other platforms.`,
        type: 'pattern',
      });
    }

    // Recommendation insights
    if (trends.activeDaysCount < 3 && total > 0) {
      insights.push({
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        insight: `Only ${trends.activeDaysCount} active days detected. Aim for at least 5 days per week.`,
        type: 'recommendation',
      });
    }

    // Return only the 3 most recent insights
    return insights.slice(0, 3);
  }

  /**
   * Get task distribution by platform from roadmap (completed tasks only)
   */
  private async getTaskDistributionByPlatform(resolutionId: string) {
    const resolution = await this.prisma.resolution.findUnique({
      where: { id: resolutionId },
      select: {
        roadmap: true,
        suggestedPlatforms: true,
        nodeProgress: {
          where: {
            status: 'completed',
          },
          select: {
            nodeId: true,
          },
        },
      },
    });

    if (!resolution) {
      return {
        github: 0,
        slack: 0,
        calendar: 0,
        total: 0,
      };
    }

    // Get set of completed node IDs for quick lookup
    const completedNodeIds = new Set(resolution.nodeProgress.map(p => p.nodeId));

    // Get suggested platforms array (fallback to calendar)
    const suggestedPlatforms = (resolution.suggestedPlatforms as string[]) || ['calendar'];

    const roadmap = resolution.roadmap as any;
    const stages = Array.isArray(roadmap) ? roadmap : [];
    
    let githubCount = 0;
    let slackCount = 0;
    let calendarCount = 0;
    
    stages.forEach((stage: any) => {
      if (stage.nodes && Array.isArray(stage.nodes)) {
        stage.nodes.forEach((node: any) => {
          // Only count completed nodes
          if (!completedNodeIds.has(node.id)) {
            return;
          }

          // Determine platform based on node type (same logic as getResolutionTasks)
          let platform = 'calendar'; // Default fallback
          
          // If node is practical/code-related AND GitHub is suggested, use GitHub
          if ((node.isPractical || node.githubReady) && suggestedPlatforms.includes('github')) {
            platform = 'github';
          }
          // Otherwise use the first suggested platform (or calendar fallback)
          else if (suggestedPlatforms.length > 0) {
            platform = suggestedPlatforms[0];
          }

          // Count by platform
          if (platform === 'github') githubCount++;
          else if (platform === 'slack') slackCount++;
          else calendarCount++;
        });
      }
    });

    const total = githubCount + slackCount + calendarCount;

    return {
      github: githubCount,
      slack: slackCount,
      calendar: calendarCount,
      total,
    };
  }
}