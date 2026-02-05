import { Injectable, Logger } from '@nestjs/common';
import { OpikClientService } from '../ml/opik/opik-client.service';

export interface GoalScores {
  clarity: number;
  actionability: number;
  personalization: number;
  overall: number;
  insights: string[];
}

@Injectable()
export class GoalScoringService {
  private readonly logger = new Logger(GoalScoringService.name);

  constructor(private opikService: OpikClientService) {}

  /**
   * Score a generated goal
   */
  async scoreGoal(
    goalId: string,
    goal: {
      title: string;
      goal: string;
      roadmap: any;
      suggestedPlatforms?: string[];
    },
    userContext?: any,
  ): Promise<GoalScores> {
    const trace = this.opikService.startTrace('goal_quality_scoring', {
      goalId,
    });

    try {
      // Rule-based scoring
      const clarity = this.scoreClarity(goal);
      const actionability = this.scoreActionability(goal);
      const personalization = this.scorePersonalization(goal, userContext);
      const overall = (clarity + actionability + personalization) / 3;

      const scores = {
        clarity: Math.round(clarity * 10) / 10,
        actionability: Math.round(actionability * 10) / 10,
        personalization: Math.round(personalization * 10) / 10,
        overall: Math.round(overall * 10) / 10,
        insights: this.generateInsights(clarity, actionability, personalization),
      };

      // Log to Opik
      const scoringSpan = this.opikService.createSpan(trace, 'scores_calculated', {
        goalId,
        title: goal.title,
      });

      this.opikService.logSpanScore(scoringSpan, 'clarity', scores.clarity);
      this.opikService.logSpanScore(scoringSpan, 'actionability', scores.actionability);
      this.opikService.logSpanScore(scoringSpan, 'personalization', scores.personalization);
      this.opikService.logSpanScore(scoringSpan, 'overall_quality', scores.overall);

      this.opikService.endSpan(scoringSpan, scores);
      this.opikService.endTrace(trace);

      this.logger.log(`Goal scored: ${goalId}, overall=${scores.overall}`);

      return scores;
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('Goal scoring failed', error);
      throw error;
    }
  }

  private scoreClarity(goal: any): number {
    let score = 5;

    // Title quality
    if (goal.title && goal.title.length > 10 && goal.title.length < 100) {
      score += 1.5;
    }

    // Goal description
    if (goal.goal && goal.goal.length > 50) {
      score += 1.5;
    }

    // Has structured roadmap
    if (goal.roadmap && Array.isArray(goal.roadmap) && goal.roadmap.length > 0) {
      score += 2;
    }

    return Math.min(score, 10);
  }

  private scoreActionability(goal: any): number {
    let score = 4;

    // Has roadmap with stages
    if (goal.roadmap && goal.roadmap.length > 0) {
      score += 3;
      
      // Check if roadmap has specific tasks
      const hasTasks = goal.roadmap.some((stage: any) => 
        stage.nodes && stage.nodes.length > 0
      );
      if (hasTasks) score += 2;
    }

    // Has suggested platforms
    if (goal.suggestedPlatforms && goal.suggestedPlatforms.length > 0) {
      score += 1;
    }

    return Math.min(score, 10);
  }

  private scorePersonalization(goal: any, userContext?: any): number {
    let score = 6; // Base score

    if (!userContext) return score;

    // Has suggested platforms based on user's connections
    if (goal.suggestedPlatforms && goal.suggestedPlatforms.length > 0) {
      score += 2;
    }

    // Check if goal aligns with user's past goals
    if (userContext.previousGoals && userContext.previousGoals.length > 0) {
      score += 2;
    }

    return Math.min(score, 10);
  }

  private generateInsights(clarity: number, actionability: number, personalization: number): string[] {
    const insights: string[] = [];

    if (clarity < 6) {
      insights.push('Goal could be more specific and clear');
    } else if (clarity >= 8) {
      insights.push('Well-defined and clear goal');
    }

    if (actionability < 6) {
      insights.push('Add more actionable steps to your roadmap');
    } else if (actionability >= 8) {
      insights.push('Great actionable breakdown!');
    }

    if (personalization < 6) {
      insights.push('Consider connecting more platforms for personalized tracking');
    } else if (personalization >= 8) {
      insights.push('Highly personalized to your workflow');
    }

    return insights;
  }
}