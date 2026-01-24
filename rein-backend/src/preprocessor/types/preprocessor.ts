export interface PreprocessedGoal {
  goal: string;
  known: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  formatPreference?: 'video' | 'article' | 'project' | 'mixed';
  timeframe?: string;
  specificFocus?: string[];
}

export interface MissingField {
  field: keyof PreprocessedGoal;
  reason: string;
  priority: 1 | 2; // 1 = critical (ask first), 2 = helpful but secondary
}