import { Module } from '@nestjs/common';
import { OpikClientModule } from './opik/opik-client.module';
import { TracingModule } from './tracing/tracing.module';
import { LlmTraceModule } from './llm/llm-trace.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { FeedbackModule } from './feedback/feedback.module';

/**
 * ML Infrastructure Module
 *
 * Aggregates all ML-related modules:
 * - Opik client for tracing
 * - Tracing utilities and decorators
 * - LLM service with tracing
 * - Evaluation service
 * - Feedback collection service
 *
 * Import this module in your AppModule to enable ML tracing across the application.
 */
@Module({
  imports: [
    OpikClientModule.forRoot(),
    TracingModule,
    LlmTraceModule,
    EvaluationModule,
    FeedbackModule,
  ],
  exports: [
    OpikClientModule,
    TracingModule,
    LlmTraceModule,
    EvaluationModule,
    FeedbackModule,
  ],
})
export class MlInfrastructureModule {}
