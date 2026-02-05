import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('performance/resolution/:resolutionId')
  async getPerformanceSummary(
    @Param('resolutionId') resolutionId: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.analyticsService.getPerformanceSummary(resolutionId, daysNum);
  }
}
