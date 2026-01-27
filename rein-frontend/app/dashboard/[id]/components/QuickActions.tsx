"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { LogIn, RefreshCw, Sparkles, Settings } from "lucide-react";

interface QuickActionsProps {
  onLogCheckIn?: () => void;
  onSyncPlatforms?: () => void;
  onViewInsights?: () => void;
  onSettings?: () => void;
  isSyncing?: boolean;
}

export default function QuickActions({
  onLogCheckIn,
  onSyncPlatforms,
  onViewInsights,
  onSettings,
  isSyncing = false,
}: QuickActionsProps) {
  return (
    <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black uppercase text-sm mb-4">Quick Actions</h3>

      <div className="space-y-2">
        <button
          onClick={onLogCheckIn}
          className="w-full p-3 bg-black text-white font-bold uppercase text-sm rounded hover:translate-x-1 hover:-translate-y-1 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Log Check-in
        </button>

        <button
          onClick={onSyncPlatforms}
          disabled={isSyncing}
          className="w-full p-3 bg-white text-black font-bold uppercase text-sm rounded hover:translate-x-1 hover:-translate-y-1 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Platforms"}
        </button>

        <button
          onClick={onViewInsights}
          className="w-full p-3 bg-primary/10 text-black font-bold uppercase text-sm rounded hover:translate-x-1 hover:-translate-y-1 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          View AI Insights
        </button>

        <button
          onClick={onSettings}
          className="w-full p-3 bg-secondary text-muted-foreground font-bold uppercase text-sm rounded hover:translate-x-1 hover:-translate-y-1 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </Card>
  );
}
