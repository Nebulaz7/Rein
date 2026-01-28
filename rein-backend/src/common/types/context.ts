import type { PreprocessedGoal } from '../../preprocessor/types/preprocessor';

/**
 * Single message in the clarification chat history
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;           // ISO string, e.g. "2025-10-15T14:30:00.000Z"
}

/**
 * Rule-based missing field from preprocessor
 */
export interface MissingField {
  field: keyof PreprocessedGoal;
  reason: string;
  priority: 1 | 2;             // 1 = must clarify first, 2 = nice to have
}

/**
 * Full state of one clarification session
 * This is stored in Redis and mirrored (partially) in Zustand on frontend
 */
export interface ClarificationSession {
  /** Unique session identifier (uuid or similar) */
  sessionId: string;

  /** User this session belongs to */
  userId: string;

  /** Original raw prompt user entered */
  originalPrompt: string;

  /** Structured goal extracted by preprocessor */
  parsedGoal: PreprocessedGoal;

  /** Missing/unclear fields detected by rule-based logic */
  missingFields: MissingField[];

  /** Chat history: starts empty, grows with Q&A (max ~4-6 messages) */
  history: Message[];

  /** How many question rounds have occurred (0–2) */
  roundCount: number;

  /** When the session was created */
  createdAt: string;           // ISO

  /** Last time any message was added or updated */
  lastUpdatedAt: string;

  // Future optional fields (add when needed):
  // aborted?: boolean;
  // readyToGenerate?: boolean;   // could be set by LLM or after round 2
  // finalSummary?: string;       // LLM-generated summary before generation
}

/**
 * Minimal shape returned to frontend when starting / fetching session
 * (avoids sending huge history unnecessarily in some cases)
 */
export type ClarificationSessionOverview = Pick<
  ClarificationSession,
  'sessionId' | 'originalPrompt' | 'missingFields' | 'roundCount' | 'createdAt'
> & {
  history: Message[];   // usually included, but could be paginated later
};

/**
 * Payload shape when user sends a new message
 */
export interface NextClarificationRequest {
  sessionId: string;
  userMessage: string;
}

/**
 * Response shape from /clarification/next
 */
export interface NextClarificationResponse {
  assistantMessage: string;
  roundCount: number;
  isAtLimit: boolean;
  isReady?: boolean;
  summary?: string; // ← new: tells frontend if we can proceed to generation
}
