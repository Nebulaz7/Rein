// Dashboard Components Index
// Export all dashboard widgets for easy imports

export { default as ResolutionOverview } from "./ResolutionOverview";
export { default as PulseStats } from "./PulseStats";
export { default as AICoachMessage } from "./AICoachMessage";
export { default as OpikQualityScores } from "./OpikQualityScores";
export { default as ExecutionTimeline } from "./ExecutionTimeline";
export { default as IntegrationStatus } from "./IntegrationStatus";
export { default as AIAuditorInsights } from "./AIAuditorInsights";
export { default as QuickActions } from "./QuickActions";
export { default as UpNextTasks } from "./UpNextTasks";
export { default as PlatformDistribution } from "./PlatformDistribution";
export { default as WeeklyChart } from "./WeeklyChart";

// Re-export types
export type { Task } from "./ExecutionTimeline";
