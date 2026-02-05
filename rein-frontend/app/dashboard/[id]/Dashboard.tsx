"use client";

import React, { useState, useCallback, useEffect } from "react";
import Navbar from "../../home/components/HomeNavbar";
import {
  DashboardSidebar,
  DashboardView,
  Task,
  OverviewView,
  TasksView,
  AnalyticsView,
  IntegrationsView,
  InsightsView,
} from "./components";
import { resolutionAPI, type ResolutionStats, type ResolutionTask } from "@/lib/resolutions";
import { supabase } from "@/lib/supabase";
import { formatScheduledDate } from "@/lib/utils";
import { analyticsAPI, type PerformanceSummary } from "@/lib/analytics";
import { integrationsAPI, type IntegrationStatus } from "@/lib/integrations";

/**
 * Check if a date string (YYYY-MM-DD) is today
 */
function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  const taskDate = new Date(dateStr);
  return (
    today.getFullYear() === taskDate.getFullYear() &&
    today.getMonth() === taskDate.getMonth() &&
    today.getDate() === taskDate.getDate()
  );
}

/**
 * Check if a date string (YYYY-MM-DD) is tomorrow
 */
function isTomorrow(dateStr?: string): boolean {
  if (!dateStr) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDate = new Date(dateStr);
  return (
    tomorrow.getFullYear() === taskDate.getFullYear() &&
    tomorrow.getMonth() === taskDate.getMonth() &&
    tomorrow.getDate() === taskDate.getDate()
  );
}

interface DashboardProps {
  id: string;
}

