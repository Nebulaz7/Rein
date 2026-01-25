"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";

interface QualityScore {
  label: string;
  score: number;
  maxScore?: number;
}

interface OpikQualityScoresProps {
  scores: QualityScore[];
  improvement: number;
  weekLabel?: string;
}

export default function OpikQualityScores({
  scores = [
    { label: "Goal Clarity", score: 8.9 },
    { label: "Task Actionability", score: 9.2 },
    { label: "Personalization", score: 7.8 },
  ],
  improvement = 43,
  weekLabel = "Week 1",
}: OpikQualityScoresProps) {
  const isPositive = improvement >= 0;

  return (
    <Card className="p-6 border-2 border-primary shadow-[4px_4px_0px_0px_rgba(233,213,255,1)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black uppercase text-sm">AI Quality Score</h3>
        <Badge className="bg-primary/20 border-primary text-primary font-bold">
          Opik Tracked
        </Badge>
      </div>

      <div className="space-y-4">
        {scores.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-muted-foreground">
                {item.label}
              </span>
              <span className="font-black text-lg">
                {item.score}/{item.maxScore || 10}
              </span>
            </div>
            <Progress
              value={(item.score / (item.maxScore || 10)) * 100}
              className="h-2 border border-primary/30"
            />
          </div>
        ))}
      </div>

      <div
        className={`mt-4 p-3 rounded border-2 flex items-center gap-2 ${
          isPositive
            ? "bg-green-500/10 border-green-500"
            : "bg-red-500/10 border-red-500"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-600" />
        )}
        <p
          className={`text-xs font-bold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(improvement)}% improvement since{" "}
          {weekLabel}
        </p>
      </div>
    </Card>
  );
}
