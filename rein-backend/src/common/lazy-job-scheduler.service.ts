import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Lazy Job Scheduler - Perfect for sleeping backends (Render Free, etc.)
 * 
 * Instead of cron: "Run every X hours"
 * We use: "Run when server wakes, but only if overdue"
 * 
 * How it works:
 * 1. Jobs registered with name + interval
 * 2. On startup/request: check if job is due
 * 3. If due → run it, update last-run time
 * 4. If not → skip
 * 
 * Benefits:
 * - No missed jobs (just delayed)
 * - No duplicate execution
 * - Works with sleeping backends
 * - Persists in DB
 */
@Injectable()
export class LazyJobScheduler implements OnModuleInit {
  private readonly logger = new Logger(LazyJobScheduler.name);
  private jobs = new Map<string, () => Promise<void>>();

  constructor(private prisma: PrismaService) {}

  /**
   * Register a job to be run lazily
   */
  registerJob(
    name: string,
    intervalHours: number,
    handler: () => Promise<void>,
  ) {
    this.jobs.set(name, handler);
    this.logger.log(`Registered lazy job: ${name} (every ${intervalHours}h)`);

    // Ensure job exists in DB
    this.ensureJobExists(name, intervalHours);
  }

  /**
   * Check and run all due jobs
   * Call this on startup or on incoming requests
   */
  async checkAndRunDueJobs() {
    const now = new Date();

    for (const [jobName, handler] of this.jobs.entries()) {
      try {
        const jobSchedule = await this.prisma.jobSchedule.findUnique({
          where: { jobName },
        });

        if (!jobSchedule) {
          this.logger.warn(`Job ${jobName} not found in DB, skipping`);
          continue;
        }

        const hoursSinceLastRun =
          (now.getTime() - jobSchedule.lastRunAt.getTime()) / (1000 * 60 * 60);

        // Check if job is due
        if (hoursSinceLastRun >= jobSchedule.intervalHours) {
          this.logger.log(
            `Job "${jobName}" is due (${hoursSinceLastRun.toFixed(1)}h since last run)`,
          );

          // Run the job
          await handler();

          // Update last run time
          await this.prisma.jobSchedule.update({
            where: { jobName },
            data: { lastRunAt: now },
          });

          this.logger.log(`Job "${jobName}" completed successfully`);
        } else {
          const nextRunIn = jobSchedule.intervalHours - hoursSinceLastRun;
          this.logger.debug(
            `Job "${jobName}" not due yet (next run in ${nextRunIn.toFixed(1)}h)`,
          );
        }
      } catch (error) {
        this.logger.error(`Error running job "${jobName}":`, error);
      }
    }
  }

  /**
   * Manually trigger a specific job (for testing)
   */
  async triggerJob(jobName: string) {
    const handler = this.jobs.get(jobName);
    if (!handler) {
      throw new Error(`Job "${jobName}" not found`);
    }

    this.logger.log(`Manually triggering job: ${jobName}`);
    await handler();

    await this.prisma.jobSchedule.update({
      where: { jobName },
      data: { lastRunAt: new Date() },
    });
  }

  /**
   * Get job status
   */
  async getJobStatus(jobName: string) {
    const jobSchedule = await this.prisma.jobSchedule.findUnique({
      where: { jobName },
    });

    if (!jobSchedule) {
      return null;
    }

    const now = new Date();
    const hoursSinceLastRun =
      (now.getTime() - jobSchedule.lastRunAt.getTime()) / (1000 * 60 * 60);
    const isDue = hoursSinceLastRun >= jobSchedule.intervalHours;
    const nextRunIn = Math.max(0, jobSchedule.intervalHours - hoursSinceLastRun);

    return {
      jobName: jobSchedule.jobName,
      lastRunAt: jobSchedule.lastRunAt,
      intervalHours: jobSchedule.intervalHours,
      hoursSinceLastRun: hoursSinceLastRun.toFixed(2),
      isDue,
      nextRunIn: nextRunIn.toFixed(2),
    };
  }

  /**
   * Get all registered jobs status
   */
  async getAllJobsStatus() {
    const jobs = await this.prisma.jobSchedule.findMany();
    const now = new Date();

    return jobs.map((job) => {
      const hoursSinceLastRun =
        (now.getTime() - job.lastRunAt.getTime()) / (1000 * 60 * 60);
      const isDue = hoursSinceLastRun >= job.intervalHours;
      const nextRunIn = Math.max(0, job.intervalHours - hoursSinceLastRun);

      return {
        jobName: job.jobName,
        lastRunAt: job.lastRunAt,
        intervalHours: job.intervalHours,
        hoursSinceLastRun: hoursSinceLastRun.toFixed(2),
        isDue,
        nextRunIn: nextRunIn.toFixed(2),
      };
    });
  }

  /**
   * On module init, check and run due jobs
   */
  async onModuleInit() {
    this.logger.log('LazyJobScheduler initialized, checking for due jobs...');
    // Small delay to ensure all jobs are registered
    setTimeout(() => this.checkAndRunDueJobs(), 2000);
  }

  /**
   * Ensure job exists in database
   */
  private async ensureJobExists(name: string, intervalHours: number) {
    try {
      await this.prisma.jobSchedule.upsert({
        where: { jobName: name },
        create: {
          jobName: name,
          intervalHours,
          lastRunAt: new Date(0), // Unix epoch, ensures it runs immediately
        },
        update: {
          intervalHours, // Update interval if changed
        },
      });
    } catch (error) {
      this.logger.error(`Error ensuring job ${name} exists:`, error);
    }
  }
}
