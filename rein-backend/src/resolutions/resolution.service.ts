import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import * as fs from 'fs';

@Injectable()
export class ResolutionService {
  private readonly logger = new Logger(ResolutionService.name);

  constructor(private llmService: LlmService) {}

  async analyzeResolution(rawText: string, context?: string): Promise<any> {
    const systemPrompt = fs.readFileSync('prompts/resolution_analyzer_v1_2026-01-22.txt', 'utf-8');
    const userPrompt = `${rawText}\nContext: ${context || 'None'}`;
    return this.llmService.generateContent(systemPrompt, userPrompt, 'Resolution Analyzer');
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
