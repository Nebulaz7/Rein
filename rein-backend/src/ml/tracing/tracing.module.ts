import { Module } from '@nestjs/common';
import { TracingService } from './tracing.service';
import { OpikClientModule } from '../opik/opik-client.module';

@Module({
  imports: [OpikClientModule],
  providers: [TracingService],
  exports: [TracingService],
})
export class TracingModule {}
