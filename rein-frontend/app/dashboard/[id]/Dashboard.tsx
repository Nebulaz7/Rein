"use client";

import React, { useState, useCallback } from "react";
import Navbar from "../../home/components/HomeNavbar";
import {
  ResolutionOverview,
  PulseStats,
  AICoachMessage,
  OpikQualityScores,
  ExecutionTimeline,
  IntegrationStatus,
  AIAuditorInsights,
  QuickActions,
  UpNextTasks,
  PlatformDistribution,
  WeeklyChart,
  Task,
} from "./components";

export default function Dashboard() {
  // Dashboard state
  const [streak] = useState(12);
  const [progress] = useState(65);
  const [isSyncing, setIsSyncing] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Implement Sui Wallet Connect",
      description: "Repository: rein-core-app",
      platform: "github",
      completed: false,
    },
    {
      id: "2",
      title: "Deep Work: Smart Contract Audit",
      description: "09:00 AM — 11:30 AM",
      platform: "calendar",
      completed: false,
    },
    {
      id: "3",
      title: "Review PR: Token Staking Module",
      description: "Repository: sui-defi-protocol",
      platform: "github",
      completed: true,
    },
  ]);

  // Quality scores for Opik
  const qualityScores = [
    { label: "Goal Clarity", score: 8.9 },
    { label: "Task Actionability", score: 9.2 },
    { label: "Personalization", score: 7.8 },
  ];

  // Weekly completion data
  const weeklyData = [
    { day: "Mon", completed: 5, total: 6 },
    { day: "Tue", completed: 4, total: 5 },
    { day: "Wed", completed: 6, total: 6 },
    { day: "Thu", completed: 3, total: 5 },
    { day: "Fri", completed: 5, total: 7 },
    { day: "Sat", completed: 4, total: 4 },
    { day: "Sun", completed: 2, total: 3 },
  ];

  // Platform distribution data
  const platformData = [
    { platform: "github" as const, taskCount: 12 },
    { platform: "calendar" as const, taskCount: 8 },
    { platform: "slack" as const, taskCount: 5 },
  ];

  // Integrations status
  const integrations = [
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
  ];

  // Upcoming tasks
  const upcomingTasks = [
    {
      id: "1",
      title: "Code Review: DeFi Protocol",
      time: "Est. 2 hours",
      platform: "github" as const,
    },
    {
      id: "2",
      title: "Team Standup",
      time: "9:00 AM - 9:30 AM",
      platform: "calendar" as const,
    },
  ];

  // Handlers
  const handleTaskComplete = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  const handleSyncPlatforms = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  }, []);

  const handleLogCheckIn = useCallback(() => {
    console.log("Opening check-in modal...");
  }, []);

  const handleViewInsights = useCallback(() => {
    console.log("Navigating to insights...");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 0. Resolution Overview (Full Width) */}
        <ResolutionOverview
          title="Master Web3 Development"
          description="Build 3 production-ready dApps using Sui blockchain, contribute to open-source Web3 projects, and establish myself as a blockchain developer."
          startDate="Jan 1, 2026"
          targetDate="Jun 30, 2026"
        />

        {/* 1. THE PULSE: Top Stats (Full Width) */}
        <PulseStats streak={streak} progress={progress} healthStatus="elite" />

        {/* 2. AI Coach Message (Full Width) */}
        <AICoachMessage
          message="You're crushing it! Your GitHub activity is 3x higher than last week, and your 12-day streak puts you in the top 5% of Rein users. Keep this momentum—consider tackling that contract audit task next."
          confidence={92}
        />

        {/* 3. THE UNIFIED TIMELINE (Center - 8 Columns) */}
        <ExecutionTimeline tasks={tasks} onTaskComplete={handleTaskComplete} />

        {/* 4. SIDEBAR (Right - 4 Columns) */}
        <section className="lg:col-span-4 space-y-6">
          {/* Opik Quality Scores - CRITICAL for hackathon */}
          <OpikQualityScores
            scores={qualityScores}
            improvement={43}
            weekLabel="Week 1"
          />

          {/* Integration Status */}
          <IntegrationStatus integrations={integrations} />

          {/* AI Auditor Insights */}
          <AIAuditorInsights
            insight="Your GitHub activity is high, but Calendar sessions are being skipped. Recommendation: Move coding tasks to early morning."
            stats={{ efficiency: 92, stability: 74 }}
            traceId={Math.random().toString(36).substring(7)}
          />

          {/* Quick Actions */}
          {/* <QuickActions
            onLogCheckIn={handleLogCheckIn}
            onSyncPlatforms={handleSyncPlatforms}
            onViewInsights={handleViewInsights}
            isSyncing={isSyncing}
          /> */}

          {/* Up Next Tasks */}
          <UpNextTasks tasks={upcomingTasks} label="Tomorrow" />
        </section>

        {/* 5. Bottom Charts (Full Width, Split 6/6) */}
        {/* <PlatformDistribution platforms={platformData} routingAccuracy={94} /> */}
        <WeeklyChart data={weeklyData} />
      </main>
    </div>
  );
}
