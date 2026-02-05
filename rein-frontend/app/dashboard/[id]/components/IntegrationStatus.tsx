"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Calendar, MessageSquare, RefreshCw } from "lucide-react";
import { IntegrationStatus as IntegrationStatusType } from "@/lib/integrations";

interface IntegrationStatusProps {
  integrations: IntegrationStatusType[];
  onRefresh?: () => void;
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

const platformNames = {
  github: "GitHub",
  calendar: "Google Calendar",
  slack: "Slack",
};

const getStatusConfig = (connected: boolean) => {
  return connected
    ? {
        label: "Connected",
        className: "bg-green-500/20 text-green-700 border-green-500",
      }
    : {
        label: "Not Connected",
        className: "bg-gray-500/20 text-gray-700 border-gray-500",
      };
};

export default function IntegrationStatus({
  integrations = [],
  onRefresh,
}: IntegrationStatusProps) {
  return (
    <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black uppercase text-sm">Integrations</h3>
        <button
          onClick={() => onRefresh?.()}
          className="p-1 rounded hover:bg-secondary transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => {
          const Icon = platformIcons[integration.platform];
          const iconColor = platformColors[integration.platform];
          const name = platformNames[integration.platform];
          const statusConfig = getStatusConfig(integration.connected);

          return (
            <div
              key={integration.platform}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${iconColor}`} />
                <span className="font-bold text-sm">{name}</span>
              </div>
              <Badge className={statusConfig.className}>
                {integration.connected && integration.lastSync
                  ? `Synced ${integration.lastSync}`
                  : statusConfig.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
