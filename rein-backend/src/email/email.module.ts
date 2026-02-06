import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './services/email.service';
import { EmailTemplateService } from './services/email-template.service';
import { EmailSchedulerService } from './services/email-scheduler.service';
import { EmailController } from './email.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CommonModule, // Provides LazyJobScheduler
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailTemplateService, EmailSchedulerService],
  exports: [EmailService], // Export so other modules can use it
})
export class EmailModule {}