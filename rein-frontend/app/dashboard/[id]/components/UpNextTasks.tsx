"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Calendar, MessageSquare, ChevronRight } from "lucide-react";

interface UpcomingTask {
  id: string;
  title: string;
  time?: string;
  platform: "github" | "calendar" | "slack";
}

interface UpNextTasksProps {
  tasks: UpcomingTask[];
  label?: string;
  onViewAll?: () => void;
}

const platformConfig = {
  github: {
    icon: Github,
    bg: "bg-black",
    color: "text-white",
  },
  calendar: {
    icon: Calendar,
    bg: "bg-blue-600",
    color: "text-white",
  },
  slack: {
    icon: MessageSquare,
    bg: "bg-purple-600",
    color: "text-white",
  },
};

export default function UpNextTasks({
  tasks = [
    {
      id: "1",
      title: "Code Review: DeFi Protocol",
      time: "Est. 2 hours",
      platform: "github" as const,
    },
    {
      id: "2",
      title: "Team Standup",
      time: "9:00 AM - 9:30 AM",
      platform: "calendar" as const,
    },
  ],
  label = "Tomorrow",
  onViewAll,
}: UpNextTasksProps) {
  return (
    <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black uppercase text-sm mb-4 flex items-center justify-between">
        <span>Up Next</span>
        <Badge variant="outline" className="border-black font-bold">
          {label}
        </Badge>
      </h3>

      <div className="space-y-3">
        {tasks.map((task) => {
          const config = platformConfig[task.platform];
          const Icon = config.icon;

          return (
            <div
              key={task.id}
              className="flex gap-3 items-start group cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full border-2 border-black ${config.bg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                  {task.title}
                </p>
                {task.time && (
                  <p className="text-xs text-muted-foreground">{task.time}</p>
                )}
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming tasks scheduled
          </p>
        )}
      </div>

      {onViewAll && tasks.length > 0 && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 pt-3 border-t border-border flex items-center justify-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          View All <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </Card>
  );
}
