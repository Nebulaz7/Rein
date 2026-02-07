/**
 * Example Usage of Opik Prompt Versioning System
 * 
 * This file demonstrates how to integrate prompt versioning
 * throughout your Rein services
 */

import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { OpikPromptRegistryService } from '../ml/opik/opik-prompt-registry.service';
import { OpikPromptEvaluationService } from '../ml/opik/opik-prompt-evaluation.service';

@Injectable()
export class PromptVersioningExampleService {
  constructor(
    private llmService: LlmService,
    private promptRegistry: OpikPromptRegistryService,
    private evaluationService: OpikPromptEvaluationService,
  ) {}

  /**
   * Example 1: Basic prompt usage with versioning
   */
  async exampleBasicPromptUsage(userInput: string): Promise<any> {
    // Get the latest version of resolution analyzer prompt
    const { content: systemPrompt, metadata } = this.promptRegistry.getPromptWithMetadata(
      'resolution_analyzer',
    );

    // Generate content with metadata for Opik tracing
    const result = await this.llmService.generateContent(
      systemPrompt,
      userInput,
      'Resolution Analyzer',
      metadata, // This metadata is logged to Opik for tracking
    );

    return result;
  }

  /**
   * Example 2: Using a specific prompt version
   */
  async exampleSpecificPromptVersion(userInput: string, version: string): Promise<any> {
    // Get a specific version of a prompt
    const { content: systemPrompt, metadata } = this.promptRegistry.getPromptVersionWithMetadata(
      'resolution_analyzer',
      version,
    );

    if (!metadata) {
      throw new Error(`Prompt version not found: resolution_analyzer@${version}`);
    }

    return this.llmService.generateContent(
      systemPrompt,
      userInput,
      'Resolution Analyzer',
      metadata,
    );
  }

  /**
   * Example 3: Complete flow with evaluation
   */
  async exampleWithEvaluation(userInput: string): Promise<any> {
    // Step 1: Get prompt
    const { content: systemPrompt, metadata } = this.promptRegistry.getPromptWithMetadata(
      'goal_clarity_judge',
    );

    // Step 2: Generate output
    const output = await this.llmService.generateContent(
      systemPrompt,
      userInput,
      'Goal Clarity Judge',
      metadata,
    );

    // Step 3: Evaluate output quality
    try {
      // Check if output is valid JSON
      const isValidJson = typeof output === 'object';
      this.evaluationService.logJsonValidity(
        'goal_clarity_judge',
        metadata.promptVersion,
        output,
        isValidJson,
      );

      // Evaluate output quality
      const qualityScore = this.calculateQualityScore(output);
      this.evaluationService.logOutputQuality(
        'goal_clarity_judge',
        metadata.promptVersion,
        output,
        qualityScore,
        `Quality assessment completed with score ${qualityScore}`,
      );

      // Log clarity metrics if applicable
      if (output.clarity !== undefined) {
        this.evaluationService.logClarityEvaluation(
          metadata.promptVersion,
          { userInput },
          {
            clarity: output.clarity || 0,
            specificity: output.specificity || 0,
            measurability: output.measurability || 0,
            achievability: output.achievability || 0,
            relevance: output.relevance || 0,
          },
          output.reasoning || 'Evaluation completed',
        );
      }
    } catch (evalError) {
      console.error('Evaluation logging failed:', evalError);
      // Don't throw - evaluation is non-critical
    }

    return output;
  }

  /**
   * Example 4: Comparing prompt versions
   */
  async exampleComparePromptVersions(userInput: string): Promise<any> {
    const history = this.promptRegistry.getPromptHistory('resolution_analyzer');

    const results = {};

    // Test multiple versions
    for (const prompt of history.slice(0, 3)) {
      // Test only latest 3 versions
      const result = await this.exampleSpecificPromptVersion(userInput, prompt.version);

      const qualityScore = this.calculateQualityScore(result);

      results[prompt.version] = {
        output: result,
        score: qualityScore,
        timestamp: new Date(),
      };

      // Log evaluation for comparison
      this.evaluationService.logOutputQuality(
        'resolution_analyzer',
        prompt.version,
        result,
        qualityScore,
        `Comparison test with version ${prompt.version}`,
      );
    }

    return results;
  }

  /**
   * Example 5: Getting evaluation statistics
   */
  async exampleEvaluationStatistics(): Promise<any> {
    const promptIds = this.promptRegistry.listAllPrompts().map(p => p.id);

    const statistics = {};

    for (const promptId of promptIds) {
      statistics[promptId] = this.evaluationService.getEvaluationStats(promptId);
    }

    return {
      timestamp: new Date(),
      promptStats: statistics,
      summary: {
        totalPromptsTracked: promptIds.length,
        averagePassRate: this.calculateAveragePassRate(statistics),
        averageScore: this.calculateAverageScore(statistics),
      },
    };
  }

  /**
   * Example 6: Batch evaluation of outputs
   */
  async exampleBatchEvaluation(inputs: string[]): Promise<any> {
    const { content: systemPrompt, metadata } = this.promptRegistry.getPromptWithMetadata(
      'resolution_analyzer',
    );

    const results = [];

    for (const input of inputs) {
      const output = await this.llmService.generateContent(
        systemPrompt,
        input,
        'Resolution Analyzer - Batch',
        metadata,
      );

      const quality = this.calculateQualityScore(output);

      results.push({
        input,
        output,
        quality,
      });

      // Log evaluation
      this.evaluationService.logOutputQuality(
        'resolution_analyzer',
        metadata.promptVersion,
        output,
        quality,
        `Batch evaluation for input: ${input.substring(0, 50)}...`,
      );
    }

    return results;
  }

  /**
   * Example 7: Listing all prompts and versions
   */
  async exampleListAllPrompts(): Promise<any> {
    const allPrompts = this.promptRegistry.listAllPrompts();

    const detailedList = {};

    for (const prompt of allPrompts) {
      const versions = this.promptRegistry.getPromptHistory(prompt.id);
      detailedList[prompt.id] = {
        ...prompt,
        versions: versions.map(v => ({
          version: v.version,
          status: v.metadata.status,
          description: v.metadata.description,
          updatedAt: v.metadata.updatedAt,
        })),
      };
    }

    return detailedList;
  }

  // ============= Helper Methods =============

  private calculateQualityScore(output: any): number {
    // Implement your quality scoring logic
    if (!output) return 0;

    let score = 0.5; // Base score

    // Check if output is valid JSON object
    if (typeof output === 'object') score += 0.2;

    // Check for expected fields
    if (output.score !== undefined) score += 0.1;
    if (output.reasoning !== undefined) score += 0.1;
    if (output.recommendations !== undefined) score += 0.1;

    return Math.min(score, 1);
  }

  private calculateAveragePassRate(statistics: Record<string, any>): number {
    const passRates = Object.values(statistics)
      .map((stat: any) => stat.passRate || 0);

    if (passRates.length === 0) return 0;

    return passRates.reduce((a: number, b: number) => a + b, 0) / passRates.length;
  }

  private calculateAverageScore(statistics: Record<string, any>): number {
    const scores = Object.values(statistics)
      .map((stat: any) => stat.avgScore || 0);

    if (scores.length === 0) return 0;

    return scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
  }
}
