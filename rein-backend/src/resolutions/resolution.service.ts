import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import * as fs from 'fs';

@Injectable()
export class ResolutionService {
  constructor(private llmService: LlmService) {}

  async analyzeResolution(rawText: string, context?: string): Promise<any> {
    const systemPrompt = fs.readFileSync('prompts/resolution_analyzer_v1_2026-01-22.txt', 'utf-8');
    const userPrompt = `${rawText}\nContext: ${context || 'None'}`;
    return this.llmService.generateContent(systemPrompt, userPrompt, 'Resolution Analyzer');
  }
}

const judgeOutput = await this.llmService.generateContent(judgePrompt, JSON.stringify(output.smart_goals), 'Goal Clarity Judge');
// Log to Opik as a metric (use opikClient.logMetric if available, or custom trace)
const evalTrace = this.opikClient.startTrace({ name: 'Eval: Goal Clarity' });
evalTrace.log({ metric: 'goal_clarity', value: judgeOutput.score });
evalTrace.end();