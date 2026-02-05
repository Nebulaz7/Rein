import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

interface OpikTrace {
  span: (config: any) => OpikSpan;
  score: (config: any) => void;
  end: () => OpikTrace;
}

interface OpikSpan {
  update: (config: any) => void;
  end: () => OpikSpan;
  score: (config: any) => void;
}

interface OpikClient {
  trace: (config: any) => OpikTrace;
  createDataset: (name: string, description?: string) => Promise<any>;
  getOrCreateDataset: (name: string, description?: string) => Promise<any>;
}

@Injectable()
export class OpikClientService implements OnModuleInit, OnModuleDestroy {
  private opik: OpikClient;
  private readonly logger = new Logger(OpikClientService.name);

  async onModuleInit() {
    try {
      // Initialize Opik client with API key and workspace from environment using dynamic import
      const { Opik } = await import('opik');
      this.opik = new Opik({
        apiKey: process.env.OPIK_API_KEY || '',
        projectName: process.env.OPIK_PROJECT_NAME || 'rein-ai',
      });

      this.logger.log('Opik client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Opik client', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      // Cleanup if needed
      this.logger.log('Opik client cleanup completed');
    } catch (error) {
      this.logger.error('Error during Opik client cleanup', error);
    }
  }

  /**
   * Get the Opik client instance
   */
  getClient(): OpikClient {
    if (!this.opik) {
      throw new Error('Opik client not initialized');
    }
    return this.opik;
  }

  /**
   * Start a trace for tracking a complete operation
   */
  startTrace(name: string, metadata?: Record<string, any>): OpikTrace {
    const client = this.getClient();
    return client.trace({
      name,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });
  }

  /**
   * Create a span within a trace for sub-operations
   */
  createSpan(trace: OpikTrace, name: string, input?: Record<string, any>): OpikSpan {
    return trace.span({
      name,
      input: input
        ? {
            data: input,
            timestamp: new Date().toISOString(),
          }
        : undefined,
    });
  }

  /**
   * Log output and complete a span
   */
  endSpan(span: OpikSpan, output?: any): OpikSpan {
    span.update({
      output: {
        data: output,
        timestamp: new Date().toISOString(),
      },
    });
    return span.end();
  }

  /**
   * Log a completed trace
   */
  endTrace(trace: OpikTrace): OpikTrace {
    return trace.end();
  }

  /**
   * Log a score for a trace
   */
  logTraceScore(trace: OpikTrace, name: string, value: number, reason?: string): void {
    trace.score({
      name,
      value,
      reason,
    });
  }

  /**
   * Log a score for a span
   */
  logSpanScore(span: OpikSpan, name: string, value: number, reason?: string): void {
    span.score({
      name,
      value,
      reason,
    });
  }

  /**
   * Create an evaluation dataset
   */
  async createDataset(name: string, description?: string): Promise<any> {
    const client = this.getClient();
    return client.createDataset(name, description);
  }

  /**
   * Get or create a dataset
   */
  async getOrCreateDataset(name: string, description?: string): Promise<any> {
    const client = this.getClient();
    return client.getOrCreateDataset(name, description);
  }

  /**
   * Log evaluation result using trace score
   */
  logEvaluation(
    trace: OpikTrace,
    scorerName: string,
    score: number,
    reason?: string,
  ): void {
    trace.score({
      name: scorerName,
      value: score,
      reason,
    });
  }

  /**
   * Generate LLM content with Gemini and trace it
   */
  async llmGenerate(
    systemPrompt: string,
    userPrompt: string,
    trace: OpikTrace,
  ): Promise<any> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
      });

      const prompt = `${systemPrompt}\n\nUser input: ${userPrompt}\nOutput as JSON only.`;
      
      // Create input span
      const inputSpan = this.createSpan(trace, 'llm_input', { 
        system: systemPrompt, 
        user: userPrompt 
      });
      this.endSpan(inputSpan);

      const result = await genAI.models.generateContent({
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
      const outputSpan = this.createSpan(trace, 'llm_output', { output });
      this.endSpan(outputSpan);

      return output;
    } catch (error: any) {
      this.logger.error(`LLM generation failed: ${error.message}`);
      throw error;
    }
  }
}
