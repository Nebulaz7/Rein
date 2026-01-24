import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService, RoadmapResponse } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleChat(
    @Body('userMessage') userMessage: string,
    @Body('modelType') modelType: 'sprint' | 'standard' | 'architect',
  ): Promise<RoadmapResponse | { error: string }> {
    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
      return { error: 'userMessage is required and must be a non-empty string' };
    }

    try {
      const result: RoadmapResponse = await this.chatService.generateRoadmap(userMessage.trim(), modelType);

      console.log('ROADMAP GENERATED SUCCESSFULLY');
      console.log('Calendar intent:', result.shouldTriggerCalendar);
      if (result.calendarIntentReason) {
        console.log('Reason:', result.calendarIntentReason);
      }

      // Return the full response — frontend can use both roadmap + calendar flag
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate roadmap';
      console.error('ERROR generating roadmap:', errorMessage);
      if (error instanceof Object && 'stack' in error) {
        console.error(error.stack);
      }

      return { error: errorMessage };
    }
  }
}