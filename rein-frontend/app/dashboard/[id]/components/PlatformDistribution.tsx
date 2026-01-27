"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Github, Calendar, MessageSquare, Sparkles } from "lucide-react";

interface PlatformData {
  platform: "github" | "calendar" | "slack";
  taskCount: number;
  label?: string;
}

interface PlatformDistributionProps {
  platforms: PlatformData[];
  routingAccuracy?: number;
}

const platformConfig = {
  github: {
    icon: Github,
    color: "text-foreground",
    label: "GitHub",
  },
  calendar: {
    icon: Calendar,
    color: "text-blue-600",
    label: "Calendar",
  },
  slack: {
    icon: MessageSquare,
    color: "text-purple-600",
    label: "Slack",
  },
};

export default function PlatformDistribution({
  platforms = [
    { platform: "github" as const, taskCount: 12 },
    { platform: "calendar" as const, taskCount: 8 },
    { platform: "slack" as const, taskCount: 5 },
  ],
  routingAccuracy = 94,
}: PlatformDistributionProps) {
  const totalTasks = platforms.reduce((sum, p) => sum + p.taskCount, 0);

  return (
    <Card className="lg:col-span-6 p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black uppercase mb-4">Task Distribution</h3>

      <div className="space-y-4">
        {platforms.map((item) => {
          const config = platformConfig[item.platform];
          const Icon = config.icon;
          const percentage =
            totalTasks > 0 ? (item.taskCount / totalTasks) * 100 : 0;

          return (
            <div key={item.platform}>
              <div className="flex justify-between mb-1">
                <span
                  className={`text-sm font-bold flex items-center gap-2 ${config.color}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label || config.label}
                </span>
                <span className="text-sm font-black">
                  {item.taskCount} tasks
                </span>
              </div>
              <Progress
                value={percentage}
                className="h-3 border-2 border-black"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-primary/5 border-2 border-primary rounded flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-xs font-bold text-primary">
          AI Routing Accuracy: {routingAccuracy}% ✨
        </p>
      </div>
    </Card>
  );
}
