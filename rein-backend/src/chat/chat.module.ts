import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GoalPreprocessorService } from '../preprocessor/goal-preprocessor.service';

@Module({
  controllers: [ChatController],
  providers: [GoalPreprocessorService, ChatService],
})
export class ChatModule {}