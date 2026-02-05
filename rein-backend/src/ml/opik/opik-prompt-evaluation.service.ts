import { Injectable, Logger } from '@nestjs/common';
import { OpikPromptRegistryService } from './opik-prompt-registry.service';

/**
 * Evaluation metrics for prompt performance
 */
export interface PromptEvaluationMetrics {
  promptId: string;
  promptVersion: string;
  evaluationName: string;
  score: number;
  maxScore: number;
  percentage: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Results from a prompt evaluation
 */
export interface PromptEvaluationResult {
  promptId: string;
  promptVersion: string;
  evaluationName: string;
  passed: boolean;
  score: number;
  threshold: number;
  reason: string;
  metrics?: Record<string, number>;
  timestamp: Date;
}

/**
 * Service for tracking and evaluating prompt performance
 * Integrates with Opik to log evaluation results
 */
@Injectable()
export class OpikPromptEvaluationService {
  private readonly logger = new Logger(OpikPromptEvaluationService.name);
  private evaluationHistory: PromptEvaluationResult[] = [];

  constructor(private promptRegistry: OpikPromptRegistryService) {}

  /**
   * Log a prompt evaluation result
   */
  logEvaluation(result: PromptEvaluationResult): void {
    try {
      // Store in history
      this.evaluationHistory.push(result);

      // Log with prompt registry for Opik tracking
      this.promptRegistry.logPromptEvaluation(
        result.promptId,
        result.promptVersion,
        result.evaluationName,
        result.score,
        `Passed: ${result.passed}, Reason: ${result.reason}`,
      );

      this.logger.log(
        `Evaluation logged: ${result.promptId}@${result.promptVersion} - ${result.evaluationName}=${result.score}/${result.threshold}`,
      );
    } catch (error) {
      this.logger.error('Error logging evaluation result', error);
    }
  }

  /**
   * Log clarity evaluation for a goal
   */
  logClarityEvaluation(
    promptVersion: string,
    goalData: any,
    scores: {
      clarity: number;
      specificity: number;
      measurability: number;
      achievability?: number;
      relevance?: number;
    },
    reasoning: string,
  ): void {
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const numCriteria = Object.keys(scores).length;
    const avgScore = totalScore / numCriteria;

    const result: PromptEvaluationResult = {
      promptId: 'goal_clarity_judge',
      promptVersion,
      evaluationName: 'clarity_evaluation',
      passed: avgScore >= 7,
      score: Math.round(avgScore * 10) / 10,
      threshold: 7,
      reason: reasoning,
      metrics: scores,
      timestamp: new Date(),
    };

    this.logEvaluation(result);
  }

  /**
   * Log output quality evaluation
   */
  logOutputQuality(
    promptId: string,
    promptVersion: string,
    output: any,
    qualityScore: number,
    feedback: string,
  ): void {
    const result: PromptEvaluationResult = {
      promptId,
      promptVersion,
      evaluationName: 'output_quality',
      passed: qualityScore >= 0.7,
      score: qualityScore,
      threshold: 0.7,
      reason: feedback,
      timestamp: new Date(),
    };

    this.logEvaluation(result);
  }

  /**
   * Log JSON validity evaluation
   */
  logJsonValidity(
    promptId: string,
    promptVersion: string,
    output: any,
    isValid: boolean,
    parseError?: string,
  ): void {
    const result: PromptEvaluationResult = {
      promptId,
      promptVersion,
      evaluationName: 'json_validity',
      passed: isValid,
      score: isValid ? 1 : 0,
      threshold: 1,
      reason: isValid ? 'Valid JSON output' : `JSON parsing failed: ${parseError}`,
      timestamp: new Date(),
    };

    this.logEvaluation(result);
  }

  /**
   * Log task completion evaluation
   */
  logTaskCompletion(
    promptId: string,
    promptVersion: string,
    taskName: string,
    completed: boolean,
    completionScore: number,
    details: string,
  ): void {
    const result: PromptEvaluationResult = {
      promptId,
      promptVersion,
      evaluationName: `task_completion_${taskName}`,
      passed: completed && completionScore >= 0.8,
      score: completionScore,
      threshold: 0.8,
      reason: details,
      timestamp: new Date(),
    };

    this.logEvaluation(result);
  }

  /**
   * Get evaluation history for a prompt
   */
  getEvaluationHistory(promptId?: string): PromptEvaluationResult[] {
    if (promptId) {
      return this.evaluationHistory.filter(e => e.promptId === promptId);
    }
    return this.evaluationHistory;
  }

  /**
   * Get evaluation statistics for a prompt
   */
  getEvaluationStats(promptId: string): {
    totalEvaluations: number;
    passRate: number;
    avgScore: number;
    evaluationsByName: Record<string, any>;
  } {
    const evaluations = this.getEvaluationHistory(promptId);

    if (evaluations.length === 0) {
      return {
        totalEvaluations: 0,
        passRate: 0,
        avgScore: 0,
        evaluationsByName: {},
      };
    }

    const passedCount = evaluations.filter(e => e.passed).length;
    const passRate = (passedCount / evaluations.length) * 100;
    const avgScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;

    const evaluationsByName: Record<string, any> = {};
    evaluations.forEach(e => {
      if (!evaluationsByName[e.evaluationName]) {
        evaluationsByName[e.evaluationName] = {
          count: 0,
          passCount: 0,
          scores: [],
        };
      }
      evaluationsByName[e.evaluationName].count++;
      if (e.passed) evaluationsByName[e.evaluationName].passCount++;
      evaluationsByName[e.evaluationName].scores.push(e.score);
    });

    return {
      totalEvaluations: evaluations.length,
      passRate: Math.round(passRate * 100) / 100,
      avgScore: Math.round(avgScore * 100) / 100,
      evaluationsByName,
    };
  }

  /**
   * Clear evaluation history (useful for testing)
   */
  clearEvaluationHistory(promptId?: string): void {
    if (promptId) {
      this.evaluationHistory = this.evaluationHistory.filter(e => e.promptId !== promptId);
    } else {
      this.evaluationHistory = [];
    }
  }
}
