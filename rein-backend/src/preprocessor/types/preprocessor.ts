export interface PreprocessedGoal {
  goal: string;
  known: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  formatPreference?: 'video' | 'article' | 'project' | 'mixed';
  timeframe?: string;
  specificFocus?: string[];
  totalDays?: number;
}

export interface MissingField {
  field: keyof PreprocessedGoal;
  reason: string;
  priority: 1 | 2;
}