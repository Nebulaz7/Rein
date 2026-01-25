"use client";

import React from "react";
import AIAuditorInsights from "../AIAuditorInsights";
import AICoachMessage from "../AICoachMessage";
import OpikQualityScores from "../OpikQualityScores";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Target, History, ArrowRight } from "lucide-react";

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
}

// Mock historical insights
const historicalInsights = [
  {
    id: "1",
    date: "Jan 24, 2026",
    insight:
      "Morning productivity peaked between 9-11 AM. Consider scheduling deep work during this window.",
    confidence: 89,
  },
  {
    id: "2",
    date: "Jan 23, 2026",
    insight:
      "GitHub commits increased by 40% after implementing the Pomodoro technique suggestion.",
    confidence: 94,
  },
  {
    id: "3",
    date: "Jan 22, 2026",
    insight:
      "Calendar conflicts detected on Wednesdays. Recommendation: Block focus time.",
    confidence: 87,
  },
];

export default function InsightsView({
  qualityScores,
  improvement,
  coachMessage,
  auditInsight,
  auditStats,
}: InsightsViewProps) {
  return (
    <div className="space-y-6">
      {/* AI Coach Banner */}
      <AICoachMessage
        message={coachMessage.message}
        confidence={coachMessage.confidence}
      />

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
              <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">
                      Optimize Morning Routine
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on your completion patterns, starting with GitHub
                      tasks before 10 AM increases your daily completion rate by
                      23%.
                    </p>
                    <button className="flex items-center gap-1 text-xs font-bold text-primary mt-2 hover:underline">
                      Apply to Calendar <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-secondary/50 border-2 border-border rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">
                      Break Pattern Detected
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      You tend to skip Calendar events after 3 PM. Consider
                      shorter 25-minute blocks for afternoon sessions.
                    </p>
                    <button className="flex items-center gap-1 text-xs font-bold text-primary mt-2 hover:underline">
                      Adjust Schedule <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-500/5 border-2 border-green-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Streak Protection</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      You're on a 12-day streak! To maintain momentum, complete
                      at least one GitHub task today before 6 PM.
                    </p>
                    <Badge className="mt-2 bg-green-500/20 text-green-700 border-green-500">
                      High Priority
                    </Badge>
                  </div>
                </div>
              </div>
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
              {historicalInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-3 bg-secondary/30 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">{insight.insight}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {insight.date} • {insight.confidence}% confidence
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] shrink-0 ml-2"
                    >
                      Opik Tracked
                    </Badge>
                  </div>
                </div>
              ))}
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
