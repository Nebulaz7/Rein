"use client";
import React, { useState } from "react";

export interface SmartGoals {
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
}

interface SmartGoalCardProps {
  initialGoals: SmartGoals;
  originalResolution: string;
  onConfirm: (goals: SmartGoals) => void;
  isProcessing?: boolean;
}

const smartLabels: {
  key: keyof SmartGoals;
  label: string;
  description: string;
}[] = [
  {
    key: "specific",
    label: "Specific",
    description: "What exactly do you want to accomplish?",
  },
  {
    key: "measurable",
    label: "Measurable",
    description: "How will you track progress?",
  },
  {
    key: "achievable",
    label: "Achievable",
    description: "Is this realistically attainable?",
  },
  {
    key: "relevant",
    label: "Relevant",
    description: "Why does this matter to you?",
  },
  {
    key: "timeBound",
    label: "Time-bound",
    description: "What is your deadline?",
  },
];

const SmartGoalCard = ({
  initialGoals,
  originalResolution,
  onConfirm,
  isProcessing = false,
}: SmartGoalCardProps) => {
  const [goals, setGoals] = useState<SmartGoals>(initialGoals);
  const [editingField, setEditingField] = useState<keyof SmartGoals | null>(
    null,
  );

  const handleFieldChange = (key: keyof SmartGoals, value: string) => {
    setGoals((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    if (!isProcessing) {
      onConfirm(goals);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Original Resolution */}
      <div className="mb-6 p-4 bg-secondary/50 border border-border rounded-lg">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Your Resolution
        </p>
        <p className="text-foreground">{originalResolution}</p>
      </div>

      {/* SMART Breakdown Card */}
      <div className="bg-card border-2 border-primary rounded-lg overflow-hidden brutal-shadow">
        <div className="bg-primary/10 border-b border-primary/20 px-5 py-3">
          <h3 className="text-primary font-semibold text-sm">
            SMART Goal Breakdown
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            Click any field to edit
          </p>
        </div>

        <div className="p-5 space-y-4">
          {smartLabels.map(({ key, label, description }) => (
            <div key={key} className="group">
              <div className="flex items-start gap-3">
                {/* Letter Badge */}
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">
                    {label[0]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground text-sm font-medium">
                      {label}
                    </span>
                    <span className="text-muted-foreground text-xs hidden sm:inline">
                      {description}
                    </span>
                  </div>

                  {editingField === key ? (
                    <textarea
                      value={goals[key]}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      onBlur={() => setEditingField(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setEditingField(null);
                      }}
                      autoFocus
                      rows={2}
                      className="w-full bg-input border-2 border-primary rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none resize-none"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingField(key)}
                      className="w-full text-left p-3 bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/50 rounded-lg transition-colors cursor-pointer group"
                    >
                      <p className="text-foreground text-sm">{goals[key]}</p>
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 inline-block">
                        Click to edit
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Confirm Button */}
        <div className="px-5 pb-5">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
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
                Generating Plan...
              </>
            ) : (
              <>
                Confirm & Generate Plan
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartGoalCard;
