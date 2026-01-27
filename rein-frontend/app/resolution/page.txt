"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SmartGoalCard, { SmartGoals } from "@/components/chat/SmartGoalCard";
import PlanTimeline, {
  PlanWeek,
  Platform,
} from "@/components/chat/PlanTimeline";
import SyncPanel from "@/components/chat/SyncPanel";

type Phase =
  | "idle"
  | "analyzing"
  | "editing"
  | "planning"
  | "syncing"
  | "complete";

interface PlatformState {
  enabled: boolean;
  syncing: boolean;
  synced: boolean;
  taskCount: number;
}

// Mock data for demo
const mockSmartGoals: SmartGoals = {
  specific:
    "Build a personal portfolio website with project showcase, blog section, and contact form",
  measurable:
    "Complete 4 main pages, integrate 3 projects, publish 2 blog posts",
  achievable:
    "Using Next.js and existing design skills, dedicating 5 hours per week",
  relevant:
    "Essential for job applications and establishing online presence as a developer",
  timeBound: "Launch by end of Q1 (March 31st)",
};

const mockPlanWeeks: PlanWeek[] = [
  {
    weekNumber: 1,
    label: "Week 1: Setup & Design",
    startDate: "Jan 6 - Jan 12",
    tasks: [
      {
        id: "1",
        title: "Create GitHub repo for portfolio project",
        platform: "github",
      },
      {
        id: "2",
        title: "Set up Next.js project with TypeScript",
        platform: "github",
      },
      {
        id: "3",
        title: "Design session: Create wireframes",
        platform: "calendar",
        date: "Jan 8, 2pm",
      },
      { id: "4", title: "Research portfolio inspiration", platform: "jira" },
    ],
  },
  {
    weekNumber: 2,
    label: "Week 2: Core Pages",
    startDate: "Jan 13 - Jan 19",
    tasks: [
      { id: "5", title: "Implement Home page component", platform: "github" },
      { id: "6", title: "Implement About page component", platform: "github" },
      {
        id: "7",
        title: "Code review session",
        platform: "calendar",
        date: "Jan 15, 3pm",
      },
      { id: "8", title: "Create responsive navigation", platform: "jira" },
    ],
  },
  {
    weekNumber: 3,
    label: "Week 3: Projects Section",
    startDate: "Jan 20 - Jan 26",
    tasks: [
      { id: "9", title: "Build projects grid component", platform: "github" },
      { id: "10", title: "Add project detail pages", platform: "github" },
      {
        id: "11",
        title: "Photo shoot for project screenshots",
        platform: "calendar",
        date: "Jan 22, 10am",
      },
      { id: "12", title: "Write project descriptions", platform: "jira" },
    ],
  },
  {
    weekNumber: 4,
    label: "Week 4: Blog & Contact",
    startDate: "Jan 27 - Feb 2",
    tasks: [
      { id: "13", title: "Implement blog list page", platform: "github" },
      { id: "14", title: "Add MDX support for blog posts", platform: "github" },
      {
        id: "15",
        title: "Write first blog post draft",
        platform: "calendar",
        date: "Jan 29, 9am",
      },
      {
        id: "16",
        title: "Build contact form with validation",
        platform: "jira",
      },
    ],
  },
];

interface PlatformState {
  enabled: boolean;
  syncing: boolean;
  synced: boolean;
  taskCount: number;
}

