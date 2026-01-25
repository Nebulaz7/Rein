"use client";

import React from "react";
import ResolutionOverview from "../ResolutionOverview";
import PulseStats from "../PulseStats";
import AICoachMessage from "../AICoachMessage";

interface OverviewViewProps {
  streak: number;
  progress: number;
  healthStatus: "elite" | "good" | "moderate" | "at-risk";
  resolution: {
    title: string;
    description: string;
    startDate: string;
    targetDate: string;
  };
  coachMessage: {
    message: string;
    confidence: number;
  };
}

export default function OverviewView({
  streak,
  progress,
  healthStatus,
  resolution,
  coachMessage,
}: OverviewViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Resolution Overview */}
      <ResolutionOverview
        title={resolution.title}
        description={resolution.description}
        startDate={resolution.startDate}
        targetDate={resolution.targetDate}
      />

      {/* Stats Row */}
      <PulseStats
        streak={streak}
        progress={progress}
        healthStatus={healthStatus}
      />

      {/* AI Coach Message */}
      <AICoachMessage
        message={coachMessage.message}
        confidence={coachMessage.confidence}
      />
    </div>
  );
}
