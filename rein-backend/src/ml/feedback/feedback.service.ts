import { Injectable, Logger } from '@nestjs/common';
import { OpikClientService } from '../opik/opik-client.service';


@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private opikService: OpikClientService) {}

  async logResolutionFeedback(
    goalId: string,
    traceId: string,
    feedback: {
      rating: number; // 1-5
      feedback?: string;
      usefulness?: boolean;
      clarity?: boolean;
      motivation?: boolean;
    },
  ): Promise<void> {
    const trace = this.opikService.startTrace('feedback_resolution', {
      goalId,
      originalTraceId: traceId,
    });

    try {
      const feedbackData = {
        type: 'resolution_rating',
        rating: feedback.rating,
        usefulness: feedback.usefulness,
        clarity: feedback.clarity,
        motivation: feedback.motivation,
        feedback_text: feedback.feedback || '',
        timestamp: new Date().toISOString(),
      };

      const span = this.opikService.createSpan(
        trace,
        'feedback_logged',
        feedbackData,
      );

      this.opikService.endSpan(span, { success: true });
      this.opikService.endTrace(trace);

      this.logger.log(
        `Resolution feedback logged: rating=${feedback.rating}, goalId=${goalId}`,
      );
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('Failed to log resolution feedback', error);
      throw error;
    }
  }

  async logPlanFeedback(
    planId: string,
    traceId: string,
    feedback: {
      rating: number; 
      feasibility?: number; 
      clarity?: number; 
      motivation?: number; 
      feedback?: string;
    },
  ): Promise<void> {
    const trace = this.opikService.startTrace('feedback_plan', {
      planId,
      originalTraceId: traceId,
    });

    try {
      const feedbackData = {
        type: 'plan_rating',
        rating: feedback.rating,
        feasibility: feedback.feasibility,
        clarity: feedback.clarity,
        motivation: feedback.motivation,
        feedback_text: feedback.feedback || '',
        timestamp: new Date().toISOString(),
      };

      const span = this.opikService.createSpan(trace, 'feedback_logged', {
        ...feedbackData,
      });

      this.opikService.endSpan(span, { success: true });
      this.opikService.endTrace(trace);

      this.logger.log(
        `Plan feedback logged: rating=${feedback.rating}, planId=${planId}`,
      );
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('Failed to log plan feedback', error);
      throw error;
    }
  }

  /**
   * Log user completion or progress update
   */
  async logProgressFeedback(
    goalId: string,
    feedback: {
      completed: boolean;
      completionPercentage?: number;
      checkinNotes?: string;
      difficulty?: number; // 1-5
      motivation?: number; // 1-5
    },
  ): Promise<void> {
    const trace = this.opikService.startTrace('feedback_progress', { goalId });

    try {
      const feedbackData = {
        type: 'progress_update',
        completed: feedback.completed,
        completion_percentage: feedback.completionPercentage,
        checkin_notes: feedback.checkinNotes || '',
        difficulty: feedback.difficulty,
        motivation: feedback.motivation,
        timestamp: new Date().toISOString(),
      };

      const span = this.opikService.createSpan(trace, 'progress_feedback', {
        ...feedbackData,
      });

      this.opikService.endSpan(span, feedbackData);
      this.opikService.endTrace(trace);

      this.logger.log(
        `Progress feedback logged: completed=${feedback.completed}, goalId=${goalId}`,
      );
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('Failed to log progress feedback', error);
      throw error;
    }
  }

  /**
   * Log coaching session feedback
   */
  async logCoachingSessionFeedback(
    sessionId: string,
    userId: string,
    feedback: {
      helpfulness: number; // 1-5
      relevance: number; // 1-5
      motivation: number; // 1-5
      actionability: number; // 1-5
      additionalFeedback?: string;
    },
  ): Promise<void> {
    const trace = this.opikService.startTrace('feedback_coaching_session', {
      sessionId,
      userId,
    });

    try {
      const feedbackData = {
        type: 'coaching_session_feedback',
        helpfulness: feedback.helpfulness,
        relevance: feedback.relevance,
        motivation: feedback.motivation,
        actionability: feedback.actionability,
        additional_feedback: feedback.additionalFeedback || '',
        timestamp: new Date().toISOString(),
      };

      const span = this.opikService.createSpan(
        trace,
        'session_feedback',
        feedbackData,
      );

      this.opikService.endSpan(span, feedbackData);
      this.opikService.endTrace(trace);

      this.logger.log(
        `Coaching session feedback logged: sessionId=${sessionId}`,
      );
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('Failed to log coaching session feedback', error);
      throw error;
    }
  }

  /**
   * Aggregate feedback across multiple sessions
   */
  async aggregateFeedbackMetrics(
    userId: string,
    timeWindow?: {
      startDate: Date;
      endDate: Date;
    },
  ): Promise<{
    averageRating: number;
    feedbackCount: number;
    trends: {
      clarity: number;
      usefulness: number;
      motivation: number;
    };
  }> {
    const trace = this.opikService.startTrace('feedback_aggregation', {
      userId,
    });

    try {
      // In a real implementation, this would query from a metrics database
      // For now, returning a template structure
      const aggregatedMetrics = {
        averageRating: 4.2,
        feedbackCount: 15,
        trends: {
          clarity: 0.85,
          usefulness: 0.88,
          motivation: 0.92,
        },
      };

      const span = this.opikService.createSpan(
        trace,
        'metrics_aggregated',
        aggregatedMetrics,
      );

      this.opikService.endSpan(span, aggregatedMetrics);
      this.opikService.endTrace(trace);

      return aggregatedMetrics;
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('Failed to aggregate feedback metrics', error);
      throw error;
    }
  }
}
