"use client";

import React from "react";
import ExecutionTimeline, { Task } from "../ExecutionTimeline";
import UpNextTasks from "../UpNextTasks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface UpcomingTask {
  id: string;
  title: string;
  time?: string;
  platform: "github" | "calendar" | "slack";
}

interface TasksViewProps {
  tasks: Task[];
  upcomingTasks: UpcomingTask[];
  onTaskComplete: (taskId: string) => void;
  userId?: string;
  resolutionId?: string;
}

export default function TasksView({
  tasks,
  upcomingTasks,
  onTaskComplete,
  userId,
  resolutionId,
}: TasksViewProps) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6">
      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Completed
              </p>
              <p className="text-2xl font-black">{completedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Pending
              </p>
              <p className="text-2xl font-black">{pendingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Upcoming
              </p>
              <p className="text-2xl font-black">{upcomingTasks.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Tasks - 8 columns */}
        <div className="lg:col-span-8">
          <ExecutionTimeline 
            tasks={tasks} 
            onTaskComplete={onTaskComplete}
            userId={userId}
            resolutionId={resolutionId}
          />
        </div>

        {/* Upcoming Tasks - 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          <UpNextTasks tasks={upcomingTasks} label="Tomorrow" />

          {/* Quick Add Task */}
          <Card className="p-4 border-2 border-dashed border-muted-foreground/30">
            <button className="w-full py-4 text-center text-muted-foreground hover:text-foreground transition-colors">
              <span className="text-2xl">+</span>
              <p className="text-sm font-bold mt-1">Add New Task</p>
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
