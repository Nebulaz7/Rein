import { Module } from '@nestjs/common';
import { ContextController } from './context.controller';
import { ContextService } from './context.service';
import { GoalPreprocessorService } from '../preprocessor/goal-preprocessor';
import { ClarificationSessionService } from './session/context-session.service';

@Module({
  controllers: [ContextController],
  providers: [
    ContextService,
    GoalPreprocessorService,
    ClarificationSessionService,
  ],
  exports: [ContextService],
})
export class ContextModule {}
