import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { GoalPreprocessorService } from '../preprocessor/goal-preprocessor';
import { ClarificationSessionService } from './session/context-session.service';
import { LlmServiceWithTracing } from '../ml/llm/llm-service-with-tracing';
import { TracingService } from '../ml/tracing/tracing.service';
import {
  ClarificationSession,
  NextClarificationRequest,
  NextClarificationResponse,
} from '../common/types/context';

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);

  constructor(
    private readonly preprocessor: GoalPreprocessorService,
    private readonly llmService: LlmServiceWithTracing,
    private readonly tracingService: TracingService,
    private readonly sessionService: ClarificationSessionService,
  ) {}

  /**
   * Start clarification process or skip directly to generation
   */
async startContext(
  userId: string,
  payload: { prompt: string },
): Promise<
  | { type: 'skip'; resolutionId?: string }
  | { type: 'clarify'; session: ClarificationSession }
> {
  this.logger.debug(`[startContext] Called for user: ${userId}, prompt: "${payload.prompt.substring(0, 50)}..."`);
  this.logger.debug(`[startContext] Stack trace:`, new Error().stack);

  const { parsed, missingFields } = await this.preprocessor.preprocessAndAnalyze(payload.prompt);

  if (missingFields.length === 0) {
    this.logger.debug(`[startContext] No missing fields - skipping clarification`);
    return { type: 'skip' };
  }

  this.logger.debug(`[startContext] Creating session with ${missingFields.length} missing fields`);
  
  const session = await this.sessionService.startSession(userId, {
    originalPrompt: payload.prompt,
    parsedGoal: parsed,
    missingFields,
  });

  return { type: 'clarify', session };
}

  /**
   * Process next user message → generate AI clarification question/response with tracing
   */
  async nextContext(
    userId: string,
    payload: NextClarificationRequest,
  ): Promise<NextClarificationResponse> {
    // 1. Load session
    const session = await this.sessionService.getSession(userId, payload.sessionId);
    if (!session) {
      throw new NotFoundException('Clarification session not found or expired');
    }

    // 2. Check roundCount < 2 (hard limit enforcement)
    if (session.roundCount >= 2) {
      return {
        assistantMessage:
          "You've reached the maximum number of clarification rounds (2/2). " +
          "Click Implement to generate your personalized resolution.",
        roundCount: session.roundCount,
        isAtLimit: true,
        isReady: true,
      };
    }

    // Optional: basic input sanitization
    const userMessage = (payload.userMessage || '').trim();
    if (session.roundCount > 0 && !userMessage) {
      throw new BadRequestException('User message cannot be empty');
    }

    // 3. Use ML infrastructure with tracing
    try {
      const assistantMessage = await this.tracingService.traceLlmCall(
        'clarification_response',
        {
          model: 'gemini-2.5-flash-lite',
          prompt: this.buildClarificationPrompt(session, userMessage),
          temperature: 0.6,
          maxTokens: 350,
        },
        async () => {
          // Use the ML service for generation
          const response = await this.llmService.generateContent(
            'You are a helpful assistant for goal clarification.',
            this.buildClarificationPrompt(session, userMessage),
            {
              temperature: 0.6,
              maxTokens: 350,
              format: 'text',
            },
          );
          return typeof response === 'string' ? response : JSON.stringify(response);
        },
      );

      // Fallback check
      const finalMessage = assistantMessage && assistantMessage.trim().length > 10
        ? assistantMessage.trim()
        : "I didn't get enough context to respond properly. " +
          "Please provide more details or click Implement to proceed with what we have.";

      // 4. Update session (same logic as before)
      const newHistory = [
        ...session.history,
        { role: 'user' as const, content: userMessage, timestamp: new Date().toISOString() },
        { role: 'assistant' as const, content: finalMessage, timestamp: new Date().toISOString() },
      ];

      const newRoundCount = session.roundCount + 1;

      await this.sessionService.updateSession(userId, session.sessionId, {
        history: newHistory,
        roundCount: newRoundCount,
      });

      const isReady =
        newRoundCount >= 2 ||
        finalMessage.toLowerCase().includes('ready') ||
        finalMessage.toLowerCase().includes("click 'implement'") ||
        finalMessage.toLowerCase().includes('looks good');

      return {
        assistantMessage: finalMessage,
        roundCount: newRoundCount,
        isAtLimit: newRoundCount >= 2,
        isReady,
      };
    } catch (err: any) {
      this.logger.error('ML clarification failed', err);
      throw new BadRequestException(
        `Failed to generate AI response: ${err.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get current session state (for frontend hydration or polling)
   */
  async getSessionState(userId: string, sessionId: string): Promise<ClarificationSession> {
    const session = await this.sessionService.getSession(userId, sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  /**
   * Builds the structured prompt for clarification phase
   */
  private buildClarificationPrompt(session: ClarificationSession, userMessage: string): string {
    const { parsedGoal, missingFields, history, roundCount, originalPrompt } = session;

    // Format history for context
    const historyText =
      history.length === 0
        ? '(This is the first message — start by asking about the highest-priority missing field)'
        : history.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n');

    // Prioritized missing fields list
    const missingText =
      missingFields
        .sort((a, b) => a.priority - b.priority)
        .map((mf) => `- ${mf.field}: ${mf.reason} (priority ${mf.priority})`)
        .join('\n') || '(No additional fields marked missing by preprocessor)';

    return `
Original user prompt: "${originalPrompt}"

Parsed goal so far: ${JSON.stringify(parsedGoal, null, 2)}

Missing / unclear fields (prioritize these): ${missingText}

Previous conversation history: ${historyText}

Current user message: "${userMessage || '(start of conversation)'}"

Current round: ${roundCount}/2

Generate a helpful clarification response. Ask 1-2 focused questions about the missing fields. Keep it conversational and under 3 sentences.
`.trim();
  }
}