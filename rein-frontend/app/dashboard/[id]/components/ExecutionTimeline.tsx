"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Github,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Circle,
  MessageSquare,
} from "lucide-react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  platform: "github" | "calendar" | "slack";
  time?: string;
  completed?: boolean;
  badge?: string;
}

interface ExecutionTimelineProps {
  tasks: Task[];
  onTaskComplete?: (taskId: string) => void;
}

const platformConfig = {
  github: {
    icon: Github,
    color: "text-white",
    bg: "bg-black",
    badge: "GitHub Issue",
    badgeClass: "border-black",
  },
  calendar: {
    icon: Calendar,
    color: "text-white",
    bg: "bg-blue-600",
    badge: "Calendar Event",
    badgeClass: "border-blue-600 text-blue-600",
  },
  slack: {
    icon: MessageSquare,
    color: "text-white",
    bg: "bg-purple-600",
    badge: "Slack",
    badgeClass: "border-purple-600 text-purple-600",
  },
};

export default function ExecutionTimeline({
  tasks = [
    {
      id: "1",
      title: "Implement Sui Wallet Connect",
      description: "Repository: rein-core-app",
      platform: "github" as const,
      completed: false,
    },
    {
      id: "2",
      title: "Deep Work: Smart Contract Audit",
      description: "09:00 AM — 11:30 AM",
      platform: "calendar" as const,
      completed: false,
    },
  ],
  onTaskComplete,
}: ExecutionTimelineProps) {
  return (
    <section className="lg:col-span-8 space-y-6">
      <h3 className="text-2xl font-black uppercase italic flex items-center gap-2">
        <Clock className="w-6 h-6" /> Today's Execution
      </h3>

      <div className="space-y-4">
        {tasks.map((task, index) => {
          const config = platformConfig[task.platform];
          const Icon = config.icon;
          const isLast = index === tasks.length - 1;

          return (
            <div key={task.id} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full border-2 border-black ${config.bg} flex items-center justify-center z-10`}
                >
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                {!isLast && (
                  <div className="w-1 h-full bg-primary/10 min-h-[20px]" />
                )}
              </div>

              <Card
                className={`flex-1 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 transition-all cursor-pointer ${
                  task.completed ? "opacity-60" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Badge
                      variant="outline"
                      className={`mb-2 ${config.badgeClass}`}
                    >
                      {task.badge || config.badge}
                    </Badge>
                    <h4
                      className={`font-bold text-lg ${
                        task.completed ? "line-through" : ""
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                    <button
                      onClick={() => onTaskComplete?.(task.id)}
                      className="transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground hover:text-green-500" />
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <Card className="p-8 border-2 border-dashed border-muted-foreground/30 text-center">
            <p className="text-muted-foreground font-medium">
              No tasks scheduled for today
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Your AI coach will suggest tasks based on your resolution
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}
