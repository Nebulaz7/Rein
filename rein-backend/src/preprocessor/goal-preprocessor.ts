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
        // NEW: Goal classification fields
        goalType: {
          type: Type.STRING,
          enum: ['coding-learning', 'non-coding-learning', 'execution', 'mixed'],
        },
        requiresPractical: { type: Type.BOOLEAN },
        suggestedPlatforms: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            enum: ['github', 'calendar', 'slack'],
          },
        },
        practicalGuidance: {
          type: Type.STRING,
          nullable: true,
        },
      },
      required: ['goal', 'known', 'goalType', 'requiresPractical', 'suggestedPlatforms'],
    };

    const prompt = `
You are an expert assistant that extracts detailed learning goals from user input AND classifies the goal type.

From the user message below, extract and infer the following in valid JSON:

{
  "goal": "Clear, specific, actionable statement of what the user wants to learn or achieve",
  "known": ["List of skills, tools, languages, or concepts they already know or have experience with"],
  "experienceLevel": "beginner" | "intermediate" | "advanced" (infer from clues; null if unclear),
  "formatPreference": "video" | "article" | "project" | "mixed" (default to "mixed" unless explicitly stated),
  "timeframe": "Any mentioned duration (e.g., 'in 3 months', 'over 6 weeks', 'quick overview') or null",
  "specificFocus": ["Specific topics, areas, tools, or constraints they want to emphasize or avoid"] or null,
  
  // NEW: Goal classification
  "goalType": "coding-learning" | "non-coding-learning" | "execution" | "mixed",
  "requiresPractical": boolean,
  "suggestedPlatforms": ["github" | "calendar" | "slack"],
  "practicalGuidance": "Brief note on what practical exercises should focus on (1 sentence)" or null
}

GOAL TYPE CLASSIFICATION:
- "coding-learning": User wants to learn programming, coding, or technical development skills
  Examples: "Learn React", "Master Python", "Build APIs with Node.js", "Learn data structures"
  
- "non-coding-learning": User wants to learn non-technical skills or knowledge
  Examples: "Master data governance", "Learn marketing strategy", "Understand GDPR compliance", "Study project management"
  
- "execution": User wants to execute/build/launch something (not primarily learning)
  Examples: "Launch my SaaS MVP", "Write a book", "Build my portfolio website", "Ship 3 features"
  
- "mixed": Combination of learning + execution
  Examples: "Learn React and build 3 projects", "Master backend development while shipping my startup"

PRACTICAL REQUIREMENTS:
- Set requiresPractical = true if the goal REQUIRES hands-on practice to achieve mastery
- Coding goals: ALWAYS require practical (building projects)
- Learning goals: Usually require practical (exercises, case studies, implementations)
- Execution goals: Entire goal IS practical

PLATFORM SUGGESTIONS:
- github: Suggest if goal involves coding, software development, or version-controlled projects
- calendar: Suggest if goal involves scheduled activities (daily practice, reading, gym, meetings)
- slack: Suggest if goal involves sprint-based execution, team projects, or product development
- Can suggest MULTIPLE platforms (e.g., ["github", "calendar"] for "Learn React daily for 6 weeks")

PRACTICAL GUIDANCE:
- Briefly describe what practical exercises should focus on
- Examples:
  * "Build small projects incrementing in complexity from todo apps to full-stack applications"
  * "Write real compliance policies and conduct mock audits for fictional companies"
  * "Create daily workout routines and track nutrition with spreadsheets"

GUIDELINES:
- Make the goal concise but specific and actionable
- Infer experience level from mentions of prior knowledge, tools used, or complexity of request
- IMPORTANT: Extract timeframe in natural language format (e.g., "3 months", "6 weeks", "2 weeks")
- Capture any explicit focuses, constraints, or "avoid X" requests in specificFocus
- Be thoughtful about goal classification - it affects the entire roadmap structure

User message:
"""${message}"""

Respond with valid JSON only, matching the schema exactly.
`.trim();

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
        config: {
          temperature: 0.3, // Slightly higher for classification reasoning
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const text = response.text ?? '';

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(text);

      // Calculate totalDays from timeframe
      const totalDays = DateCalculator.parseTimeframeToTotalDays(parsed.timeframe);

      return {
        goal: parsed.goal,
        known: parsed.known || [],
        experienceLevel: parsed.experienceLevel ?? undefined,
        formatPreference: parsed.formatPreference ?? undefined,
        timeframe: parsed.timeframe ?? undefined,
        specificFocus: parsed.specificFocus ?? undefined,
        totalDays,
        // NEW: Goal classification
        goalType: parsed.goalType,
        requiresPractical: parsed.requiresPractical,
        suggestedPlatforms: parsed.suggestedPlatforms || [],
        practicalGuidance: parsed.practicalGuidance ?? undefined,
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