"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

interface WeeklyData {
  day: string;
  completed: number;
  total: number;
}

interface WeeklyChartProps {
  data: WeeklyData[];
  title?: string;
}

export default function WeeklyChart({
  data = [
    { day: "Mon", completed: 5, total: 6 },
    { day: "Tue", completed: 4, total: 5 },
    { day: "Wed", completed: 6, total: 6 },
    { day: "Thu", completed: 3, total: 5 },
    { day: "Fri", completed: 5, total: 7 },
    { day: "Sat", completed: 4, total: 4 },
    { day: "Sun", completed: 2, total: 3 },
  ],
  title = "This Week's Execution",
}: WeeklyChartProps) {
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
  const totalTasks = data.reduce((sum, d) => sum + d.total, 0);
  const completionRate =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <Card className="lg:col-span-6 p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black uppercase">{title}</h3>
        <div className="text-right">
          <p className="text-2xl font-black">{completionRate}%</p>
          <p className="text-xs text-muted-foreground">completion rate</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontWeight: "bold" }}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
            formatter={(value, name) => [
              value,
              name === "completed" ? "Completed" : "Total",
            ]}
          />
          <Bar dataKey="completed" radius={[8, 8, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.completed === entry.total
                    ? "#22c55e"
                    : entry.completed >= entry.total * 0.7
                      ? "#000"
                      : "#ef4444"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span className="text-muted-foreground">100% Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-black" />
          <span className="text-muted-foreground">70%+ Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span className="text-muted-foreground">&lt;70% Complete</span>
        </div>
      </div>
    </Card>
  );
}
