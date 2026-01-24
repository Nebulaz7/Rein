import { Module } from '@nestjs/common';
import { ChatController } from './generator.controller';
import { ChatService } from './generator.service';
import { GoalPreprocessorService } from '../preprocessor/goal-preprocessor';

@Module({
  controllers: [ChatController],
  providers: [GoalPreprocessorService, ChatService],
})
export class GeneratorModule {}
