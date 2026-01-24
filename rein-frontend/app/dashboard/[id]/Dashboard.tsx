"use client";

import React, { useState } from "react";
import Navbar from "../../home/components/HomeNavbar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Github,
  Trophy,
  Activity,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function Dashboard() {
  // Mock data for Week 1 architecture
  const [streak] = useState(12);
  const [progress] = useState(65);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. THE PULSE: Top Stats (Span all columns) */}
        <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase text-muted-foreground">
                  Current Streak
                </p>
                <h2 className="text-4xl font-black italic">{streak} DAYS</h2>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-sm font-bold uppercase text-muted-foreground">
                  Resolution Progress
                </p>
                <span className="font-black">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-4 border-2 border-black bg-secondary"
              />
            </div>
          </Card>

          <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-green-500/5">
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-bold uppercase text-muted-foreground">
                  Execution Health
                </p>
                <h2 className="text-xl font-black text-green-600 uppercase">
                  Elite
                </h2>
              </div>
            </div>
          </Card>
        </section>

        {/* 2. THE UNIFIED TIMELINE (Center - 8 Columns) */}
        <section className="lg:col-span-8 space-y-6">
          <h3 className="text-2xl font-black uppercase italic flex items-center gap-2">
            <Clock className="w-6 h-6" /> Today's Execution
          </h3>

          <div className="space-y-4">
            {/* Example Task: GitHub */}
            <div className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center z-10">
                  <Github className="w-5 h-5" />
                </div>
                <div className="w-1 h-full bg-black/10 group-last:hidden" />
              </div>
              <Card className="flex-1 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2 border-black">
                      GitHub Issue
                    </Badge>
                    <h4 className="font-bold text-lg">
                      Implement Sui Wallet Connect
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Repository: rein-core-app
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
              </Card>
            </div>

            {/* Example Task: Calendar */}
            <div className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center z-10">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="w-1 h-full bg-black/10 group-last:hidden" />
              </div>
              <Card className="flex-1 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge
                      variant="outline"
                      className="mb-2 border-blue-600 text-blue-600"
                    >
                      Calendar Event
                    </Badge>
                    <h4 className="font-bold text-lg">
                      Deep Work: Smart Contract Audit
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      09:00 AM — 11:30 AM
                    </p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-muted-foreground hover:text-green-500 transition-colors cursor-pointer" />
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 3. THE AI AUDITOR (Sidebar - 4 Columns) */}
        <section className="lg:col-span-4 space-y-6">
          <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-secondary/50">
            <h3 className="font-black uppercase italic mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" /> AI Auditor
              Insights
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white border-2 border-black rounded-lg">
                <p className="text-xs font-bold text-primary uppercase">
                  Current Feasibility
                </p>
                <p className="text-sm mt-1">
                  Your GitHub activity is high, but Calendar sessions are being
                  skipped. Recommendation: Move coding tasks to early morning.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border border-black rounded bg-white text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                    Efficiency
                  </p>
                  <p className="text-lg font-black">92%</p>
                </div>
                <div className="p-2 border border-black rounded bg-white text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                    Stability
                  </p>
                  <p className="text-lg font-black">74%</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-black text-white">
            <h3 className="font-bold text-sm mb-2 text-primary">
              Next Check-in
            </h3>
            <p className="text-xs text-zinc-400">
              Rein will ping you on Slack at 6:00 PM to review today's progress.
            </p>
          </Card>
        </section>
      </main>
    </div>
  );
}
