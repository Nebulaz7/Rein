import { Controller, Get, Post, Param } from '@nestjs/common';
import { LazyJobScheduler } from '../common/lazy-job-scheduler.service';

@Controller('jobs')
export class JobsController {
  constructor(private lazyJobScheduler: LazyJobScheduler) {}

  /**
   * Get all jobs status
   * GET /jobs/status
   */
  @Get('status')
  async getJobsStatus() {
    const jobs = await this.lazyJobScheduler.getAllJobsStatus();
    return {
      success: true,
      jobs,
    };
  }

  /**
   * Get specific job status
   * GET /jobs/status/:jobName
   */
  @Get('status/:jobName')
  async getJobStatus(@Param('jobName') jobName: string) {
    const job = await this.lazyJobScheduler.getJobStatus(jobName);
    return {
      success: true,
      job,
    };
  }

  /**
   * Check and run all due jobs
   * POST /jobs/check
   * 
   * Use this endpoint for:
   * - Health checks
   * - Webhooks from external services
   * - Manual triggers
   */
  @Post('check')
  async checkJobs() {
    await this.lazyJobScheduler.checkAndRunDueJobs();
    return {
      success: true,
      message: 'Job check completed',
    };
  }

  /**
   * Manually trigger a specific job
   * POST /jobs/trigger/:jobName
   */
  @Post('trigger/:jobName')
  async triggerJob(@Param('jobName') jobName: string) {
    await this.lazyJobScheduler.triggerJob(jobName);
    return {
      success: true,
      message: `Job ${jobName} triggered successfully`,
    };
  }
}
