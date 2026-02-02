import { Module } from '@nestjs/common';
import { McpCalendarService } from './mcp-calendar.service';
import { McpCalendarController } from './mcp-calendar.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [McpCalendarController],
  providers: [McpCalendarService],
  exports: [McpCalendarService],
})
export class McpCalendarModule {}