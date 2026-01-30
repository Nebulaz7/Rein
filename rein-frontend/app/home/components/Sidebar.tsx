"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  Plus,
  Clock,
  Target,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface Dashboard {
  id: string;
  title: string;
  createdAt: string;
  status?: "active" | "completed" | "paused";
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's dashboards
  useEffect(() => {
    const fetchDashboards = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // TODO: Replace with actual API call to fetch user's dashboards
          // For now, using mock data
          const mockDashboards: Dashboard[] = [
            {
              id: "fitness-2026",
              title: "Get Fit in 2026",
              createdAt: "2026-01-15",
              status: "active",
            },
            {
              id: "learn-spanish",
              title: "Learn Spanish",
              createdAt: "2026-01-10",
              status: "active",
            },
            {
              id: "side-project",
              title: "Launch Side Project",
              createdAt: "2026-01-05",
              status: "paused",
            },
          ];
          setDashboards(mockDashboards);
        }
      } catch (error) {
        console.error("Failed to fetch dashboards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-muted-foreground";
    }
  };

  return (
    <>
      {/* Overlay backdrop when sidebar is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? "w-72" : "w-0 lg:w-16"
        } overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {isOpen && (
            <Link href="/home" className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">My Goals</span>
            </Link>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isOpen ? (
              <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
            ) : (
              <PanelLeft className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Dashboards List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {isOpen && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          ) : dashboards.length === 0 ? (
            <div className="px-3 py-8 text-center">
              {isOpen && (
                <>
                  <Target className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No goals yet. Create your first one!
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {dashboards.map((dashboard) => {
                const isActive = pathname === `/dashboard/${dashboard.id}`;
                return (
                  <Link
                    key={dashboard.id}
                    href={`/dashboard/${dashboard.id}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                      isActive
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-secondary border border-transparent"
                    } ${!isOpen && "justify-center"}`}
                    title={dashboard.title}
                  >
                    {/* Status indicator */}
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(
                        dashboard.status,
                      )}`}
                    />

                    {isOpen && (
                      <>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              isActive
                                ? "text-primary"
                                : "text-foreground group-hover:text-foreground"
                            }`}
                          >
                            {dashboard.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(dashboard.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ${
                            isActive && "opacity-100 text-primary"
                          }`}
                        />
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        {isOpen && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>
                {dashboards.filter((d) => d.status === "active").length} active
                goals
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Toggle button when sidebar is collapsed (visible on larger screens) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-20 left-4 z-30 p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-secondary transition-colors cursor-pointer lg:hidden"
          aria-label="Open sidebar"
        >
          <PanelLeft className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
