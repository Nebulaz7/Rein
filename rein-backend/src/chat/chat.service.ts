import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { buildRoadmapPrompt } from '../../utils/index';
import { ParsedRoadmap } from '../../types/index';
import { GoalPreprocessorService } from '../preprocessor/goal-preprocessor.service';

export interface RoadmapResponse {
  roadmap: ParsedRoadmap;
  shouldTriggerCalendar: boolean;
  calendarIntentReason?: string;
}

@Injectable()
export class ChatService {
  private ai: GoogleGenAI;

  constructor(private readonly goalPreprocessor: GoalPreprocessorService) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
  }

  async generateRoadmap(userMessage: string, modelType: 'sprint' | 'standard' | 'architect'): Promise<RoadmapResponse> {
    const { goal, known, experienceLevel } = await this.goalPreprocessor.preprocess(userMessage);
    const prompt = buildRoadmapPrompt(goal, known, experienceLevel);
    const modelMap = {
      sprint: 'gemini-2.5-flash',
      standard: 'gemini-2.5-flash',
      architect: 'gemini-2.5-flash',
     };
    const model = modelMap[modelType] || modelMap.standard;

    // Define strict response schema using Type enum
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        roadmap: {
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
      required: ['roadmap', 'triggerCalendar'],
    };

    const fullPrompt = `
You are an expert roadmap builder and learning specialist.

Your task is to generate a structured learning roadmap based on the goal below.

Additionally, detect if the user wants calendar integration — only set triggerCalendar to true if they explicitly mention scheduling, reminders, deadlines, calendar events, check-ins, etc.

User's original message: "${userMessage}"

Roadmap goal: ${prompt}

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
        model,
        contents: fullPrompt,
        config: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      console.log("Using model: ", model)

      text = response.text ?? '';

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(text);

      return {
        roadmap: parsed.roadmap,
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
            const roadmap = JSON.parse(fallbackMatch[0]);
            return {
              roadmap,
              shouldTriggerCalendar: false,
            };
          }
        }
      } catch (fallbackErr) {
      }

      throw new Error(`Failed to generate or parse roadmap: ${err.message}`);
    }
  }
}