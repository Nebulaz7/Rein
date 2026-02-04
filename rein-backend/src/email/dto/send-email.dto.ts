import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  html: string;

  @IsString()
  @IsOptional()
  text?: string;
}

export class UpdateEmailPreferencesDto {
  @IsBoolean()
  @IsOptional()
  welcomeEmail?: boolean;

  @IsBoolean()
  @IsOptional()
  streakLossAlert?: boolean;

  @IsBoolean()
  @IsOptional()
  streakReminder?: boolean;

  @IsBoolean()
  @IsOptional()
  weeklyDigest?: boolean;

  @IsBoolean()
  @IsOptional()
  milestoneEmails?: boolean;

  @IsString()
  @IsOptional()
  reminderTime?: string; // "18:00" format

  @IsString()
  @IsOptional()
  digestDay?: string; // "sunday"

  @IsString()
  @IsOptional()
  timezone?: string; // "America/New_York"
}