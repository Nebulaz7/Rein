"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Calendar, MessageSquare, RefreshCw } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  platform: "github" | "calendar" | "slack";
  status: "connected" | "synced" | "pending" | "error";
  lastSync?: string;
}

interface IntegrationStatusProps {
  integrations: Integration[];
  onRefresh?: (integrationId: string) => void;
}

const platformIcons = {
  github: Github,
  calendar: Calendar,
  slack: MessageSquare,
};

const platformColors = {
  github: "text-foreground",
  calendar: "text-blue-600",
  slack: "text-purple-600",
};

const statusConfig = {
  connected: {
    label: "Connected",
    className: "bg-green-500/20 text-green-700 border-green-500",
  },
  synced: {
    label: "Synced",
    className: "bg-green-500/20 text-green-700 border-green-500",
  },
  pending: {
    label: "Pending auth",
    className: "bg-yellow-500/20 text-yellow-700 border-yellow-500",
  },
  error: {
    label: "Error",
    className: "bg-red-500/20 text-red-700 border-red-500",
  },
};

export default function IntegrationStatus({
  integrations = [
    {
      id: "1",
      name: "GitHub",
      platform: "github" as const,
      status: "connected" as const,
    },
    {
      id: "2",
      name: "Google Calendar",
      platform: "calendar" as const,
      status: "synced" as const,
      lastSync: "2m ago",
    },
    {
      id: "3",
      name: "Slack",
      platform: "slack" as const,
      status: "pending" as const,
    },
  ],
  onRefresh,
}: IntegrationStatusProps) {
  return (
    <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black uppercase text-sm">Integrations</h3>
        <button
          onClick={() => integrations.forEach((i) => onRefresh?.(i.id))}
          className="p-1 rounded hover:bg-secondary transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => {
          const Icon = platformIcons[integration.platform];
          const iconColor = platformColors[integration.platform];
          const status = statusConfig[integration.status];

          return (
            <div
              key={integration.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${iconColor}`} />
                <span className="font-bold text-sm">{integration.name}</span>
              </div>
              <Badge className={status.className}>
                {integration.lastSync
                  ? `Synced ${integration.lastSync}`
                  : status.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
