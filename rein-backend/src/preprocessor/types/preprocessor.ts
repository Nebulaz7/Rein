export interface PreprocessedGoal {
  goal: string;
  known: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  formatPreference?: 'video' | 'article' | 'project' | 'mixed';
  timeframe?: string;
  specificFocus?: string[];
  totalDays?: number;
  // NEW: Goal classification fields
  goalType?: GoalType;
  requiresPractical?: boolean;
  suggestedPlatforms?: PracticalPlatform[];
  practicalGuidance?: string;
}

export interface MissingField {
  field: keyof PreprocessedGoal;
  reason: string;
  priority: 1 | 2;
}

export type GoalType =
  | 'coding-learning'
  | 'non-coding-learning'
  | 'execution'
  | 'mixed';

export type PracticalPlatform = 'github' | 'calendar' | 'slack';
