import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpikClient } from '@opik/opik';  // Assuming Opik SDK import

@Injectable()
export class LlmService {
  private genAI: GoogleGenerativeAI;
  private opikClient: OpikClient;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.opikClient = new OpikClient({ apiKey: process.env.OPIK_API_KEY });
  }

  async generateContent(systemPrompt: string, userPrompt: string, traceName: string): Promise<any> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const trace = this.opikClient.startTrace({ name: traceName });

    try {
      const prompt = `${systemPrompt}\n\nUser input: ${userPrompt}\nOutput as JSON only.`;
      const result = await model.generateContent(prompt);
      const output = JSON.parse(result.response.text());  // Force JSON parse

      trace.log({ input: { system: systemPrompt, user: userPrompt }, output });
      trace.end({ status: 'success' });

      return output;
    } catch (error) {
      trace.end({ status: 'error', error: error.message });
      throw error;
    }
  }
}