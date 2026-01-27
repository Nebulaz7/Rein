import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SimpleLlmService } from './simple-llm.service';

/**
 * Minimal ML Infrastructure Module for initial setup
 * This is a simplified version to get started without complex dependencies
 */
@Module({
  imports: [ConfigModule],
  providers: [SimpleLlmService],
  exports: [SimpleLlmService],
})
export class MlInfrastructureModuleSimple {}