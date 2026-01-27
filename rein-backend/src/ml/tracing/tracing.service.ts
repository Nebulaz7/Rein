import { Injectable, Inject } from '@nestjs/common';
import { OpikClientService } from '../opik/opik-client.service';

@Injectable()
export class TracingService {
  constructor(private opikService: OpikClientService) {}

  /**
   * Trace an LLM generation call
   */
  async traceLlmCall(
    name: string,
    input: {
      model: string;
      prompt: string;
      temperature?: number;
      maxTokens?: number;
    },
    generateFn: () => Promise<string>,
  ): Promise<string> {
    const trace = this.opikService.startTrace(`llm_${name}`, {
      model: input.model,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    });

    const inputSpan = this.opikService.createSpan(trace, 'llm_input', {
      prompt: input.prompt.substring(0, 500),
    });

    try {
      const result = await generateFn();

      this.opikService.endSpan(inputSpan, {
        prompt_tokens: this.estimateTokens(input.prompt),
      });

      const outputSpan = this.opikService.createSpan(trace, 'llm_output', {
        output: result.substring(0, 500),
      });

      this.opikService.endSpan(outputSpan, {
        output_tokens: this.estimateTokens(result),
      });

      this.opikService.endTrace(trace);

      return result;
    } catch (error) {
      this.opikService.endTrace(trace);
      throw error;
    }
  }

  /**
   * Trace preprocessing operations
   */
  async tracePreprocessing(
    name: string,
    input: any,
    processFn: () => Promise<any>,
  ): Promise<any> {
    const trace = this.opikService.startTrace(`preprocess_${name}`, {
      operation: 'preprocessing',
    });

    const inputSpan = this.opikService.createSpan(trace, 'preprocessing_input', {
      input,
    });

    try {
      const result = await processFn();

      this.opikService.endSpan(inputSpan, { processed: true });

      const outputSpan = this.opikService.createSpan(
        trace,
        'preprocessing_output',
        { result },
      );

      this.opikService.endSpan(outputSpan, { success: true });
      this.opikService.endTrace(trace);

      return result;
    } catch (error) {
      this.opikService.endTrace(trace);
      throw error;
    }
  }

  /**
   * Trace evaluation operations
   */
  async traceEvaluation(
    name: string,
    context: {
      goalId: string;
      userId: string;
      input: any;
      output: any;
    },
    evaluateFn: () => Promise<{
      score: number;
      reasoning: string;
      metrics?: Record<string, number>;
    }>,
  ): Promise<any> {
    const trace = this.opikService.startTrace(`eval_${name}`, {
      goalId: context.goalId,
      userId: context.userId,
      operation: 'evaluation',
    });

    try {
      const evaluationResult = await evaluateFn();

      const evalSpan = this.opikService.createSpan(trace, 'evaluation_result', {
        score: evaluationResult.score,
        reasoning: evaluationResult.reasoning,
      });

      this.opikService.endSpan(evalSpan, evaluationResult.metrics);

      // Log the score using trace.score
      this.opikService.logEvaluation(
        trace,
        `eval_${name}`,
        evaluationResult.score,
        evaluationResult.reasoning,
      );

      this.opikService.endTrace(trace);

      return evaluationResult;
    } catch (error) {
      this.opikService.endTrace(trace);
      throw error;
    }
  }

  /**
   * Trace end-to-end goal generation pipeline
   */
  async traceGoalGeneration(
    userId: string,
    userInput: string,
    executePipeline: () => Promise<{
      preprocessed: any;
      generated: any;
      synced: any;
    }>,
  ): Promise<any> {
    const trace = this.opikService.startTrace('goal_generation_pipeline', {
      userId,
      operation: 'end_to_end_pipeline',
    });

    try {
      const pipelineResult = await executePipeline();

      // Log each stage
      const stages = [
        { name: 'preprocessing', data: pipelineResult.preprocessed },
        { name: 'generation', data: pipelineResult.generated },
        { name: 'sync', data: pipelineResult.synced },
      ];

      for (const stage of stages) {
        const stageSpan = this.opikService.createSpan(
          trace,
          `pipeline_${stage.name}`,
          { stage: stage.name },
        );

        this.opikService.endSpan(stageSpan, stage.data);
      }

      this.opikService.endTrace(trace);

      return pipelineResult;
    } catch (error) {
      this.opikService.endTrace(trace);
      throw error;
    }
  }

  /**
   * Simple token estimation (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough approximation: ~4 chars per token
    return Math.ceil(text.length / 4);
  }
}