export default function Dashboard({ id }: DashboardProps) {
  // Dashboard navigation state
  const [currentView, setCurrentView] = useState<DashboardView>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<ResolutionStats | null>(null);
  const [tasks, setTasks] = useState<ResolutionTask[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<ResolutionTask[]>([]);
  const [analytics, setAnalytics] = useState<PerformanceSummary | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

  // Legacy state for views not yet implemented
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch user and resolution data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);

          // Fetch resolution stats
          const statsData = await resolutionAPI.getStats(id, user.id);
          setStats(statsData);

          // Fetch all tasks
          const tasksData = await resolutionAPI.getTasks(id, user.id);
          // Keep raw dates for filtering, don't format yet
          setTasks(tasksData.tasks);

          // Fetch upcoming tasks
          const upcomingData = await resolutionAPI.getUpcomingTasks(id, user.id, 5);
          // Keep raw dates for filtering, don't format yet
          setUpcomingTasks(upcomingData.tasks);

          // Fetch analytics data
          const analyticsData = await analyticsAPI.getPerformanceSummary(id, 7);
          if (analyticsData.success && analyticsData.data) {
            setAnalytics(analyticsData.data);
          }

          // Fetch integrations status
          const integrationsData = await integrationsAPI.getStatus(user.id);
          if (integrationsData.success && integrationsData.integrations) {
            setIntegrations(integrationsData.integrations);
          }
        } else {
          // If no user, try without userId (public resolution)
          const statsData = await resolutionAPI.getStats(id);
          setStats(statsData);

          const tasksData = await resolutionAPI.getTasks(id);
          // Keep raw dates for filtering, don't format yet
          setTasks(tasksData.tasks);

          const upcomingData = await resolutionAPI.getUpcomingTasks(id, undefined, 5);
          // Keep raw dates for filtering, don't format yet
          setUpcomingTasks(upcomingData.tasks);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handlers
  const handleTaskComplete = useCallback(async (taskId: string) => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Optimistically update UI
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      );

      // Find the task to determine new completed status
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Update on backend
      await resolutionAPI.updateTaskStatus(id, taskId, userId, !task.completed);

      // Refetch stats to update progress
      const updatedStats = await resolutionAPI.getStats(id, userId);
      setStats(updatedStats);

      // Refetch upcoming tasks
      const upcomingData = await resolutionAPI.getUpcomingTasks(id, userId, 5);
      // Keep raw dates for filtering, don't format yet
      setUpcomingTasks(upcomingData.tasks);
    } catch (err) {
      console.error('Error updating task:', err);
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      );
    }
  }, [id, userId, tasks]);

  const handleSyncPlatforms = useCallback(async (platform?: string) => {
    if (!userId) return;

    setIsSyncing(true);
    try {
      if (platform === 'calendar') {
        const result = await integrationsAPI.syncCalendar(userId, id);
        if (result.success) {
          alert(result.message || 'Calendar synced successfully!');
          // Refresh integrations status
          const integrationsData = await integrationsAPI.getStatus(userId);
          if (integrationsData.success && integrationsData.integrations) {
            setIntegrations(integrationsData.integrations);
          }
        } else {
          alert(`Failed to sync calendar: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [userId, id]);

  const handleLogCheckIn = useCallback(() => {
    console.log("Opening check-in modal...");
  }, []);

  const handleViewInsights = useCallback(() => {
    setCurrentView("insights");
  }, []);

  // Derived data from analytics
  const qualityScores = analytics ? [
    { label: "Goal Clarity", score: analytics.qualityMetrics.goalClarity },
    { label: "Task Actionability", score: analytics.qualityMetrics.taskActionability },
    { label: "Personalization", score: analytics.qualityMetrics.personalization },
  ] : [
    { label: "Goal Clarity", score: 0 },
    { label: "Task Actionability", score: 0 },
    { label: "Personalization", score: 0 },
  ];

  const weeklyData = analytics?.weeklyProgress || [];
  
  const platformData = analytics?.taskDistribution ? [
    { platform: "github" as const, taskCount: analytics.taskDistribution.github },
    { platform: "calendar" as const, taskCount: analytics.taskDistribution.calendar },
    { platform: "slack" as const, taskCount: analytics.taskDistribution.slack },
  ] : [];

  // View title mapping
  const viewTitles: Record<DashboardView, string> = {
    overview: "Overview",
    tasks: "Tasks",
    analytics: "Analytics",
    integrations: "Integrations",
    insights: "AI Insights",
  };

  // Render current view
  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your resolution...</p>
          </div>
        </div>
      );
    }

    if (error || !stats) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load resolution</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case "overview":
        return (
          <OverviewView
            streak={stats.stats.streak}
            progress={stats.stats.progress}
            healthStatus={stats.stats.healthStatus as "getting-started" | "building" | "strong" | "elite"}
            resolution={{
              title: stats.resolution.title,
              description: stats.resolution.description,
              startDate: new Date(stats.resolution.startDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              targetDate: new Date(stats.resolution.targetDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
            }}
            coachMessage={{
              message: stats.coachMessage.message,
              confidence: stats.coachMessage.confidence,
            }}
          />
        );
      case "tasks":
        // Filter tasks: only show today's tasks in main view
        const todaysTasks = tasks.filter(task => isToday(task.time));
        
        // Filter upcoming: only show tomorrow's tasks
        const tomorrowsTasks = upcomingTasks.filter(task => isTomorrow(task.time));
        
        // Convert ResolutionTask[] to Task[] format for today's tasks with formatted dates and resources
        const formattedTasks: Task[] = todaysTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          platform: (task.platform === 'jira' ? 'github' : task.platform) as "github" | "calendar" | "slack",
          completed: task.completed,
          time: formatScheduledDate(task.time), // Format date for display
          // Add resources if they exist in the task
          resources: task.resources ? task.resources.map(resource => ({
            type: resource.type as "article" | "video",
            title: resource.title,
            url: resource.url,
          })) : undefined,
        }));

        // Format tomorrow's tasks with formatted dates
        const formattedUpcoming = tomorrowsTasks.map(task => ({
          id: task.id,
          title: task.title,
          time: formatScheduledDate(task.time), // Format date for display
          platform: (task.platform === 'jira' ? 'github' : task.platform) as "github" | "calendar" | "slack",
        }));

        return (
          <React.Fragment key="tasks-view">
            <TasksView
              tasks={formattedTasks}
              upcomingTasks={formattedUpcoming}
              onTaskComplete={handleTaskComplete}
              userId={userId || undefined}
              resolutionId={id}
            />
          </React.Fragment>
        );
      case "analytics":
        return (
          <AnalyticsView
            weeklyData={weeklyData}
            platformData={platformData}
            qualityScores={qualityScores}
            improvement={analytics?.trends.weekOverWeekChange || 0}
            analytics={analytics}
          />
        );
      case "integrations":
        return (
          <IntegrationsView
            integrations={integrations}
            onSyncPlatforms={handleSyncPlatforms}
            onLogCheckIn={handleLogCheckIn}
            onViewInsights={handleViewInsights}
            isSyncing={isSyncing}
          />
        );
      case "insights":
        return (
          <InsightsView
            qualityScores={qualityScores}
            improvement={analytics?.trends.weekOverWeekChange || 0}
            coachMessage={{
              message: stats.coachMessage.message,
              confidence: stats.coachMessage.confidence,
            }}
            auditInsight={analytics?.auditInsights.message || "Complete tasks to unlock AI insights."}
            auditStats={{ 
              efficiency: analytics?.auditInsights.efficiency || 0, 
              stability: analytics?.auditInsights.stability || 0 
            }}
            analytics={analytics}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <DashboardSidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content */}
        <main className="flex-1 mt-12 pt-12 p-6 overflow-auto">
          <div className="max-w-[1200px] mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-black uppercase italic">
                {viewTitles[currentView]}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentView === "overview" && "Your resolution at a glance"}
                {currentView === "tasks" && "Manage your daily execution"}
                {currentView === "analytics" &&
                  "Track your progress and performance"}
                {currentView === "integrations" &&
                  "Connect and manage platforms"}
                {currentView === "insights" && "AI-powered recommendations"}
              </p>
            </div>

            {/* View Content */}
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}