import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class LlmService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;
  private opik: any;
  private readonly logger = new Logger(LlmService.name);

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async onModuleInit() {
    try {
      const { Opik } = await import('opik');
      this.opik = new Opik({ 
        apiKey: process.env.OPIK_API_KEY || '',
        projectName: process.env.OPIK_PROJECT_NAME || 'rein-ai-coaching',
      });
      this.logger.log('Opik initialized successfully');
    } catch (error) {
      this.logger.warn('Opik initialization failed, continuing without tracing', error);
    }
  }

  async generateContent(systemPrompt: string, userPrompt: string, traceName: string): Promise<any> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const trace = this.opik.trace({ 
      name: traceName,
      metadata: {
        timestamp: new Date().toISOString(),
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

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
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