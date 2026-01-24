import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService, ResolutionResponse } from './generator.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleChat(
    @Body('prompt') prompt: string,
    @Body('mode') modeType: 'plan' | 'agent',
  ): Promise<ResolutionResponse | { error: string }> {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return { error: 'Prompt is required and must be a non-empty string' };
    }

    try {
      const result: ResolutionResponse = await this.chatService.generateResolution(prompt.trim(), modeType);
      console.log('ROADMAP GENERATED SUCCESSFULLY');
      console.log('Calendar intent:', result.shouldTriggerCalendar);
      if (result.calendarIntentReason) {
        console.log('Reason:', result.calendarIntentReason);
      }

      // Return the full response — frontend can use both roadmap + calendar flag
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate roadmap';
      console.error('ERROR generating resolution:', errorMessage);
      if (error instanceof Object && 'stack' in error) {
        console.error(error.stack);
      }

      return { error: errorMessage };
    }
  }
}
