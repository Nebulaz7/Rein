"use client";

import React from "react";
import AIAuditorInsights from "../AIAuditorInsights";
import AICoachMessage from "../AICoachMessage";
import OpikQualityScores from "../OpikQualityScores";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Target, History, ArrowRight, TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { PerformanceSummary } from "@/lib/analytics";

interface QualityScore {
  label: string;
  score: number;
  maxScore?: number;
}

interface InsightsViewProps {
  qualityScores: QualityScore[];
  improvement: number;
  coachMessage: {
    message: string;
    confidence: number;
  };
  auditInsight: string;
  auditStats: { efficiency: number; stability: number };
  analytics: PerformanceSummary | null;
}

export default function InsightsView({
  qualityScores,
  improvement,
  coachMessage,
  auditInsight,
  auditStats,
  analytics,
}: InsightsViewProps) {
  return (
    <div className="space-y-6">
      {/* AI Coach Banner */}
      <AICoachMessage
        message={coachMessage.message}
        confidence={coachMessage.confidence}
      />

      {/* Empty State */}
      {!analytics && (
        <Card className="p-8 border-2 border-dashed border-border bg-secondary/20">
          <div className="text-center space-y-3">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="font-black text-lg">No Activity Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Complete your first task to unlock personalized insights and AI-powered recommendations
            </p>
          </div>
        </Card>
      )}

      {/* Analytics Performance Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Activity Score</p>
                <p className="text-3xl font-black mt-1">{analytics.scores.activityScore.toFixed(1)}/10</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <Badge className="bg-primary/10 text-primary border-primary">
                {analytics.activityBreakdown.total} activities
              </Badge>
            </div>
          </Card>

          <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Consistency</p>
                <p className="text-3xl font-black mt-1">{analytics.scores.consistencyScore.toFixed(1)}/10</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">{analytics.trends.activeDaysCount}/{analytics.period.days} active days</span>
            </div>
          </Card>

          <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Trend</p>
                <p className="text-3xl font-black mt-1">
                  {analytics.trends.weekOverWeekChange > 0 ? '+' : ''}{analytics.trends.weekOverWeekChange}%
                </p>
              </div>
              {analytics.trends.weekOverWeekChange >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Most active: {analytics.trends.mostActiveDay}</span>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Current Recommendations */}
          <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-black uppercase">AI Recommendations</h3>
            </div>

            <div className="space-y-4">
              {analytics && analytics.recommendations.length > 0 ? (
                analytics.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      index === 0
                        ? 'bg-primary/5 border-primary/20'
                        : index === 1
                        ? 'bg-secondary/50 border-border'
                        : 'bg-green-500/5 border-green-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {index === 0 ? (
                        <Target className="w-5 h-5 text-primary mt-0.5" />
                      ) : index === 1 ? (
                        <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
                      ) : (
                        <Target className="w-5 h-5 text-green-600 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-secondary/50 border-2 border-border rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    Complete more tasks to unlock personalized recommendations
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Historical Insights */}
          <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-black uppercase">Insight History</h3>
              </div>
              <button className="text-xs font-bold text-primary hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {analytics?.historicalInsights && analytics.historicalInsights.length > 0 ? (
                analytics.historicalInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-3 bg-secondary/30 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm">{insight.insight}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {insight.date} • {insight.type}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] shrink-0 ml-2"
                      >
                        {insight.type === 'achievement' ? '🏆 Achievement' : 
                         insight.type === 'pattern' ? '📊 Pattern' : '💡 Tip'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-secondary/50 border-2 border-border rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    Complete more activities to build your insight history
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Opik Quality Scores */}
          <OpikQualityScores
            scores={qualityScores}
            improvement={improvement}
            weekLabel="Week 1"
          />

          {/* AI Auditor */}
          <AIAuditorInsights
            insight={auditInsight}
            stats={auditStats}
            traceId={Math.random().toString(36).substring(7)}
          />
        </div>
      </div>
    </div>
  );
}
