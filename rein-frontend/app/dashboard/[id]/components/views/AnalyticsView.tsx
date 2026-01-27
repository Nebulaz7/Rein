"use client";

import React from "react";
import WeeklyChart from "../WeeklyChart";
import PlatformDistribution from "../PlatformDistribution";
import OpikQualityScores from "../OpikQualityScores";
import { Card } from "@/components/ui/card";
import { TrendingUp, Target, Zap } from "lucide-react";

interface WeeklyData {
  day: string;
  completed: number;
  total: number;
}

interface PlatformData {
  platform: "github" | "calendar" | "slack";
  taskCount: number;
  label?: string;
}

interface QualityScore {
  label: string;
  score: number;
  maxScore?: number;
}

interface AnalyticsViewProps {
  weeklyData: WeeklyData[];
  platformData: PlatformData[];
  qualityScores: QualityScore[];
  improvement: number;
}

export default function AnalyticsView({
  weeklyData,
  platformData,
  qualityScores,
  improvement,
}: AnalyticsViewProps) {
  // Calculate some stats
  const totalCompleted = weeklyData.reduce((sum, d) => sum + d.completed, 0);
  const totalTasks = weeklyData.reduce((sum, d) => sum + d.total, 0);
  const completionRate =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const avgScore =
    qualityScores.reduce((sum, s) => sum + s.score, 0) / qualityScores.length;

  return (
    <div className="space-y-6">
      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-green-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Completion Rate
              </p>
              <p className="text-2xl font-black text-green-600">
                {completionRate}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                AI Quality Score
              </p>
              <p className="text-2xl font-black text-primary">
                {avgScore.toFixed(1)}/10
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Tasks This Week
              </p>
              <p className="text-2xl font-black">
                {totalCompleted}/{totalTasks}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Chart - Full Width on its own row */}
        <div className="lg:col-span-12">
          <WeeklyChart data={weeklyData} title="Weekly Task Completion" />
        </div>

        {/* Platform Distribution & Quality Scores */}
        <div className="lg:col-span-6">
          <PlatformDistribution platforms={platformData} routingAccuracy={94} />
        </div>

        <div className="lg:col-span-6">
          <OpikQualityScores
            scores={qualityScores}
            improvement={improvement}
            weekLabel="Week 1"
          />
        </div>
      </div>
    </div>
  );
}
