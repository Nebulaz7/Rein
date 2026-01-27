import { Module } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { OpikClientModule } from '../opik/opik-client.module';

@Module({
  imports: [OpikClientModule],
  providers: [EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
