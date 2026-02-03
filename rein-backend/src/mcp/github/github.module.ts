import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { GitHubService } from './github.service';
import { GitHubController } from './github.controller';

@Module({
  imports: [HttpModule],
  controllers: [GitHubController],
  providers: [PrismaService, GitHubService],
  exports: [GitHubService, PrismaService],
})
export class GitHubModule {}