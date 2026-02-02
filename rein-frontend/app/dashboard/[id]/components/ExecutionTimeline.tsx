"use client";

import React, { useState } from "react";
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
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
} from "lucide-react";

export interface Resource {
  type: "article" | "video";
  title: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  platform: "github" | "calendar" | "slack";
  time?: string;
  completed?: boolean;
  badge?: string;
  resources?: Resource[];
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

const DESCRIPTION_MAX_LENGTH = 100;

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
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const shouldTruncate = (description?: string) => {
    return description && description.length > DESCRIPTION_MAX_LENGTH;
  };

  const getTruncatedDescription = (description: string) => {
    return description.slice(0, DESCRIPTION_MAX_LENGTH) + "...";
  };

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
          const isExpanded = expandedTasks.has(task.id);
          const needsTruncation = shouldTruncate(task.description);
          const hasResources = task.resources && task.resources.length > 0;

          // Group resources by type
          const articles = task.resources?.filter((r) => r.type === "article") || [];
          const videos = task.resources?.filter((r) => r.type === "video") || [];

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
                className={`flex-1 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 transition-all ${
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
                    
                    {/* Description Section */}
                    {task.description && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          {needsTruncation && !isExpanded
                            ? getTruncatedDescription(task.description)
                            : task.description}
                        </p>
                        
                        {/* Expand/Collapse Button */}
                        {(needsTruncation || hasResources) && (
                          <button
                            onClick={() => toggleExpand(task.id)}
                            className="flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Show more
                              </>
                            )}
                          </button>
                        )}

                        {/* Resources Section - Only visible when expanded */}
                        {isExpanded && hasResources && (
                          <div className="mt-4 pl-4 border-l-2 border-primary/20 space-y-3">
                            <h5 className="text-xs font-bold uppercase text-muted-foreground">
                              Resources
                            </h5>

                            {/* Articles */}
                            {articles.length > 0 && (
                              <div className="space-y-2">
                                {articles.map((article, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                                        Article:
                                      </p>
                                      <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1 break-words"
                                      >
                                        <span>{article.title}</span>
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Videos */}
                            {videos.length > 0 && (
                              <div className="space-y-2">
                                {videos.map((video, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <Video className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                                        Video:
                                      </p>
                                      <a
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1 break-words"
                                      >
                                        <span>{video.title}</span>
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
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