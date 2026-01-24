"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Github,
  SquareKanban,
  Check,
} from "lucide-react";

export type Platform = "github" | "calendar" | "jira";

export interface PlanTask {
  id: string;
  title: string;
  platform: Platform;
  date?: string;
  completed?: boolean;
}

export interface PlanWeek {
  weekNumber: number;
  label: string;
  startDate: string;
  tasks: PlanTask[];
}

interface PlanTimelineProps {
  weeks: PlanWeek[];
  onTaskToggle?: (weekIndex: number, taskId: string) => void;
}

const platformConfig: Record<
  Platform,
  { icon: React.ReactNode; label: string; color: string }
> = {
  github: {
    icon: <Github className="w-4 h-4" />,
    label: "GitHub Issue",
    color: "text-purple-400",
  },
  calendar: {
    icon: <Calendar className="w-4 h-4" />,
    label: "Calendar Event",
    color: "text-blue-400",
  },
  jira: {
    icon: <SquareKanban className="w-4 h-4" />,
    label: "Jira Ticket",
    color: "text-orange-400",
  },
};

const PlanTimeline = ({ weeks, onTaskToggle }: PlanTimelineProps) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(
    new Set(weeks.map((_, i) => i)), // All expanded by default
  );

  const toggleWeek = (index: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Group tasks by platform
  const groupTasksByPlatform = (
    tasks: PlanTask[],
  ): Record<Platform, PlanTask[]> => {
    return tasks.reduce(
      (acc, task) => {
        if (!acc[task.platform]) acc[task.platform] = [];
        acc[task.platform].push(task);
        return acc;
      },
      {} as Record<Platform, PlanTask[]>,
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Your Execution Plan
        </h3>
        <p className="text-sm text-muted-foreground">
          {weeks.length} weeks of actionable tasks across your platforms
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {weeks.map((week, weekIndex) => {
            const isExpanded = expandedWeeks.has(weekIndex);
            const groupedTasks = groupTasksByPlatform(week.tasks);
            const completedTasks = week.tasks.filter((t) => t.completed).length;

            return (
              <div key={weekIndex} className="relative">
                {/* Week node on timeline */}
                <div className="absolute left-2 top-4 w-5 h-5 rounded-full bg-primary border-2 border-card flex items-center justify-center z-10">
                  <span className="text-[10px] font-bold text-primary-foreground">
                    {week.weekNumber}
                  </span>
                </div>

                {/* Week card */}
                <div className="ml-10 bg-card border border-border rounded-lg overflow-hidden">
                  {/* Week header */}
                  <button
                    onClick={() => toggleWeek(weekIndex)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div className="text-left">
                        <span className="text-foreground font-medium text-sm">
                          {week.label}
                        </span>
                        <span className="text-muted-foreground text-xs ml-2">
                          {week.startDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {completedTasks}/{week.tasks.length} tasks
                      </span>
                      {completedTasks === week.tasks.length &&
                        week.tasks.length > 0 && (
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                        )}
                    </div>
                  </button>

                  {/* Week content */}
                  {isExpanded && (
                    <div className="border-t border-border px-4 py-3 space-y-4">
                      {(Object.keys(groupedTasks) as Platform[]).map(
                        (platform) => {
                          const config = platformConfig[platform];
                          const tasks = groupedTasks[platform];

                          return (
                            <div key={platform}>
                              {/* Platform header */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className={config.color}>
                                  {config.icon}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  {config.label}s
                                </span>
                              </div>

                              {/* Tasks */}
                              <div className="space-y-2 ml-6">
                                {tasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="flex items-start gap-3 group"
                                  >
                                    <button
                                      onClick={() =>
                                        onTaskToggle?.(weekIndex, task.id)
                                      }
                                      className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 transition-colors cursor-pointer ${
                                        task.completed
                                          ? "bg-primary border-primary"
                                          : "border-border hover:border-primary"
                                      }`}
                                    >
                                      {task.completed && (
                                        <Check className="w-3 h-3 text-primary-foreground" />
                                      )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-sm ${
                                          task.completed
                                            ? "text-muted-foreground line-through"
                                            : "text-foreground"
                                        }`}
                                      >
                                        {task.title}
                                      </p>
                                      {task.date && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {task.date}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanTimeline;
