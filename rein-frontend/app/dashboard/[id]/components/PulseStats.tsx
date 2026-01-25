"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Activity, Target } from "lucide-react";

interface PulseStatsProps {
  streak: number;
  progress: number;
  healthStatus: "elite" | "good" | "moderate" | "at-risk";
}

const healthConfig = {
  elite: { label: "Elite", color: "text-green-600", bg: "bg-green-500/5" },
  good: { label: "Good", color: "text-blue-600", bg: "bg-blue-500/5" },
  moderate: {
    label: "Moderate",
    color: "text-yellow-600",
    bg: "bg-yellow-500/5",
  },
  "at-risk": { label: "At Risk", color: "text-red-600", bg: "bg-red-500/5" },
};

export default function PulseStats({
  streak = 12,
  progress = 65,
  healthStatus = "elite",
}: PulseStatsProps) {
  const health = healthConfig[healthStatus];

  return (
    <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Streak Card */}
      <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-primary/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-muted-foreground">
              Current Streak
            </p>
            <h2 className="text-4xl font-black italic">{streak} DAYS</h2>
          </div>
        </div>
      </Card>

      {/* Progress Card */}
      <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <p className="text-sm font-bold uppercase text-muted-foreground">
                Resolution Progress
              </p>
            </div>
            <span className="font-black text-xl">{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-4 border-2 border-black bg-secondary"
          />
          <p className="text-xs text-muted-foreground">
            {progress >= 50 ? "On track to complete!" : "Keep pushing forward!"}
          </p>
        </div>
      </Card>

      {/* Health Card */}
      <Card
        className={`p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${health.bg}`}
      >
        <div className="flex items-center gap-4">
          <Activity className={`w-8 h-8 ${health.color}`} />
          <div>
            <p className="text-sm font-bold uppercase text-muted-foreground">
              Execution Health
            </p>
            <h2 className={`text-xl font-black uppercase ${health.color}`}>
              {health.label}
            </h2>
          </div>
        </div>
      </Card>
    </section>
  );
}
