# Lazy Job Scheduler - Perfect for Sleeping Backends

## The Problem

Traditional cron jobs (`@Cron(CronExpression.EVERY_HOUR)`) don't work on sleeping backends like:
- Render Free Tier (sleeps after 15 min of inactivity)
- Heroku Free Tier
- Railway Free Tier
- Any serverless/auto-scaling platform

**Why?** When the backend sleeps, cron jobs don't run → missed jobs.

## The Solution: Lazy Jobs

Instead of: **"Run every X hours"**  
We use: **"Run when server wakes, but only if overdue"**

### How It Works

```
1. Job is registered with name + interval (e.g., "email-reminders", every 1 hour)
2. Last run time is persisted in database (JobSchedule table)
3. On server startup OR incoming request:
   - Check if job is due (current time - last run time >= interval)
   - If due → run it, update last run time
   - If not due → skip
```

### Benefits

✅ **No missed jobs** (just delayed until server wakes)  
✅ **No duplicate execution** (DB tracks last run)  
✅ **Works with sleeping backends**  
✅ **Simple setup**  
✅ **No external dependencies**

## Usage

### 1. Register a Job

In your service's `onModuleInit`:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { LazyJobScheduler } from '../../common/lazy-job-scheduler.service';

@Injectable()
export class MySchedulerService implements OnModuleInit {
  constructor(private lazyJobScheduler: LazyJobScheduler) {}

  async onModuleInit() {
    // Register job to run every 1 hour
    this.lazyJobScheduler.registerJob(
      'my-job-name',
      1, // interval in hours
      () => this.myJobHandler(),
    );
  }

  async myJobHandler() {
    // Your job logic here
    console.log('Job running!');
  }
}
```

### 2. Jobs Run Automatically

Jobs check on:
- **Server startup** (2 seconds after all jobs registered)
- **Manual trigger** via API endpoint (see below)

### 3. External Triggers (Optional)

For even more reliability on sleeping backends, you can set up external pings:

**Option A: UptimeRobot (Free)**
```
Service: UptimeRobot (https://uptimerobot.com)
Interval: Every 15 minutes
URL: https://your-app.com/jobs/check
Method: POST
```

**Option B: Cron-job.org (Free)**
```
Service: Cron-job.org
Interval: Every 30 minutes
URL: https://your-app.com/jobs/check
Method: POST
```

This keeps your backend awake AND ensures jobs run on schedule.

## API Endpoints

### Check All Jobs
```bash
POST /jobs/check
# Checks and runs all due jobs
```

### Get All Jobs Status
```bash
GET /jobs/status
# Returns:
{
  "success": true,
  "jobs": [
    {
      "jobName": "email-streak-reminders",
      "lastRunAt": "2026-02-05T12:00:00Z",
      "intervalHours": 1,
      "hoursSinceLastRun": "0.50",
      "isDue": false,
      "nextRunIn": "0.50"
    }
  ]
}
```

### Get Specific Job Status
```bash
GET /jobs/status/:jobName
```

### Manually Trigger Job
```bash
POST /jobs/trigger/:jobName
# Forces job to run immediately
```

## Current Jobs

### Email Jobs
- `email-streak-reminders` - Every 1 hour
- `email-weekly-digests` - Every 168 hours (1 week)

### Slack Jobs
- `slack-reminders` - Every 1 hour
- `slack-pending-commitments` - Every 1 hour

## Database Schema

```prisma
model JobSchedule {
  id            String   @id @default(uuid())
  jobName       String   @unique
  lastRunAt     DateTime
  intervalHours Int
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## Migration

Run this after pulling:
```bash
cd rein-backend
npx prisma migrate dev --name add_job_schedules
```

## Debugging

### Check if jobs are registered
```bash
curl http://localhost:5000/jobs/status
```

### Manually trigger a job
```bash
curl -X POST http://localhost:5000/jobs/trigger/email-streak-reminders
```

### Check server logs
Jobs log when they:
- Register: `Registered lazy job: email-streak-reminders (every 1h)`
- Are due: `Job "email-streak-reminders" is due (2.5h since last run)`
- Complete: `Job "email-streak-reminders" completed successfully`
- Skip: `Job "email-streak-reminders" not due yet (next run in 0.5h)`

## Why This Works Better Than Cron

| Traditional Cron | Lazy Jobs |
|-----------------|-----------|
| Runs at fixed time | Runs when due (flexible) |
| Misses jobs when sleeping | Never misses (just delayed) |
| Can run multiple times | Runs once per interval |
| Requires always-on server | Works with sleeping backends |
| No persistence | DB-backed |

## Production Checklist

- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Set up external ping service (UptimeRobot/Cron-job.org)
- [ ] Test job execution: `POST /jobs/check`
- [ ] Monitor job status: `GET /jobs/status`
- [ ] Check logs for job completion

## Future Improvements

- Add job execution history
- Add job failure retry logic
- Add Slack/email notifications for failed jobs
- Add job execution duration tracking
