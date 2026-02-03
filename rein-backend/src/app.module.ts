import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { GeneratorModule } from './generator/generator.module';
import { CommonModule } from './common/common.module';
import { ResolutionModule } from './resolution/resolution.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ContextModule } from './context/context.module';
import { MlInfrastructureModule } from './ml/ml-infrastructure.module';
import { McpCalendarModule } from './mcp/calendar/mcp-calendar.module';
import { McpSlackModule } from './mcp/slack/mcp-slack.module';
import { AnchorModule } from './anchor/anchor.module';
import { SlackMessagingService } from './mcp/slack/slack.messaging';
import { GitHubModule } from './mcp/github/github.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AnchorModule.forRoot(SlackMessagingService),
    MlInfrastructureModule,
    GeneratorModule,
    ContextModule,
    PrismaModule,
    CommonModule,
    GitHubModule,
    ResolutionModule,
    UserModule,
    McpCalendarModule,
    McpSlackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
