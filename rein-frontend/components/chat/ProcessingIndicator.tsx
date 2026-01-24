"use client";
import React from "react";

export type Phase =
  | "idle"
  | "analyzing"
  | "editing"
  | "planning"
  | "syncing"
  | "complete";

interface ProcessingIndicatorProps {
  currentPhase: Phase;
}

const phases: { id: Phase; label: string }[] = [
  { id: "analyzing", label: "Analyzing" },
  { id: "editing", label: "Review Goals" },
  { id: "planning", label: "Generating Plan" },
  { id: "syncing", label: "Syncing" },
  { id: "complete", label: "Complete" },
];

const ProcessingIndicator = ({ currentPhase }: ProcessingIndicatorProps) => {
  if (currentPhase === "idle") return null;

  const currentIndex = phases.findIndex((p) => p.id === currentPhase);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-border" />
        <div
          className="absolute top-3 left-0 h-0.5 bg-primary transition-all duration-500 ease-out"
          style={{
            width: `${(currentIndex / (phases.length - 1)) * 100}%`,
          }}
        />

        {phases.map((phase, index) => {
          const isActive = phase.id === currentPhase;
          const isComplete = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={phase.id}
              className="flex flex-col items-center relative z-10"
            >
              {/* Dot */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isComplete
                    ? "bg-primary"
                    : isActive
                      ? "bg-primary ring-4 ring-primary/20"
                      : "bg-secondary border-2 border-border"
                }`}
              >
                {isComplete ? (
                  <svg
                    className="w-3 h-3 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : isActive ? (
                  <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                ) : null}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : isComplete
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingIndicator;
