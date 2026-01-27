import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpikClientService } from '../opik/opik-client.service';
import { Trace } from '../tracing/tracing.decorator';

/**
 * LLM Service with Opik Tracing Integration
 *
 * Handles all LLM interactions with comprehensive tracing for:
 * - Prompt formatting and validation
 * - Model calls and response parsing
 * - Token usage tracking
 * - Error handling and recovery
 */
@Injectable()
export class LlmServiceWithTracing {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(LlmServiceWithTracing.name);

  constructor(private opikService: OpikClientService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  /**
   * Generate content with Opik tracing
   */
  @Trace({
    name: 'llm_generate_content',
    captureArgs: true,
    captureResult: true,
  })
  async generateContent(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      format?: 'json' | 'text' | 'markdown';
    },
  ): Promise<any> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: options?.temperature || 0.7,
        maxOutputTokens: options?.maxTokens || 2000,
      },
    });

    const trace = this.opikService.startTrace('llm_content_generation', {
      format: options?.format,
      temperature: options?.temperature,
    });

    try {
      // Prepare prompt
      const formattingInstruction =
        options?.format === 'json'
          ? '\nOutput ONLY valid JSON, no markdown formatting or explanations.'
          : options?.format === 'markdown'
            ? '\nFormat your response with appropriate markdown.'
            : '';

      const fullPrompt = `${systemPrompt}\n\n${userPrompt}${formattingInstruction}`;

      // Log input
      const inputSpan = this.opikService.createSpan(trace, 'prompt_input', {
        system_prompt_length: systemPrompt.length,
        user_prompt_length: userPrompt.length,
      });

      const inputTokens = this.estimateTokens(fullPrompt);
      this.opikService.endSpan(inputSpan, {
        estimated_input_tokens: inputTokens,
      });

      // Call model
      const callSpan = this.opikService.createSpan(trace, 'model_call', {
        model: 'gemini-2.0-flash',
      });

      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();

      this.opikService.endSpan(callSpan, {
        response_length: responseText.length,
      });

      // Parse response
      let output = responseText;
      if (options?.format === 'json') {
        const parseSpan = this.opikService.createSpan(trace, 'json_parsing', {
          response_preview: responseText.substring(0, 100),
        });

        try {
          output = JSON.parse(responseText);
          this.opikService.endSpan(parseSpan, { success: true });
        } catch (parseError) {
          this.logger.error('JSON parse error, attempting regex extraction');

          // Try to extract JSON from response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            output = JSON.parse(jsonMatch[0]);
            this.opikService.endSpan(parseSpan, {
              success: true,
              extracted: true,
            });
          } else {
            throw parseError;
          }
        }
      }

      // Log output
      const outputSpan = this.opikService.createSpan(trace, 'output', {
        output_type: typeof output,
      });

      const outputTokens = this.estimateTokens(JSON.stringify(output));
      this.opikService.endSpan(outputSpan, {
        estimated_output_tokens: outputTokens,
        total_estimated_tokens: inputTokens + outputTokens,
      });

      this.opikService.endTrace(trace);

      this.logger.debug(
        `LLM call completed: tokens=${inputTokens + outputTokens}`,
      );

      return output;
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('LLM generation failed', error);
      throw error;
    }
  }

  /**
   * Stream content generation with tracing
   */
  async *generateContentStream(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    },
  ): AsyncGenerator<string> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: options?.temperature || 0.7,
        maxOutputTokens: options?.maxTokens || 2000,
      },
    });

    const trace = this.opikService.startTrace('llm_streaming_generation', {
      temperature: options?.temperature,
    });

    const inputSpan = this.opikService.createSpan(trace, 'stream_input', {
      system_prompt_length: systemPrompt.length,
      user_prompt_length: userPrompt.length,
    });

    try {
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      const inputTokens = this.estimateTokens(fullPrompt);
      this.opikService.endSpan(inputSpan, {
        estimated_input_tokens: inputTokens,
      });

      const callSpan = this.opikService.createSpan(trace, 'stream_call', {
        model: 'gemini-2.0-flash',
      });

      const stream = await model.generateContentStream(fullPrompt);

      let totalChunks = 0;
      let totalChunkLength = 0;

      for await (const chunk of stream.stream) {
        totalChunks++;
        const text = chunk.text?.() || '';
        totalChunkLength += text.length;
        yield text;
      }

      this.opikService.endSpan(callSpan, {
        total_chunks: totalChunks,
        total_length: totalChunkLength,
      });

      this.opikService.endTrace(trace);
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('LLM streaming failed', error);
      throw error;
    }
  }

  /**
   * Batch generate content for multiple prompts
   */
  async generateContentBatch(
    prompts: Array<{
      system: string;
      user: string;
      id?: string;
    }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<Array<{ id?: string; output: any; error?: string }>> {
    const trace = this.opikService.startTrace('llm_batch_generation', {
      batch_size: prompts.length,
    });

    const batchSpan = this.opikService.createSpan(trace, 'batch_setup', {
      prompt_count: prompts.length,
    });

    try {
      const results: Array<{ id?: string; output: any; error?: string }> = [];

      for (const prompt of prompts) {
        try {
          const output = await this.generateContent(
            prompt.system,
            prompt.user,
            options,
          );
          results.push({
            id: prompt.id,
            output,
          });
        } catch (error) {
          this.logger.error(
            `Batch generation failed for prompt ${prompt.id}`,
            error,
          );
          results.push({
            id: prompt.id,
            output: null,
            error: (error as Error).message,
          });
        }
      }

      this.opikService.endSpan(batchSpan, {
        successful: results.filter((r) => !r.error).length,
        failed: results.filter((r) => r.error).length,
      });

      this.opikService.endTrace(trace);

      return results;
    } catch (error) {
      this.opikService.endTrace(trace);
      this.logger.error('Batch generation failed', error);
      throw error;
    }
  }

  /**
   * Estimate token count for text
   * Rough approximation: ~4 characters per token for English
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model: 'gemini-2.0-flash',
      type: 'text-generation',
      maxInputTokens: 1000000, // 1M context window
      maxOutputTokens: 16000,
      costPer1kInputTokens: 0.075,
      costPer1kOutputTokens: 0.3,
    };
  }
}
