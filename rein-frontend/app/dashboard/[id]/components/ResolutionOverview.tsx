"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResolutionOverviewProps {
  title: string;
  description: string;
  startDate: string;
  targetDate: string;
}

export default function ResolutionOverview({
  title = "Master Web3 Development",
  description = "Build 3 production-ready dApps using Sui blockchain, contribute to open-source Web3 projects, and establish myself as a blockchain developer.",
  startDate = "Jan 1, 2026",
  targetDate = "Jun 30, 2026",
}: ResolutionOverviewProps) {
  return (
    <Card className="lg:col-span-12 p-6 border-2 border-primary shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-primary/5">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <Badge className="mb-2 bg-primary text-primary-foreground font-bold">
            Active Resolution
          </Badge>
          <h2 className="text-2xl font-black uppercase italic mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        </div>
        <div className="text-left md:text-right shrink-0">
          <p className="text-xs uppercase font-bold text-muted-foreground">
            Started
          </p>
          <p className="font-black">{startDate}</p>
          <p className="text-xs uppercase font-bold text-muted-foreground mt-2">
            Target
          </p>
          <p className="font-black">{targetDate}</p>
        </div>
      </div>
    </Card>
  );
}
