import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { buildResolutionPrompt } from '../common/utils/index';
import { ParsedResolution } from '../common/types/index';
import { GoalPreprocessorService } from '../preprocessor/goal-preprocessor';

export interface ResolutionResponse {
  resolution: ParsedResolution;
  shouldTriggerCalendar: boolean;
  calendarIntentReason?: string;
}

@Injectable()
export class ChatService {
  private ai: GoogleGenAI;

  constructor(private readonly goalPreprocessor: GoalPreprocessorService) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
  }

  async generateResolution(prompt: string, modeType: 'plan' | 'agent'): Promise<ResolutionResponse> {
    const { goal, known, experienceLevel } = await this.goalPreprocessor.preprocess(prompt);
    const message = buildResolutionPrompt(goal, known, experienceLevel);

    // Define strict response schema using Type enum
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        resolution: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    resources: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING },
                          title: { type: Type.STRING },
                          link: { type: Type.STRING },
                          description: { type: Type.STRING },
                        },
                        required: ['type', 'title', 'link', 'description'],
                      },
                    },
                  },
                  required: ['id', 'title', 'description', 'resources'],
                },
              },
            },
            required: ['id', 'title', 'description', 'nodes'],
          },
        },
        triggerCalendar: { type: Type.BOOLEAN },
        calendarIntentReason: { 
          type: Type.STRING,
          nullable: true,
        },
      },
      required: ['resolution', 'triggerCalendar'],
    };

    const fullPrompt = `
You are an expert roadmap builder and learning specialist.

Your task is to generate a structured learning roadmap based on the goal below.

Additionally, detect if the user wants calendar integration — only set triggerCalendar to true if they explicitly mention scheduling, reminders, deadlines, calendar events, check-ins, etc.

User's original message: "${prompt}"

Roadmap goal: ${message}

Examples where triggerCalendar = true:
- "Make a 6-week plan with weekly reminders"
- "Add this to my calendar with deadlines"

Examples where triggerCalendar = false:
- "Give me a roadmap to learn TypeScript"
- "How to master backend development"

ROADMAP GUIDELINES:
- Each stage: meaningful title, 2–3 sentence description explaining why it's important
- Each node: detailed 2–3 sentence educational description
- Exactly 3 high-quality resources per node (video, article, project mix)
- Use reputable sources (MDN, official docs, FreeCodeCamp, Traversy Media, etc.)
- Realistic and valid-looking links

Output must be valid JSON matching the schema.
`.trim();

    let text = '';
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      console.log("Using model: gemini-2.5-flash");

      text = response.text ?? '';

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(text);

      return {
        resolution: parsed.resolution,
        shouldTriggerCalendar: parsed.triggerCalendar,
        calendarIntentReason: parsed.calendarIntentReason ?? undefined,
      };
    } catch (err: any) {
      console.error('Gemini generation failed:', err.message);
      console.error('Raw output (if any):', err?.response?.text?.());

      try {
        if (text) {
          const fallbackMatch = text.match(/\[[\s\S]*\]/);
          if (fallbackMatch) {
            const resolution = JSON.parse(fallbackMatch[0]);
            return {
              resolution,
              shouldTriggerCalendar: false,
            };
          }
        }
      } catch (fallbackErr) {
      }

      throw new Error(`Failed to generate or parse resolution: ${err.message}`);
    }
  }
}
