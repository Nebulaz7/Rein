import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpikClientService } from '../opik/opik-client.service';


@Injectable()
export class EvaluationService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(EvaluationService.name);

  constructor(private opikService: OpikClientService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  /**
   * Evaluate a generated resolution for quality
   */
  async evaluateResolution(
    goalId: string,
    resolution: {
      title: string;
      description: string;
      metrics: string[];
      timeline: string;
    },
  ): Promise<{
    score: number;
    reasoning: string;
    metrics: {
      clarity: number;
      specificity: number;
      measurability: number;
      actionability: number;
    };
  }> {
    const trace = this.opikService.startTrace('resolution_evaluation', {
      goalId,
    });

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });

      const evaluationPrompt = `
You are an expert at evaluating SMART goals and resolutions.

Evaluate the following resolution on these criteria (0-10 scale):
- Clarity: How clear and well-defined is the goal?
- Specificity: How specific are the objectives?
- Measurability: How measurable is progress?
- Actionability: How actionable are the steps?

Resolution:
Title: ${resolution.title}
Description: ${resolution.description}
Key Metrics: ${resolution.metrics.join(', ')}
Timeline: ${resolution.timeline}

Return your evaluation as JSON:
{
  "clarity": number,
  "specificity": number,
  "measurability": number,
  "actionability": number,
  "overallScore": number (average),
  "strengths": [string],
  "improvements": [string],
  "reasoning": string
}
`;

      const evalSpan = this.opikService.createSpan(trace, 'llm_evaluation', {
        goalId,
      });

      const result = await model.generateContent(evaluationPrompt);
      const evaluationText = result.response.text();

      // Parse JSON response
      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse evaluation response');
      }

      const evaluation = JSON.parse(jsonMatch[0]);

      this.opikService.endSpan(evalSpan, {
        evaluation,
      });

      // Log to Opik for feedback tracking
      this.opikService.logEvaluation(
        trace,
        'resolution_quality',
        evaluation.overallScore,
        evaluation.reasoning,
      );

      this.opikService.endTrace(trace);

      return {
        score: evaluation.overallScore,
        reasoning: evaluation.reasoning,
        metrics: {
          clarity: evaluation.clarity,
          specificity: evaluation.specificity,
          measurability: evaluation.measurability,
          actionability: evaluation.actionability,
        },
      };
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('Resolution evaluation failed', error);
      throw error;
    }
  }

  /**
   * Evaluate a generated plan for coherence and actionability
   */
  async evaluatePlan(
    planId: string,
    plan: {
      goals: string[];
      phases: Array<{ week: number; tasks: string[] }>;
      resources: string[];
    },
  ): Promise<{
    score: number;
    reasoning: string;
    metrics: {
      coherence: number;
      feasibility: number;
      progressiveness: number;
      clarity: number;
    };
  }> {
    const trace = this.opikService.startTrace('plan_evaluation', {
      planId,
    });

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });

      const evaluationPrompt = `
You are an expert at evaluating project and learning plans.

Evaluate the following plan on these criteria (0-10 scale):
- Coherence: How well do the phases flow together?
- Feasibility: How realistic is the timeline and scope?
- Progressiveness: Does it build from basics to advanced?
- Clarity: Are instructions clear and actionable?

Plan Overview:
Goals: ${plan.goals.join(', ')}
Phases: ${plan.phases.length}
Resources: ${plan.resources.join(', ')}

${plan.phases.map((p) => `Week ${p.week}: ${p.tasks.join('; ')}`).join('\n')}

Return your evaluation as JSON:
{
  "coherence": number,
  "feasibility": number,
  "progressiveness": number,
  "clarity": number,
  "overallScore": number,
  "strengths": [string],
  "improvements": [string],
  "reasoning": string
}
`;

      const evalSpan = this.opikService.createSpan(trace, 'llm_plan_evaluation', {
        planId,
      });

      const result = await model.generateContent(evaluationPrompt);
      const evaluationText = result.response.text();

      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse plan evaluation response');
      }

      const evaluation = JSON.parse(jsonMatch[0]);

      this.opikService.endSpan(evalSpan, {
        evaluation,
      });

      this.opikService.logEvaluation(
        trace,
        'plan_quality',
        evaluation.overallScore,
        evaluation.reasoning,
      );

      this.opikService.endTrace(trace);

      return {
        score: evaluation.overallScore,
        reasoning: evaluation.reasoning,
        metrics: {
          coherence: evaluation.coherence,
          feasibility: evaluation.feasibility,
          progressiveness: evaluation.progressiveness,
          clarity: evaluation.clarity,
        },
      };
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('Plan evaluation failed', error);
      throw error;
    }
  }

  /**
   * Evaluate coaching response quality
   */
  async evaluateCoachingResponse(
    responseId: string,
    context: {
      userQuery: string;
      userProfile: any;
      coachingResponse: string;
    },
  ): Promise<{
    score: number;
    reasoning: string;
    metrics: {
      relevance: number;
      personalization: number;
      motivation: number;
      actionability: number;
    };
  }> {
    const trace = this.opikService.startTrace('coaching_evaluation', {
      responseId,
    });

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });

      const evaluationPrompt = `
You are an expert at evaluating AI coaching quality.

Evaluate this coaching response on these criteria (0-10 scale):
- Relevance: How relevant is it to the user's query?
- Personalization: How personalized to the user's profile?
- Motivation: How motivating and encouraging?
- Actionability: How concrete and actionable?

User Query: ${context.userQuery}
User Profile: ${JSON.stringify(context.userProfile)}

Coaching Response: ${context.coachingResponse}

Return your evaluation as JSON:
{
  "relevance": number,
  "personalization": number,
  "motivation": number,
  "actionability": number,
  "overallScore": number,
  "strengths": [string],
  "improvements": [string],
  "reasoning": string
}
`;

      const evalSpan = this.opikService.createSpan(
        trace,
        'llm_coaching_evaluation',
        { responseId },
      );

      const result = await model.generateContent(evaluationPrompt);
      const evaluationText = result.response.text();

      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse coaching evaluation response');
      }

      const evaluation = JSON.parse(jsonMatch[0]);

      this.opikService.endSpan(evalSpan, {
        evaluation,
      });

      this.opikService.logEvaluation(
        trace,
        'coaching_quality',
        evaluation.overallScore,
        evaluation.reasoning,
      );

      this.opikService.endTrace(trace);

      return {
        score: evaluation.overallScore,
        reasoning: evaluation.reasoning,
        metrics: {
          relevance: evaluation.relevance,
          personalization: evaluation.personalization,
          motivation: evaluation.motivation,
          actionability: evaluation.actionability,
        },
      };
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('Coaching evaluation failed', error);
      throw error;
    }
  }
}
