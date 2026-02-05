import { Module } from '@nestjs/common';
import { OpikClientService } from '../ml/opik/opik-client.service';
import { GoalScoringService } from './goal-scoring.service';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [OpikClientService, AnalyticsService, GoalScoringService],
})
export class AnalyticsModule {}
