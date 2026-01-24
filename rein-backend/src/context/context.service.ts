import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { GoalPreprocessorService } from '../preprocessor/goal-preprocessor';
import { ClarificationSessionService } from './session/context-session.service'; // ← rename later if desired
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
    | { type: 'skip'; resolutionId?: string }           // frontend should go directly to resolution
    | { type: 'clarify'; session: ClarificationSession } // frontend goes to context/clarify page
  > {
    const { parsed, missingFields } = await this.preprocessor.preprocessAndAnalyze(payload.prompt);

    if (missingFields.length === 0) {
      // TODO: call your resolution generator here
      // const resolution = await this.resolutionService.generate(parsed, payload.prompt);
      // return { type: 'skip', resolutionId: resolution.id };
      return { type: 'skip' }; // placeholder
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
        assistantMessage: "You've reached the maximum number of clarification rounds. Click Implement to generate your resolution.",
        roundCount: session.roundCount,
        isAtLimit: true,
      };
    }

    // Build the prompt for clarification (we'll define this function next step)
    const prompt = this.buildClarificationPrompt(session, payload.userMessage);

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.6,
          maxOutputTokens: 350,
        },
      });

      const assistantMessage = response.text?.trim() || "Sorry, I couldn't generate a response. Please try again.";

      // Update session
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
    } catch (err) {
      throw new BadRequestException(`Failed to generate clarification: ${err.message}`);
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

  // ────────────────────────────────────────────────
  // Placeholder — we will implement this properly next
  // ────────────────────────────────────────────────
  private buildClarificationPrompt(
    session: ClarificationSession,
    userMessage: string,
  ): string {
    // This will be replaced in the next step with the real prompt template
    return `Clarification prompt placeholder\nUser: ${userMessage}\nSession: ${JSON.stringify(session, null, 2)}`;
  }
}