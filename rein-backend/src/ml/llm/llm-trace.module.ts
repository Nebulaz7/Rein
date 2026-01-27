import { Module } from '@nestjs/common';
import { LlmServiceWithTracing } from './llm-service-with-tracing';
import { OpikClientModule } from '../opik/opik-client.module';

@Module({
  imports: [OpikClientModule],
  providers: [LlmServiceWithTracing],
  exports: [LlmServiceWithTracing],
})
export class LlmTraceModule {}
