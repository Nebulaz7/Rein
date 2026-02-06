export enum EmailType {
  WELCOME = 'welcome',
  STREAK_REMINDER = 'streak_reminder',
  STREAK_LOSS = 'streak_loss',
  WEEKLY_DIGEST = 'weekly_digest',
}

export enum EmailStatus {
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

// Template data interfaces
export interface WelcomeEmailData {
  userName: string;
  resolutionTitle: string;
  totalNodes: number;
  durationInDays: number;
  firstNodeTitle: string;
  firstNodeDate: string;
  resolutionId: string; // For linking to dashboard
}

export interface StreakReminderData {
  userName: string;
  currentStreak: number;
  todaysTasks: Array<{
    title: string;
    status: string;
    isOverdue: boolean;
  }>;
  appLink: string;
}

export interface StreakLossData {
  userName: string;
  lostStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  missedTasksCount: number;
  currentProgress: number;
}

export interface WeeklyDigestData {
  userName: string;
  weekStats: {
    currentStreak: number;
    longestStreak: number;
    tasksCompleted: number;
    totalTasks: number;
    progressPercent: number;
  };
  achievements: Array<{
    title: string;
    description: string;
  }>;
  overdueTasks: Array<{
    title: string;
    daysOverdue: number;
  }>;
  upcomingTasks: Array<{
    day: string;
    title: string;
  }>;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}