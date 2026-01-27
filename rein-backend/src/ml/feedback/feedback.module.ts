import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { OpikClientModule } from '../opik/opik-client.module';

@Module({
  imports: [OpikClientModule],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
