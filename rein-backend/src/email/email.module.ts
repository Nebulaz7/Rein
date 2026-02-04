import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailService } from './services/email.service';
import { EmailTemplateService } from './services/email-template.service';
import { EmailSchedulerService } from './services/email-scheduler.service';
import { EmailController } from './email.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(), // Enable cron jobs
    PrismaModule,
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailTemplateService, EmailSchedulerService],
  exports: [EmailService], // Export so other modules can use it
})
export class EmailModule {}