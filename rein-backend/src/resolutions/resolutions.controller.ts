import { Controller, Post, Body } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';

@Controller('resolutions')
export class ResolutionsController {
  constructor(private llmService: LlmService) {}

  @Post('test-trace')
  async testTrace(@Body() { prompt }: { prompt: string }) {
    const system = 'You are a helpful assistant. Respond in JSON { "echo": input }';
    return this.llmService.generateContent(system, prompt, 'Test LLM Trace');
  }
}