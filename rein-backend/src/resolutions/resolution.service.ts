import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { OpikPromptRegistryService } from '../ml/opik/opik-prompt-registry.service';

@Injectable()
export class ResolutionService {
  private readonly logger = new Logger(ResolutionService.name);

  constructor(
    private llmService: LlmService,
    private promptRegistry: OpikPromptRegistryService,
  ) {}

  async analyzeResolution(rawText: string, context?: string, promptVersion?: string): Promise<any> {
    // Get versioned prompt from registry
    const promptId = 'resolution_analyzer';
    const promptData = promptVersion
      ? this.promptRegistry.getPromptVersionWithMetadata(promptId, promptVersion)
      : this.promptRegistry.getPromptWithMetadata(promptId);

    const systemPrompt = promptData.content;
    const userPrompt = `${rawText}\nContext: ${context || 'None'}`;

    // Log prompt execution with metadata for tracking
    this.promptRegistry.logPromptExecution(
      promptId,
      promptData.metadata.promptVersion || 'unknown',
      { rawText, context },
      null, // Will be logged after LLM execution
      {
        service: 'resolution-analyzer',
        timestamp: new Date().toISOString(),
      },
    );

    return this.llmService.generateContent(
      systemPrompt,
      userPrompt,
      'Resolution Analyzer',
      promptData.metadata, // Pass metadata for Opik tracing
    );
  }

  /**
   * Evaluate goal clarity using LLM (tracing is handled by LlmService)
   */
  async evaluateGoalClarity(goalData: any): Promise<any> {
    const judgePrompt = `You are an expert at evaluating goal clarity. 
Evaluate the following goal on these criteria (0-10 scale):
- Clarity: How clear and well-defined is the goal?
- Specificity: How specific are the objectives?
- Measurability: How measurable is progress?

Return your evaluation as JSON:
{
  "score": number (0-10),
  "clarity": number,
  "specificity": number,
  "measurability": number,
  "reasoning": string
}`;

    const judgeOutput = await this.llmService.generateContent(
      judgePrompt, 
      JSON.stringify(goalData), 
      'Goal Clarity Judge'
    );

    return judgeOutput;
  }
}
