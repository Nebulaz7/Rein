import { Module } from '@nestjs/common';
import { McpSlackController } from './mcp-slack.controller';
import { McpSlackService } from './mcp-slack.service';
import { SlackSchedulerService } from './slack-scheduler.service';
import { SlackAuthModule } from './auth/slack-auth.module';
import { AnchorModule } from '../../anchor/anchor.module';
import { SlackMessagingService } from './slack.messaging';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    AnchorModule.forRoot(SlackMessagingService),
    SlackAuthModule,
    PrismaModule,
    CommonModule, // Provides LazyJobScheduler
  ],
  controllers: [McpSlackController],
  providers: [McpSlackService, SlackSchedulerService],
  exports: [McpSlackService, SlackSchedulerService],
})
export class McpSlackModule {}
