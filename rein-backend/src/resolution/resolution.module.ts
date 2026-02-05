import { Module } from '@nestjs/common';
import { ResolutionService } from './resolution.service';
import { ResolutionController } from './resolution.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { GoalScoringService } from '../analytics/goal-scoring.service';

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [ResolutionService, GoalScoringService],
  controllers: [ResolutionController],
})
export class ResolutionModule {}