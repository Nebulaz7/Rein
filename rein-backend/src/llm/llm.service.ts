import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class LlmService implements OnModuleInit {
  private genAI: GoogleGenAI;
  private opik: any;
  private readonly logger = new Logger(LlmService.name);

  constructor() {
    this.genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });
  }

  async onModuleInit() {
    try {
      const { Opik } = await import('opik');
      this.opik = new Opik({ 
        apiKey: process.env.OPIK_API_KEY || '',
        projectName: process.env.OPIK_PROJECT_NAME || 'rein-ai',
      });
      this.logger.log('Opik initialized successfully');
    } catch (error) {
      this.logger.warn('Opik initialization failed, continuing without tracing', error);
    }
  }

  async generateContent(
    systemPrompt: string,
    userPrompt: string,
    traceName: string,
    promptMetadata?: Record<string, any>,
  ): Promise<any> {
    const trace = this.opik.trace({ 
      name: traceName,
      metadata: {
        timestamp: new Date().toISOString(),
        ...promptMetadata, // Include prompt versioning metadata
      },
    });

    try {
      const prompt = `${systemPrompt}\n\nUser input: ${userPrompt}\nOutput as JSON only.`;
      
      // Create input span
      const inputSpan = trace.span({
        name: 'llm_input',
        input: { system: systemPrompt, user: userPrompt },
      });
      inputSpan.end();

      const result = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      const responseText = result.text || '';
      
      // Parse JSON safely
      let output: any;
      try {
        output = JSON.parse(responseText);
      } catch {
        output = { raw: responseText };
      }

      // Create output span
      const outputSpan = trace.span({
        name: 'llm_output',
        input: { output },
      });
      outputSpan.end();

      trace.end();

      return output;
    } catch (error: any) {
      this.logger.error(`LLM generation failed: ${error.message}`);
      trace.end();
      throw error;
    }
  }
}