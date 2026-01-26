import { Module } from '@nestjs/common';
import { McpCalendarService } from './mcp-calendar.service';
import { McpCalendarController } from './mcp-calendar.controller';

@Module({
  controllers: [McpCalendarController],
  providers: [McpCalendarService],
  exports: [McpCalendarService],
})
export class McpCalendarModule {}