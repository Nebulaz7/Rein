import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Simplified LLM Service without complex tracing dependencies
 * Use this for initial integration until we fix the Opik setup
 */
@Injectable()
export class SimpleLlmService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async generateContent(
    systemPrompt: string, 
    userPrompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxOutputTokens?: number;
      outputFormat?: 'text' | 'json' | 'markdown';
    } = {}
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: options.model || 'gemini-2.0-flash' 
      });

      const fullPrompt = `${systemPrompt}\n\nUser: ${userPrompt}`;
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxOutputTokens || 1000,
        },
      });

      return result.response.text() || 'No response generated';
    } catch (error) {
      console.error('LLM generation error:', error);
      return 'Error generating content. Please try again.';
    }
  }
}