import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { LazyJobScheduler } from './lazy-job-scheduler.service';
import { JobsController } from './jobs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobsController],
  providers: [SupabaseService, LazyJobScheduler],
  exports: [SupabaseService, LazyJobScheduler],
})
export class CommonModule {}