export default function ResolutionFlowPage() {
  const searchParams = useSearchParams();
  const resolution = searchParams.get("prompt") || "Build a portfolio website";

  // Phase state machine
  const [phase, setPhase] = useState<Phase>("idle");
  const [smartGoals, setSmartGoals] = useState<SmartGoals | null>(null);
  const [planWeeks, setPlanWeeks] = useState<PlanWeek[]>([]);
  const [platforms, setPlatforms] = useState<Record<Platform, PlatformState>>({
    github: { enabled: true, syncing: false, synced: false, taskCount: 0 },
    calendar: { enabled: true, syncing: false, synced: false, taskCount: 0 },
    jira: { enabled: false, syncing: false, synced: false, taskCount: 0 },
  });
  const [syncComplete, setSyncComplete] = useState(false);

  // Refs for auto-scroll
  const smartGoalRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);

  // Start analyzing on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("analyzing");

      // Simulate analysis completion
      setTimeout(() => {
        setSmartGoals(mockSmartGoals);
        setPhase("editing");

        // Scroll to SMART goals
        setTimeout(() => {
          smartGoalRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 300);
      }, 2000);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Update task counts when plan changes
  useEffect(() => {
    if (planWeeks.length > 0) {
      const counts: Record<Platform, number> = {
        github: 0,
        calendar: 0,
        jira: 0,
      };
      planWeeks.forEach((week) => {
        week.tasks.forEach((task) => {
          counts[task.platform]++;
        });
      });

      setPlatforms((prev) => ({
        github: { ...prev.github, taskCount: counts.github },
        calendar: { ...prev.calendar, taskCount: counts.calendar },
        jira: { ...prev.jira, taskCount: counts.jira },
      }));
    }
  }, [planWeeks]);

  // Handle SMART goals confirmation
  const handleConfirmGoals = useCallback((goals: SmartGoals) => {
    setSmartGoals(goals);
    setPhase("planning");

    // Simulate plan generation
    setTimeout(() => {
      setPlanWeeks(mockPlanWeeks);
      setPhase("syncing");

      // Scroll to plan
      setTimeout(() => {
        planRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }, 2500);
  }, []);

  // Handle task toggle
  const handleTaskToggle = useCallback((weekIndex: number, taskId: string) => {
    setPlanWeeks((prev) =>
      prev.map((week, i) =>
        i === weekIndex
          ? {
              ...week,
              tasks: week.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task,
              ),
            }
          : week,
      ),
    );
  }, []);

  // Handle platform toggle
  const handleTogglePlatform = useCallback((platform: Platform) => {
    setPlatforms((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], enabled: !prev[platform].enabled },
    }));
  }, []);

  // Handle sync all
  const handleSyncAll = useCallback(() => {
    const enabledPlatforms = Object.entries(platforms)
      .filter(([_, state]) => state.enabled)
      .map(([key]) => key as Platform);

    // Start syncing animation
    setPlatforms((prev) => {
      const next = { ...prev };
      enabledPlatforms.forEach((p) => {
        next[p] = { ...next[p], syncing: true };
      });
      return next;
    });

    // Simulate sequential sync
    let delay = 0;
    enabledPlatforms.forEach((platform, index) => {
      delay += 800 + Math.random() * 500;
      setTimeout(() => {
        setPlatforms((prev) => ({
          ...prev,
          [platform]: { ...prev[platform], syncing: false, synced: true },
        }));

        // Check if all done
        if (index === enabledPlatforms.length - 1) {
          setTimeout(() => {
            setPhase("complete");
            setSyncComplete(true);
          }, 300);
        }
      }, delay);
    });
  }, [platforms]);

  const isSyncing = Object.values(platforms).some((p) => p.syncing);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-foreground">
            Resolution Analyzer
          </h1>
          <p className="text-sm text-muted-foreground">
            Turning your resolution into an actionable plan
          </p>
        </div>
      </header>

      {/* Processing Indicator */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <ProcessingIndicator phase={phase} />
      </div>

      {/* Content sections */}
      <main className="max-w-2xl mx-auto px-4 space-y-8">
        {/* Phase: Analyzing */}
        {phase === "analyzing" && (
          <div className="flex flex-col items-center py-12">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p className="text-foreground font-medium">
              Analyzing your resolution...
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Breaking down "{resolution}" into SMART goals
            </p>
          </div>
        )}

        {/* Phase: Editing (SMART Goals) */}
        {smartGoals && phase !== "analyzing" && (
          <div ref={smartGoalRef}>
            <SmartGoalCard
              initialGoals={smartGoals}
              originalResolution={resolution}
              onConfirm={handleConfirmGoals}
              isProcessing={phase === "planning"}
            />
          </div>
        )}

        {/* Phase: Planning indicator */}
        {phase === "planning" && (
          <div className="flex flex-col items-center py-8">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-primary animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p className="text-foreground font-medium">
              Generating your plan...
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Creating tasks for GitHub, Calendar, and Jira
            </p>
          </div>
        )}

        {/* Phase: Syncing / Complete (Plan Timeline) */}
        {planWeeks.length > 0 &&
          (phase === "syncing" || phase === "complete") && (
            <div ref={planRef}>
              <PlanTimeline weeks={planWeeks} onTaskToggle={handleTaskToggle} />
            </div>
          )}
      </main>

      {/* Sync Panel */}
      {planWeeks.length > 0 &&
        (phase === "syncing" || phase === "complete") && (
          <SyncPanel
            platforms={platforms}
            onTogglePlatform={handleTogglePlatform}
            onSyncAll={handleSyncAll}
            isSyncing={isSyncing}
            syncComplete={syncComplete}
          />
        )}
    </div>
  );
}

export function ProcessingIndicator({ phase }: ProcessingIndicatorProps) {
  const phaseDisplay = {
    idle: "Idle",
    analyzing: "Analyzing...",
    editing: "Editing SMART goals...",
    planning: "Planning...",
    syncing: "Syncing...",
    complete: "Complete!",
  };

  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
        <svg
          className="w-5 h-5 text-primary animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <p className="text-foreground font-medium">{phaseDisplay[phase]}</p>
    </div>
  );
}

interface ProcessingIndicatorProps {
  phase: Phase;
}
