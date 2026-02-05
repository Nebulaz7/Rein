import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get('status/:userId')
  async getStatus(@Param('userId') userId: string) {
    return this.integrationsService.getIntegrationsStatus(userId);
  }

  @Post('calendar/sync')
  async syncCalendar(@Body() body: { userId: string; resolutionId: string }) {
    return this.integrationsService.syncCalendarRoadmap(body.userId, body.resolutionId);
  }
}
