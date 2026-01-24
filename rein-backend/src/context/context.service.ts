import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { GoalPreprocessorService } from '../preprocessor/goal-preprocessor';
import { ClarificationSessionService } from './session/context-session.service';
import { GoogleGenAI } from '@google/genai';
import {
  ClarificationSession,
  NextClarificationRequest,
  NextClarificationResponse,
} from '../common/types/context';

@Injectable()
export class ContextService {
  private ai: GoogleGenAI;

  constructor(
    private readonly preprocessor: GoalPreprocessorService,
    private readonly sessionService: ClarificationSessionService,
  ) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
  }

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
    const { parsed, missingFields } = await this.preprocessor.preprocessAndAnalyze(payload.prompt);

    if (missingFields.length === 0) {
      // TODO: Replace with real resolution generation when ready
      // const resolution = await this.resolutionService.generate(parsed, payload.prompt);
      // return { type: 'skip', resolutionId: resolution.id };
      return { type: 'skip' }; // placeholder — frontend should redirect to resolution
    }

    const session = await this.sessionService.startSession(userId, {
      originalPrompt: payload.prompt,
      parsedGoal: parsed,
      missingFields,
    });

    return { type: 'clarify', session };
  }

  /**
   * Process next user message → generate AI clarification question/response
   */
  async nextContext(
    userId: string,
    payload: NextClarificationRequest,
  ): Promise<NextClarificationResponse> {
    const session = await this.sessionService.getSession(userId, payload.sessionId);
    if (!session) {
      throw new NotFoundException('Clarification session not found or expired');
    }

    if (session.roundCount >= 2) {
      return {
        assistantMessage:
          "You've reached the maximum number of clarification rounds. Click Implement to generate your resolution.",
        roundCount: session.roundCount,
        isAtLimit: true,
      };
    }

    // Build the real clarification prompt
    const prompt = this.buildClarificationPrompt(session, payload.userMessage);

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash', // corrected (gemini-2.5-flash doesn't exist yet)
        contents: prompt,
        config: {
          temperature: 0.6,
          maxOutputTokens: 350,
        },
      });

      let assistantMessage = response.text?.trim();

      if (!assistantMessage) {
        assistantMessage = "Sorry, I couldn't generate a response. Please try again or click Implement.";
      }

      // Update session history
      const newHistory = [
        ...session.history,
        { role: 'user' as const, content: payload.userMessage, timestamp: new Date().toISOString() },
        { role: 'assistant' as const, content: assistantMessage, timestamp: new Date().toISOString() },
      ];

      await this.sessionService.updateSession(userId, session.sessionId, {
        history: newHistory,
        roundCount: session.roundCount + 1,
      });

      return {
        assistantMessage,
        roundCount: session.roundCount + 1,
        isAtLimit: session.roundCount + 1 >= 2,
      };
    } catch (err: any) {
      console.error('Gemini clarification error:', err);
      throw new BadRequestException(
        `Failed to generate clarification response: ${err.message || 'Unknown error'}`,
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
You are a concise, friendly, and focused assistant helping users build the best possible personalized learning resolution (roadmap/plan).

YOU ARE CURRENTLY IN CLARIFICATION MODE ONLY.
Your ONLY job right now is to ask clarifying questions — do NOT generate the final learning plan/resolution yet.

STRICT RULES YOU MUST FOLLOW:
1. Maximum 2 rounds of questions in total (current round: ${roundCount}/2).
   - If roundCount >= 2, do NOT ask anything more. Just say you're ready.
2. Ask at most 1–2 short, clear questions per turn. Prefer 1 strong, focused question.
3. Focus almost exclusively on clarifying the MISSING FIELDS below.
   - Only ask about other things if the user brings them up or it's obviously critical.
4. Use natural, encouraging, conversational language (2–5 sentences max).
5. Do NOT repeat questions already answered in history.
6. If you have enough information after round 1 (or even now), stop asking and indicate readiness.
7. Always end your response with EXACTLY one of these signals:
   - If still need clarification: Ask your question(s)
   - If ready (or round limit reached): "Looks great! I'm ready to build your personalized resolution. Click 'Implement' when you want to continue."
8. Never generate the actual roadmap, topics list, schedule, or detailed plan — wait for the user to click Implement.

Original user prompt:
"""${originalPrompt}"""

Parsed goal so far:
${JSON.stringify(parsedGoal, null, 2)}

Missing / unclear fields (prioritize these):
${missingText}

Previous conversation history:
${historyText}

Current user message (answer to your last question, or empty if first turn):
"""${userMessage || '(start of conversation)'}"""

Now respond ONLY with your clarification message.
Keep it short, friendly, and helpful.
`.trim();
  }
}