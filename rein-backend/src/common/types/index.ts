export type ResourceType = 
  | 'video' 
  | 'article' 
  | 'project'
  | 'tutorial'
  | 'interactive'
  | 'documentation';

/**
 * Learning resource with detailed description
 */
export interface Resource {
  type: ResourceType;
  title: string;
  link: string;
  description: string; // ← NEW: 2-sentence description of what's covered
}

/**
 * Individual learning node/milestone within a stage
 */
export interface ResolutionNode {
  id: string;
  title: string;
  description: string; // Now expects 4-5 sentences
  scheduledDate: string; // ← NEW: ISO date (YYYY-MM-DD) when user should tackle this
  resources: Resource[]; // Now expects 4-5 resources per node
  estimatedDuration?: string;

  isPractical?: boolean;
  practicalType?: PracticalType;
  githubReady?: boolean;
}

/**
 * Stage/phase of the learning roadmap
 */
export interface ResolutionStage {
  id: string;
  title: string;
  description: string; // 2-3 sentences explaining why this stage matters
  startDate: string; // ISO date (YYYY-MM-DD)
  endDate: string; // ISO date (YYYY-MM-DD)
  nodes: ResolutionNode[];
}

export type PracticalType =
  | 'github-project'
  | 'document-deliverable'
  | 'calendar-activity'
  | 'general-exercise';

/**
 * Complete parsed resolution (array of stages)
 */
export type ParsedResolution = ResolutionStage[];

/**
 * Node progress status for tracking completion
 */
export type NodeStatus = 'pending' | 'completed' | 'skipped';

/**
 * Node progress tracking entry (for database)
 */
export interface NodeProgress {
  id: string;
  userId: string;
  resolutionId: string;
  nodeId: string; // matches ResolutionNode.id
  scheduledDate: string; // ISO date
  completedAt?: Date;
  status: NodeStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Filter types for querying nodes
 */
export type NodeFilter = 'today' | 'tomorrow' | 'week' | 'overdue' | 'all';

/**
 * Filtered node response (for API)
 */
export interface FilteredNodesResponse {
  filter: NodeFilter;
  nodes: Array<ResolutionNode & {
    stageId: string;
    stageTitle: string;
    status: NodeStatus;
    completedAt?: Date;
  }>;
  metadata: {
    totalCount: number;
    overdueCount: number;
    completedCount: number;
    currentStreak: number;
  };
}

/**
 * Stage progress summary
 */
export interface StageProgress {
  stageId: string;
  stageTitle: string;
  startDate: string;
  endDate: string;
  totalNodes: number;
  completedNodes: number;
  inProgressNodes: number;
  upcomingNodes: number;
  isActive: boolean; // true if current date falls within stage dates
  completionPercentage: number;
}

/**
 * Complete roadmap progress overview
 */
export interface RoadmapProgress {
  resolutionId: string;
  title: string;
  totalStages: number;
  totalNodes: number;
  completedNodes: number;
  currentStreak: number;
  longestStreak: number;
  stages: StageProgress[];
  nextScheduledNode?: ResolutionNode & {
    stageTitle: string;
    daysUntilDue: number;
  };
  overdueNodes: Array<ResolutionNode & {
    stageTitle: string;
    daysOverdue: number;
  }>;
}

