import { Injectable, BadRequestException, NotFoundException, Logger, InternalServerErrorException} from '@nestjs/common';
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

  async nextContext(
    userId: string,
    payload: NextClarificationRequest,
  ): Promise<NextClarificationResponse> {
    const session = await this.sessionService.getSession(userId, payload.sessionId);
    if (!session) {
      throw new NotFoundException('Clarification session not found or expired');
    }

    if (session.roundCount >= 3) {
      return {
        assistantMessage: "You've reached the maximum clarification rounds. Please review the implementation summary.",
        roundCount: session.roundCount,
        isAtLimit: true,
        isReady: true,
      };
    }

    const userMessage = (payload.userMessage || '').trim();
    if (session.roundCount > 0 && !userMessage) {
      throw new BadRequestException('User message cannot be empty');
    }

    try {
      const systemPrompt = this.buildClarificationPrompt(session, userMessage);
      
      // Use the correct method signature: generateContent(systemPrompt, userPrompt)
      // For clarification, we can pass empty string as userPrompt since context is in systemPrompt
      const response = await this.llmService.generateContent(systemPrompt, userMessage || 'Please provide clarification.');

      // Update session by appending to history manually
      session.history.push(
        { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
        { role: 'assistant', content: response, timestamp: new Date().toISOString() }
      );
      session.roundCount++;

      // Save updated session
      await this.sessionService.updateSession(userId, session);

      // After user's first response (round 1), generate implementation summary
      const shouldShowSummary = session.roundCount === 2;
      const isAtLimit = session.roundCount >= 3;

      let summary: string | undefined;
      if (shouldShowSummary) {
        summary = await this.generateImplementationSummary(session);
      }

      return {
        assistantMessage: response,
        roundCount: session.roundCount,
        isAtLimit,
        isReady: shouldShowSummary,
        summary,
      };
    } catch (err: any) {
      this.logger.error(`Failed to generate clarification response: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to generate clarification response');
    }
  }

  private async generateImplementationSummary(session: ClarificationSession): Promise<string> {
    const summaryPrompt = `
You are Rein AI. Based on the conversation, generate a concise implementation summary.

Original goal: "${session.originalPrompt}"

Conversation history:
${session.history.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

Generate a bullet-point summary of what you understood and will implement. Format:

Here's what I understood:
• [Key point 1]
• [Key point 2]
• [Key point 3]

Keep it under 5 bullet points. Be specific and actionable.
`.trim();

    const summary = await this.llmService.generateContent(summaryPrompt, 'Generate implementation summary');

    return summary;
  }

  async updateSummary(
    userId: string,
    payload: { sessionId: string; corrections: string },
  ): Promise<{ updatedSummary: string }> {
    const session = await this.sessionService.getSession(userId, payload.sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const updatePrompt = `
You are Rein AI. The user wants to make corrections to the implementation plan.

Original conversation:
${session.history.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

User's corrections: "${payload.corrections}"

Generate an updated bullet-point summary incorporating their corrections. Format:

Here's the updated plan:
• [Updated point 1]
• [Updated point 2]
• [Updated point 3]

Keep it under 5 bullet points.
`.trim();

    const updatedSummary = await this.llmService.generateContent(updatePrompt, payload.corrections);

    // Save the correction to history
    session.history.push(
      { role: 'user', content: `Correction: ${payload.corrections}`, timestamp: new Date().toISOString() },
      { role: 'assistant', content: updatedSummary, timestamp: new Date().toISOString() }
    );

    await this.sessionService.updateSession(userId, session);

    return { updatedSummary };
  }

  async getSessionState(userId: string, sessionId: string): Promise<ClarificationSession> {
    const session = await this.sessionService.getSession(userId, sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  private buildClarificationPrompt(session: ClarificationSession, userMessage: string): string {
    const { parsedGoal, missingFields, history, roundCount, originalPrompt } = session;

    const historyText =
      history.length === 0
        ? '(This is the first message — ask ALL clarification questions in one message)'
        : history.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n');

    const missingText =
      missingFields
        .sort((a, b) => a.priority - b.priority)
        .map((mf) => `- ${mf.field}: ${mf.reason} (priority ${mf.priority})`)
        .join('\n') || '(No additional fields marked missing by preprocessor)';

    if (roundCount === 0) {
      return `
You are Rein AI, helping users achieve their goals through structured planning.

Original user prompt: "${originalPrompt}"

Parsed goal so far: ${JSON.stringify(parsedGoal, null, 2)}

Missing / unclear fields: ${missingText}

INSTRUCTIONS FOR ROUND 1/2:
- This is your ONLY chance to gather information
- Ask ALL necessary clarification questions in ONE message
- Cover: timeline, resources, constraints, success metrics, accountability
- Keep it conversational but comprehensive (3-5 focused questions)
- Number your questions for clarity
- Be concise - user will respond in one message

Generate your clarification questions now:`.trim();
    } else if (roundCount === 1) {
      return `
You are Rein AI. The user has provided their answers to your clarification questions.

Original prompt: "${originalPrompt}"

Previous conversation:
${historyText}

User's latest response: "${userMessage}"

INSTRUCTIONS FOR ROUND 2/2 (FINAL):
- Acknowledge their responses
- Briefly summarize what you understood
- Ask if there's anything else they'd like to add or change
- Keep it short (2-3 sentences)
- This is the final clarification before implementation

Generate your response:`.trim();
    }

    return this.buildClarificationPrompt(session, userMessage);
  }
}