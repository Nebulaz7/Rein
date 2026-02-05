"use client";

import React from "react";
import CardSwap, { Card } from "../animations/CardSwap";
import { Target, Brain, Calendar, Trophy, Zap, Link2 } from "lucide-react";
import Grainient from "../animations/Grainient";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 lg:pt-40 md:px-12 lg:px-24 pt-24 overflow-hidden">
      {/* Grainient Background */}
      <div className="absolute inset-0 -z-10">
        <Grainient
          color1="#0a0a0a"
          color2="#52cbff"
          color3="#0a0a0a"
          timeSpeed={0}
          colorBalance={0}
          warpStrength={0.8}
          warpFrequency={4}
          warpSpeed={1.5}
          warpAmplitude={40}
          blendAngle={0}
          blendSoftness={0.1}
          rotationAmount={400}
          noiseScale={2.57}
          grainAmount={0.18}
          grainScale={2}
          grainAnimated={false}
          contrast={1.3}
          gamma={1}
          saturation={0.9}
          centerX={0}
          centerY={0}
          zoom={1}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Text Section */}
        <section className="pt-1 pb-10 lg:pb-20 px-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <Badge
              variant="outline"
              className="border-primary/50 text-primary text-[10px] uppercase tracking-widest"
            >
              v1.0 Agent Active
            </Badge>
            <span className="text-xs font-medium text-primary/80">
              Rein is now in open beta
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-6">
            EXECUTE <br />
            GOALS WITH&nbsp;
            <span className="text-primary italic">REIN.</span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg md:text-xl font-medium text-muted-foreground mb-8 lg:mb-10">
            Turn vague goals into real-world commits, events, and streaks. Rein
            is the bridge between your intentions and your tools.
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <Link href="/signin">
              <button className="bg-primary cursor-pointer text-primary-foreground px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium hover:opacity-90 transition-opacity">
                Get Started
              </button>
            </Link>
            <Link href="/#features">
              <button className="border border-border cursor-pointer px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium hover:bg-muted transition-colors">
                Learn More
              </button>
            </Link>
          </div>
        </section>

        {/* Illustration Section - Hidden on smaller devices */}
        <div className="hidden lg:pr-12 lg:pt-12 lg:flex relative items-center justify-center min-h-[450px] md:min-h-[500px] lg:min-h-[550px]">
          <div className="relative w-full h-full">
            <CardSwap
              width={380}
              height={280}
              cardDistance={40}
              verticalDistance={40}
              delay={4000}
              pauseOnHover={true}
              skewAmount={3}
              easing="elastic"
            >
              {/* Card 1 - Goal Setting */}
              <Card className="!bg-background !border-border brutal-card p-0 overflow-hidden flex flex-col shadow-xl">
                {/* Card Image/Visual */}
                <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex gap-2">
                      <div className="w-16 h-20 bg-background/80 rounded-lg border border-border p-2 flex flex-col gap-1 shadow-sm">
                        <div className="w-full h-2 bg-primary/40 rounded-full"></div>
                        <div className="w-3/4 h-2 bg-muted rounded-full"></div>
                        <div className="flex-1 flex items-end">
                          <Target className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div className="w-16 h-20 bg-background/80 rounded-lg border border-primary/50 p-2 flex flex-col gap-1 shadow-sm scale-110 -translate-y-1">
                        <div className="w-full h-2 bg-primary rounded-full"></div>
                        <div className="w-1/2 h-2 bg-muted rounded-full"></div>
                        <div className="flex-1 flex items-end justify-between">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-[8px] text-primary font-bold">
                            NEW
                          </span>
                        </div>
                      </div>
                      <div className="w-16 h-20 bg-background/80 rounded-lg border border-border p-2 flex flex-col gap-1 shadow-sm">
                        <div className="w-full h-2 bg-muted rounded-full"></div>
                        <div className="w-2/3 h-2 bg-muted rounded-full"></div>
                        <div className="flex-1 flex items-end">
                          <Trophy className="w-4 h-4 text-amber-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Card Content */}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      Define Your Resolutions
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Transform vague intentions into clear, actionable goals.
                    Rein breaks down your ambitions into daily wins.
                  </p>
                </div>
              </Card>

              {/* Card 2 - AI Chat Interface */}
              <Card className="!bg-background !border-border brutal-card p-0 overflow-hidden flex flex-col shadow-xl">
                {/* Card Image/Visual - Chat mockup */}
                <div className="relative h-32 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent overflow-hidden p-3">
                  <div className="flex flex-col gap-2 h-full">
                    <div className="flex gap-2 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] text-white font-bold">
                          R
                        </span>
                      </div>
                      <div className="bg-background/90 rounded-lg rounded-tl-none px-3 py-2 border border-border max-w-[80%]">
                        <p className="text-[10px] text-foreground">
                          Ready to crush your goals today? 🎯
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start justify-end">
                      <div className="bg-primary/20 rounded-lg rounded-tr-none px-3 py-2 border border-primary/30 max-w-[70%]">
                        <p className="text-[10px] text-foreground">
                          Yes! What&apos;s my focus?
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-background/90 rounded-lg rounded-tl-none px-3 py-2 border border-border">
                        <p className="text-[10px] text-foreground">
                          Complete 30 min workout 💪
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Card Content */}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-500" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      AI-Powered Coaching
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get personalized nudges, reminders, and motivation exactly
                    when you need them most.
                  </p>
                </div>
              </Card>

              {/* Card 3 - Progress Dashboard */}
              <Card className="!bg-background !border-border brutal-card p-0 overflow-hidden flex flex-col shadow-xl">
                {/* Card Image/Visual - Dashboard mockup */}
                <div className="relative h-32 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent overflow-hidden p-3">
                  <div className="flex gap-3 h-full items-center justify-center">
                    {/* Mini chart */}
                    <div className="flex items-end gap-1 h-16">
                      <div
                        className="w-3 bg-muted/50 rounded-t"
                        style={{ height: "30%" }}
                      ></div>
                      <div
                        className="w-3 bg-muted/50 rounded-t"
                        style={{ height: "50%" }}
                      ></div>
                      <div
                        className="w-3 bg-emerald-500/60 rounded-t"
                        style={{ height: "70%" }}
                      ></div>
                      <div
                        className="w-3 bg-emerald-500/80 rounded-t"
                        style={{ height: "85%" }}
                      ></div>
                      <div
                        className="w-3 bg-emerald-500 rounded-t"
                        style={{ height: "100%" }}
                      ></div>
                    </div>
                    {/* Stats */}
                    <div className="flex flex-col gap-2">
                      <div className="bg-background/90 rounded-lg px-3 py-2 border border-border">
                        <p className="text-[10px] text-muted-foreground">
                          Current Streak
                        </p>
                        <p className="text-lg font-black text-emerald-500">
                          14 🔥
                        </p>
                      </div>
                      <div className="bg-background/90 rounded-lg px-3 py-1.5 border border-emerald-500/50">
                        <p className="text-[10px] text-emerald-500 font-semibold">
                          +23% this week
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Card Content */}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      Track Your Progress
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Visualize streaks, celebrate milestones, and watch your
                    consistency compound over time.
                  </p>
                </div>
              </Card>

              {/* Card 4 - Integrations */}
              <Card className="!bg-background !border-border brutal-card p-0 overflow-hidden flex flex-col shadow-xl">
                {/* Card Image/Visual - Integration icons */}
                <div className="relative h-32 bg-gradient-to-br from-cyan-500/20 via-violet-500/10 to-transparent overflow-hidden p-3">
                  <div className="flex items-center justify-center h-full">
                    <div className="relative flex items-center justify-center">
                      {/* Central Rein logo */}
                      <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center z-10 shadow-lg shadow-primary/30">
                        <Image
                          src="/rein-logo.png"
                          alt="Rein Logo"
                          width={24}
                          height={24}
                        />
                      </div>

                      {/* Orbiting integration icons */}
                      <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                        <div className="w-10 h-10 rounded-xl bg-background/90 border border-border flex items-center justify-center shadow-sm">
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        </div>
                      </div>

                      <div className="absolute -right-10 top-1/2 -translate-y-1/2">
                        <div className="w-10 h-10 rounded-xl bg-background/90 border border-border flex items-center justify-center shadow-sm">
                          <svg
                            className="w-5 h-5 text-[#E01E5A]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                          </svg>
                        </div>
                      </div>

                      <div className="absolute top-[-18px] left-1/2 -translate-x-1/2">
                        <div className="w-10 h-10 rounded-xl bg-background/90 border border-border flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Connection lines */}
                      <div className="absolute w-6 h-px bg-primary/40 -left-4 top-1/2"></div>
                      <div className="absolute w-6 h-px bg-primary/40 -right-4 top-1/2"></div>
                      <div className="absolute h-4 w-px bg-primary/40 top-[-2px] left-1/2"></div>
                    </div>
                  </div>
                </div>
                {/* Card Content */}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Link2 className="w-4 h-4 text-cyan-500" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      Seamless Integrations
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Connect with GitHub, Google Calendar, Slack and more. Your
                    goals sync with your workflow.
                  </p>
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
