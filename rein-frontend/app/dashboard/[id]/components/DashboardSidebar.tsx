"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListTodo,
  BarChart3,
  Plug,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import Link from "next/link";

export type DashboardView =
  | "overview"
  | "tasks"
  | "analytics"
  | "integrations"
  | "insights";

interface NavItem {
  id: DashboardView;
  label: string;
  icon: React.ElementType;
  description?: string;
}

const navItems: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Resolution summary & stats",
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: ListTodo,
    description: "Today's execution & upcoming",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Charts & progress tracking",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    description: "Connected platforms",
  },
  {
    id: "insights",
    label: "AI Insights",
    icon: Sparkles,
    description: "AI coaching & recommendations",
  },
];

interface DashboardSidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function DashboardSidebar({
  currentView,
  onViewChange,
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "h-[calc(100vh-64px)] sticky top-16 border-r-2 border-black bg-secondary/30 flex flex-col transition-all duration-300",
        isCollapsed ? "w-17" : "w-64",
      )}
    >
      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center mt-2 cursor-pointer justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary transition-all"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      )}
      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex cursor-pointer items-center gap-3 px-3 py-3 rounded-lg transition-all text-left group",
                isActive
                  ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "hover:bg-secondary hover:translate-x-0.5 hover:-translate-y-0.5",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-bold text-sm truncate",
                      isActive ? "text-white" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </p>
                  {item.description && (
                    <p
                      className={cn(
                        "text-[10px] truncate",
                        isActive ? "text-zinc-400" : "text-muted-foreground",
                      )}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t-2 border-black/10 space-y-1">
        <button
          className={cn(
            "w-full flex items-center cursor-pointer gap-3 px-3 py-3 rounded-lg transition-all text-left hover:bg-secondary",
          )}
        >
          <Link href="/home" className="w-full flex items-center gap-3">
            <Home className="w-5 h-5 text-muted-foreground shrink-0" />
            {!isCollapsed && <span className="font-bold text-sm">Home</span>}
          </Link>
        </button>

        <button
          className={cn(
            "w-full flex items-center cursor-pointer gap-3 px-3 py-3 rounded-lg transition-all text-left hover:bg-secondary",
          )}
        >
          <Settings className="w-5 h-5 text-muted-foreground shrink-0" />
          {!isCollapsed && <span className="font-bold text-sm">Settings</span>}
        </button>
      </div>
    </aside>
  );
}
