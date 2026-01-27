"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface AICoachMessageProps {
  message: string;
  confidence: number;
  timestamp?: string;
}

export default function AICoachMessage({
  message = "You're crushing it! Your GitHub activity is 3x higher than last week, and your 12-day streak puts you in the top 5% of Rein users. Keep this momentum—consider tackling that contract audit task next.",
  confidence = 92,
  timestamp,
}: AICoachMessageProps) {
  return (
    <Card className="lg:col-span-12 p-6 border-2 border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-r from-primary/5 to-primary/10">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm mb-1">Your AI Coach says:</p>
          <p className="text-sm leading-relaxed">{message}</p>
          <div className="flex items-center gap-3 mt-3">
            <p className="text-xs text-muted-foreground">
              Generated with {confidence}% confidence
            </p>
            <span className="text-muted-foreground">•</span>
            <p className="text-xs text-primary font-bold">Tracked by Opik</p>
            {timestamp && (
              <>
                <span className="text-muted-foreground">•</span>
                <p className="text-xs text-muted-foreground">{timestamp}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
