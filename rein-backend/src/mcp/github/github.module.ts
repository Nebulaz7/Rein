import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { GitHubService } from './github.service';
import { GitHubController } from './github.controller';
import { GitHubIssueService } from './github-issue.service';

@Module({
  imports: [HttpModule],
  controllers: [GitHubController],
  providers: [PrismaService, GitHubService, GitHubIssueService],
  exports: [GitHubService, PrismaService],
})
export class GitHubModule {}