import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { CommonModule } from './common/common.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { McpCalendarModule } from './mcp/calendar/mcp-calendar.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ChatModule, CommonModule, RoadmapModule, McpCalendarModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}