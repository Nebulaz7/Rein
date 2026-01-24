import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { ContextService } from './context.service';
import type {
  NextClarificationRequest,
  NextClarificationResponse,
} from '../common/types/context';

@Controller('context')
export class ContextController {
  constructor(private readonly contextService: ContextService) {}

  @Post('start')
  async start(
    @Req() req: any, // ← in real app use @User() decorator or AuthGuard
    @Body() body: { prompt: string },
  ) {
    const userId = req.user?.id || 'anonymous'; // ← replace with real auth
    return this.contextService.startContext(userId, body);
  }

  @Post('next')
  async next(
    @Req() req: any,
    @Body() body: NextClarificationRequest,
  ): Promise<NextClarificationResponse> {
    const userId = req.user?.id || 'anonymous';
    return this.contextService.nextContext(userId, body);
  }

  @Get('session/:sessionId')
  async getSession(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
  ) {
    const userId = req.user?.id || 'anonymous';
    return this.contextService.getSessionState(userId, sessionId);
  }

@Get('test-start')
async testStart(@Req() req: any) {
  const userId = req.user?.id || 'test-user-123';
  const testPrompt = "I want to learn React in 2 months as a beginner with video tutorials";

  const result = await this.contextService.startContext(userId, { prompt: testPrompt });

  return {
    resultType: result.type,
    session: result.type === 'clarify' ? result.session : undefined,
    message: result.type === 'skip' 
      ? 'Skipped clarification (no missing fields detected)' 
      : 'Clarification session created',
  };
}
}