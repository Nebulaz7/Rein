"use client";
import React, { useState } from "react";
import { Calendar, Github, SquareKanban, Check, Loader2 } from "lucide-react";
import { Platform } from "./PlanTimeline";

interface PlatformState {
  enabled: boolean;
  syncing: boolean;
  synced: boolean;
  taskCount: number;
}

interface SyncPanelProps {
  platforms: Record<Platform, PlatformState>;
  onTogglePlatform: (platform: Platform) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  syncComplete: boolean;
}

const platformConfig: Record<
  Platform,
  { icon: React.ReactNode; label: string; color: string; bgColor: string }
> = {
  github: {
    icon: <Github className="w-5 h-5" />,
    label: "GitHub",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  calendar: {
    icon: <Calendar className="w-5 h-5" />,
    label: "Calendar",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  jira: {
    icon: <SquareKanban className="w-5 h-5" />,
    label: "Jira",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
};

const SyncPanel = ({
  platforms,
  onTogglePlatform,
  onSyncAll,
  isSyncing,
  syncComplete,
}: SyncPanelProps) => {
  const enabledPlatforms = Object.entries(platforms).filter(
    ([_, state]) => state.enabled,
  );
  const totalTasks = enabledPlatforms.reduce(
    (sum, [_, state]) => sum + state.taskCount,
    0,
  );
  const allSynced = Object.values(platforms).every(
    (p) => !p.enabled || p.synced,
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Platform toggles */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            {(Object.keys(platforms) as Platform[]).map((platform) => {
              const config = platformConfig[platform];
              const state = platforms[platform];

              return (
                <button
                  key={platform}
                  onClick={() => onTogglePlatform(platform)}
                  disabled={isSyncing}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-150 cursor-pointer ${
                    state.enabled
                      ? `${config.bgColor} border-current ${config.color}`
                      : "bg-secondary/50 border-transparent text-muted-foreground hover:border-border"
                  } ${isSyncing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={
                      state.enabled ? config.color : "text-muted-foreground"
                    }
                  >
                    {state.syncing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : state.synced ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      config.icon
                    )}
                  </span>
                  <span className="text-sm font-medium">{config.label}</span>
                  {state.enabled && state.taskCount > 0 && !state.synced && (
                    <span className="text-xs bg-foreground/10 px-1.5 py-0.5 rounded">
                      {state.taskCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1 hidden sm:block" />

          {/* Sync button */}
          <button
            onClick={onSyncAll}
            disabled={
              isSyncing || enabledPlatforms.length === 0 || syncComplete
            }
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
              syncComplete
                ? "bg-green-500/20 text-green-400 border-2 border-green-500/30"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {syncComplete ? (
              <>
                <Check className="w-5 h-5" />
                Synced!
              </>
            ) : isSyncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                Sync All
                {totalTasks > 0 && (
                  <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">
                    {totalTasks} tasks
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        {/* Progress bar when syncing */}
        {isSyncing && (
          <div className="mt-3">
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 animate-pulse"
                style={{ width: "60%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Creating tasks across your connected platforms...
            </p>
          </div>
        )}

        {/* Success message */}
        {syncComplete && (
          <p className="text-xs text-green-400 mt-2 text-center">
            ✓ All tasks have been synced to your platforms. Check your GitHub,
            Calendar, and Jira!
          </p>
        )}
      </div>
    </div>
  );
};

export default SyncPanel;
