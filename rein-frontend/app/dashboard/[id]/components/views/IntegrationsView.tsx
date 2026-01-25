"use client";

import React from "react";
import IntegrationStatus from "../IntegrationStatus";
import QuickActions from "../QuickActions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Github,
  Calendar,
  MessageSquare,
  Plus,
  ExternalLink,
  Check,
  AlertTriangle,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  platform: "github" | "calendar" | "slack";
  status: "connected" | "synced" | "pending" | "error";
  lastSync?: string;
}

interface IntegrationsViewProps {
  integrations: Integration[];
  onSyncPlatforms: () => void;
  onLogCheckIn: () => void;
  onViewInsights: () => void;
  isSyncing: boolean;
}

const availableIntegrations = [
  {
    id: "notion",
    name: "Notion",
    description: "Sync tasks from Notion databases",
    icon: "📝",
    comingSoon: true,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Import issues from Linear projects",
    icon: "🔷",
    comingSoon: true,
  },
  {
    id: "todoist",
    name: "Todoist",
    description: "Connect your Todoist tasks",
    icon: "✅",
    comingSoon: true,
  },
];

export default function IntegrationsView({
  integrations,
  onSyncPlatforms,
  onLogCheckIn,
  onViewInsights,
  isSyncing,
}: IntegrationsViewProps) {
  const connectedCount = integrations.filter(
    (i) => i.status === "connected" || i.status === "synced",
  ).length;
  const pendingCount = integrations.filter(
    (i) => i.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-green-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Connected
              </p>
              <p className="text-2xl font-black text-green-600">
                {connectedCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Pending
              </p>
              <p className="text-2xl font-black text-yellow-600">
                {pendingCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Available
              </p>
              <p className="text-2xl font-black">
                {availableIntegrations.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Connected Integrations - 8 columns */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-xl font-black uppercase">Connected Platforms</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => {
              const icons = {
                github: Github,
                calendar: Calendar,
                slack: MessageSquare,
              };
              const Icon = icons[integration.platform];
              const isConnected =
                integration.status === "connected" ||
                integration.status === "synced";

              return (
                <Card
                  key={integration.id}
                  className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-lg ${
                          isConnected ? "bg-green-500/10" : "bg-yellow-500/10"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isConnected ? "text-green-600" : "text-yellow-600"
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold">{integration.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {integration.lastSync
                            ? `Last synced ${integration.lastSync}`
                            : integration.status === "pending"
                              ? "Pending authorization"
                              : "Connected"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        isConnected
                          ? "bg-green-500/20 text-green-700 border-green-500"
                          : "bg-yellow-500/20 text-yellow-700 border-yellow-500"
                      }
                    >
                      {integration.status}
                    </Badge>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 border-black"
                    >
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-black"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Available Integrations */}
          <h3 className="text-xl font-black uppercase mt-8">
            Available Integrations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableIntegrations.map((integration) => (
              <Card
                key={integration.id}
                className="p-4 border-2 border-dashed border-muted-foreground/30 opacity-60"
              >
                <div className="text-center py-4">
                  <span className="text-3xl">{integration.icon}</span>
                  <h4 className="font-bold mt-2">{integration.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {integration.description}
                  </p>
                  <Badge variant="outline" className="mt-3">
                    Coming Soon
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions & Status - 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          <IntegrationStatus integrations={integrations} />
          <QuickActions
            onLogCheckIn={onLogCheckIn}
            onSyncPlatforms={onSyncPlatforms}
            onViewInsights={onViewInsights}
            isSyncing={isSyncing}
          />
        </div>
      </div>
    </div>
  );
}
