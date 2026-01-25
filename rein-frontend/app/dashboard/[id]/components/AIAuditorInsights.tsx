"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface AuditStats {
  efficiency: number;
  stability: number;
}

interface AIAuditorInsightsProps {
  insight: string;
  stats: AuditStats;
  traceId?: string;
}

export default function AIAuditorInsights({
  insight = "Your GitHub activity is high, but Calendar sessions are being skipped. Recommendation: Move coding tasks to early morning.",
  stats = { efficiency: 92, stability: 74 },
  traceId,
}: AIAuditorInsightsProps) {
  return (
    <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-secondary/50">
      <h3 className="font-black uppercase italic mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-primary" /> AI Auditor Insights
      </h3>

      <div className="space-y-4">
        <div className="p-3 bg-black border-2 border-black rounded-lg">
          <p className="text-xs font-bold text-primary uppercase mb-1">
            Current Feasibility
          </p>
          <p className="text-sm text-white leading-relaxed">{insight}</p>
          {traceId && (
            <p className="text-[10px] text-muted-foreground mt-2 font-mono">
              OPIK_TRACE: {traceId}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 border-2 border-black rounded bg-black text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">
              Efficiency
            </p>
            <p
              className={`text-2xl font-black ${
                stats.efficiency >= 80
                  ? "text-green-500"
                  : stats.efficiency >= 60
                    ? "text-yellow-500"
                    : "text-red-500"
              }`}
            >
              {stats.efficiency}%
            </p>
          </div>
          <div className="p-3 border-2 border-black rounded bg-black text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">
              Stability
            </p>
            <p
              className={`text-2xl font-black ${
                stats.stability >= 80
                  ? "text-green-500"
                  : stats.stability >= 60
                    ? "text-yellow-500"
                    : "text-red-500"
              }`}
            >
              {stats.stability}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
