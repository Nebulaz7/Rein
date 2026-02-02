import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { PreprocessedGoal, MissingField } from './types/preprocessor';
import { DateCalculator } from '../common/utils/date-calculator';

@Injectable()
export class GoalPreprocessorService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
  }

  async preprocess(message: string): Promise<PreprocessedGoal> {
    // ────────────────────────────────────────────────
    // Existing schema and prompt (unchanged)
    // ────────────────────────────────────────────────
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        goal: { type: Type.STRING },
        known: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        experienceLevel: {
          type: Type.STRING,
          nullable: true,
          enum: ['beginner', 'intermediate', 'advanced'],
        },
        formatPreference: {
          type: Type.STRING,
          nullable: true,
          enum: ['video', 'article', 'project', 'mixed'],
        },
        timeframe: { 
          type: Type.STRING,
          nullable: true,
        },
        specificFocus: {
          type: Type.ARRAY,
          nullable: true,
          items: { type: Type.STRING },
        },
      },
      required: ['goal', 'known'],
    };

    const prompt = `
You are an expert assistant that extracts detailed learning goals from user input.

From the user message below, extract and infer the following in valid JSON:

{
  "goal": "Clear, specific, actionable statement of what the user wants to learn or achieve",
  "known": ["List of skills, tools, languages, or concepts they already know or have experience with"],
  "experienceLevel": "beginner" | "intermediate" | "advanced" (infer from clues; null if unclear),
  "formatPreference": "video" | "article" | "project" | "mixed" (default to "mixed" unless explicitly stated),
  "timeframe": "Any mentioned duration (e.g., 'in 3 months', 'over 6 weeks', 'quick overview') or null",
  "specificFocus": ["Specific topics, areas, tools, or constraints they want to emphasize or avoid"] or null
}

GUIDELINES:
- Make the goal concise but specific and actionable
- Infer experience level from mentions of prior knowledge, tools used, or complexity of request
- Only set formatPreference if they clearly prefer one style
- IMPORTANT: Extract timeframe in natural language format (e.g., "3 months", "6 weeks", "2 weeks", "in 90 days")
- Capture any explicit focuses, constraints, or "avoid X" requests in specificFocus
- If uncertain, make intelligent defaults (e.g., mixed format, null timeframe)

User message:
"""${message}"""

Respond with valid JSON only, matching the schema exactly.
`.trim();

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const text = response.text ?? '';

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(text);

      // ────────────────────────────────────────────────
      // NEW: Calculate totalDays from timeframe
      // ────────────────────────────────────────────────
      const totalDays = DateCalculator.parseTimeframeToTotalDays(
        parsed.timeframe
      );

      return {
        goal: parsed.goal,
        known: parsed.known || [],
        experienceLevel: parsed.experienceLevel ?? undefined,
        formatPreference: parsed.formatPreference ?? undefined,
        timeframe: parsed.timeframe ?? undefined,
        specificFocus: parsed.specificFocus ?? undefined,
        totalDays, // ← NEW: Add computed field
      };
    } catch (err: any) {
      console.error('Gemini preprocessing failed:', err.message);
      console.error('Raw output (if any):', err?.response?.text?.());
      throw new Error(`Failed to preprocess goal with Gemini: ${err.message}`);
    }
  }

  /**
   * Rule-based detection of missing/unclear fields.
   * Critical fields get priority 1; nice-to-have get priority 2.
   */
  private getMissingFields(parsed: PreprocessedGoal): MissingField[] {
    const missing: MissingField[] = [];

    // Priority 1: These strongly affect personalization quality
    if (!parsed.experienceLevel) {
      missing.push({
        field: 'experienceLevel',
        reason: 'Experience level is not mentioned or could not be inferred',
        priority: 1,
      });
    }

    if (!parsed.timeframe) {
      missing.push({
        field: 'timeframe',
        reason: 'No timeframe or deadline was provided',
        priority: 1,
      });
    }

    // Priority 2: Helpful for better tailoring, but not blockers
    if (!parsed.formatPreference) {
      missing.push({
        field: 'formatPreference',
        reason: 'Preferred learning format (video/article/project/mixed) not specified',
        priority: 2,
      });
    }

    if (!parsed.specificFocus?.length) {
      missing.push({
        field: 'specificFocus',
        reason: 'No specific topics, tools, sub-areas or constraints mentioned',
        priority: 2,
      });
    }

    return missing;
  }

  /**
   * Combined method: preprocess + detect missing fields
   * This is the main entry point most controllers/services should call.
   */
  async preprocessAndAnalyze(message: string): Promise<{
    parsed: PreprocessedGoal;
    missingFields: MissingField[];
  }> {
    const parsed = await this.preprocess(message);
    const missingFields = this.getMissingFields(parsed);

    return { parsed, missingFields };
  }

  /**
   * NEW: Get spacing information for a preprocessed goal
   * Useful for UI to show "This plan will have daily/weekly tasks"
   */
  getSpacingInfo(preprocessed: PreprocessedGoal): {
    totalDays: number;
    nodeSpacing: number;
    spacingDescription: string;
    stageCount: number;
    estimatedNodeCount: number;
  } {
    const totalDays = preprocessed.totalDays || 30;
    const rule = DateCalculator.getSpacingRule(totalDays);
    
    let spacingDescription = '';
    if (rule.nodeSpacing === 1) {
      spacingDescription = 'daily tasks';
    } else if (rule.nodeSpacing === 2 || rule.nodeSpacing === 3) {
      spacingDescription = `tasks every ${rule.nodeSpacing} days`;
    } else if (rule.nodeSpacing === 7) {
      spacingDescription = 'weekly tasks';
    } else if (rule.nodeSpacing === 14) {
      spacingDescription = 'bi-weekly tasks';
    }

    const estimatedNodeCount = DateCalculator.getRecommendedNodeCount(totalDays);

    return {
      totalDays,
      nodeSpacing: rule.nodeSpacing,
      spacingDescription,
      stageCount: rule.stageCount,
      estimatedNodeCount,
    };
  }
}