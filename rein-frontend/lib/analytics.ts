// Analytics API utilities for frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rein-63fq.onrender.com';

export interface ActivityBreakdown {
  github: number;
  slack: number;
  calendar: number;
  total: number;
}

export interface Scores {
  activityScore: number;
  consistencyScore: number;
  overallScore: number;
}

export interface Trends {
  weekOverWeekChange: number;
  mostActiveDay: string;
  activeDaysCount: number;
  inactiveDaysCount: number;
}

export interface QualityMetrics {
  goalClarity: number;
  taskActionability: number;
  personalization: number;
}

export interface AuditInsights {
  message: string;
  efficiency: number;
  stability: number;
}

export interface PerformanceSummary {
  period: {
    start: string;
    end: string;
    days: number;
  };
  activityBreakdown: ActivityBreakdown;
  taskDistribution: ActivityBreakdown;
  scores: Scores;
  trends: Trends;
  recommendations: string[];
  qualityMetrics: QualityMetrics;
  auditInsights: AuditInsights;
  weeklyProgress: Array<{
    day: string;
    completed: number;
    total: number;
  }>;
  historicalInsights: Array<{
    date: string;
    insight: string;
    type: 'achievement' | 'pattern' | 'recommendation';
  }>;
}

export const analyticsAPI = {
  async getPerformanceSummary(
    resolutionId: string,
    days: number = 7
  ): Promise<{ success: boolean; data?: PerformanceSummary; error?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/performance/resolution/${resolutionId}?days=${days}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      };
    }
  },
};
