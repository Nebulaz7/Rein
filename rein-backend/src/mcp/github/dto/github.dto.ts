import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ConnectGitHubDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class MarkProcessedDto {
  @IsArray()
  @IsString({ each: true })
  commitIds: string[];
}

export class SyncCommitsDto {
  @IsString()
  @IsOptional()
  repository?: string;
}