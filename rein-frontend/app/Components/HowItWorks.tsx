"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MessageSquare,
  Target,
  FileText,
  Link2,
  RefreshCw,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  Brain,
  Calendar,
  Zap,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import CalenderSvg from "../svgs/CalenderSvg";
import SlackSvg from "../svgs/SlackSvg";

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  const steps = [
    {
      id: 1,
      icon: MessageSquare,
      title: "Start a Conversation",
      description:
        "Chat naturally with Rein about your goals, dreams, and resolutions. No forms, no friction — just tell us what you want to achieve.",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
      visual: (
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-xl p-4 h-48 overflow-hidden">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-start">
              <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center flex-shrink-0">
                <Image
                  src="/rein-logo.svg"
                  alt="Rein Logo"
                  width={12}
                  height={12}
                  className="w-4 h-4"
                />
              </div>
              <div className="bg-background/90 rounded-lg rounded-tl-none px-3 py-2 border border-border">
                <p className="text-xs text-foreground">
                  Hey! What goal would you like to achieve? 🎯
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-start justify-end">
              <div className="bg-primary/20 rounded-lg rounded-tr-none px-3 py-2 border border-primary/30">
                <p className="text-xs text-foreground">
                  I want to learn Spanish this year
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-background/90 rounded-lg rounded-tl-none px-3 py-2 border border-border">
                <p className="text-xs text-foreground">
                  Great choice! Let me create a personalized plan...
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      icon: Target,
      title: "Define Your Goals",
      description:
        "Rein helps you clarify vague intentions into specific, measurable objectives. Break down big dreams into achievable milestones.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      visual: (
        <div className="relative bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent rounded-xl p-4 h-48 overflow-hidden">
          <div className="space-y-3">
            <div className="bg-background/90 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-foreground">
                  Learn Spanish
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-blue-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-sm"></div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Complete 30 Duolingo lessons
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-border"></div>
                  <span className="text-xs text-muted-foreground">
                    Practice 15 min daily
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-border"></div>
                  <span className="text-xs text-muted-foreground">
                    Have first conversation by March
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Q1 2026
              </span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">
                Language
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      icon: FileText,
      title: "Review Your Plan",
      description:
        "Get an AI-generated implementation plan tailored to your schedule, preferences, and lifestyle. Approve, tweak, or regenerate until it fits perfectly.",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      visual: (
        <div className="relative bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent rounded-xl p-4 h-48 overflow-hidden">
          <div className="bg-background/90 rounded-lg p-3 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">
                Implementation Plan
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Ready for Review
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                <span className="text-xs text-emerald-400 font-mono">
                  Week 1-2
                </span>
                <span className="text-xs text-muted-foreground">
                  Basics & Fundamentals
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                <span className="text-xs text-emerald-400 font-mono">
                  Week 3-4
                </span>
                <span className="text-xs text-muted-foreground">
                  Vocabulary Building
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                <span className="text-xs text-emerald-400 font-mono">
                  Week 5-8
                </span>
                <span className="text-xs text-muted-foreground">
                  Conversation Practice
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="text-[10px] px-3 py-1 rounded-full bg-emerald-500 text-emerald-950 font-medium">
                Approve
              </button>
              <button className="text-[10px] px-3 py-1 rounded-full border border-border text-muted-foreground">
                Edit
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      icon: Link2,
      title: "Connect Your Tools",
      description:
        "Link GitHub, Google Calendar, Slack, and more. Rein integrates with the tools you already use to make execution seamless.",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      visual: (
        <div className="relative bg-gradient-to-br from-cyan-500/20 via-violet-500/5 to-transparent rounded-xl p-4 h-48 overflow-hidden">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-transparent flex items-center justify-center z-10 shadow-lg shadow-primary/30">
                <Image
                  src="/rein-logo.svg"
                  alt="Rein Logo"
                  width={28}
                  height={28}
                />
              </div>

              <div className="absolute -left-16 top-1/2 -translate-y-1/2">
                <div className="w-12 h-12 rounded-xl bg-background/90 border border-border flex items-center justify-center shadow-sm">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div className="absolute w-8 h-px bg-cyan-400/50 -right-2 top-1/2"></div>
              </div>

              <div className="absolute -right-16 top-1/2 -translate-y-1/2">
                <div className="w-12 h-12 rounded-xl bg-background/90 border border-border flex items-center justify-center shadow-sm">
                  <SlackSvg className="w-6 h-6 text-[#4A154B]" />
                </div>
                <div className="absolute w-8 h-px bg-cyan-400/50 -left-2 top-1/2"></div>
              </div>

              <div className="absolute top-[-40px] left-1/2 -translate-x-1/2">
                <div className="w-12 h-12 rounded-xl bg-background/90 border border-border flex items-center justify-center shadow-sm">
                  <CalenderSvg className="w-6 h-6 text-[#4285F4]" />
                </div>
                <div className="absolute h-6 w-px bg-cyan-400/50 -bottom-2 left-1/2"></div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-8">
              + 20 more integrations
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      icon: RefreshCw,
      title: "Auto-Sync Everything",
      description:
        "Rein automatically creates calendar events, GitHub commits, Slack reminders, and more. Your plan syncs in real-time across all platforms.",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      visual: (
        <div className="relative bg-gradient-to-br from-orange-500/20 via-orange-500/5 to-transparent rounded-xl p-4 h-48 overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/90 border border-border">
              <Calendar className="w-4 h-4 text-blue-400" />
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">
                  Spanish Practice
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Added to Google Calendar
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Synced
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/90 border border-border">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">
                  Learning commit
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Pushed to GitHub
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Synced
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/90 border border-orange-500/30">
              <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">
                  Daily reminder
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Syncing to Slack...
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                Syncing
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      icon: LayoutDashboard,
      title: "Track on Dashboard",
      description:
        "Visualize your progress with beautiful dashboards. See streaks, completion rates, and upcoming tasks all in one place.",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      visual: (
        <div className="relative bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent rounded-xl p-4 h-48 overflow-hidden">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-background/90 rounded-lg p-3 border border-border">
              <p className="text-[10px] text-muted-foreground mb-1">
                Current Streak
              </p>
              <p className="text-2xl font-black text-purple-400">14 🔥</p>
            </div>
            <div className="bg-background/90 rounded-lg p-3 border border-border">
              <p className="text-[10px] text-muted-foreground mb-1">
                Completion
              </p>
              <p className="text-2xl font-black text-emerald-400">87%</p>
            </div>
            <div className="col-span-2 bg-background/90 rounded-lg p-3 border border-border">
              <p className="text-[10px] text-muted-foreground mb-2">
                Weekly Progress
              </p>
              <div className="flex items-end gap-1 h-12">
                <div
                  className="flex-1 bg-purple-500/30 rounded-t"
                  style={{ height: "40%" }}
                ></div>
                <div
                  className="flex-1 bg-purple-500/50 rounded-t"
                  style={{ height: "60%" }}
                ></div>
                <div
                  className="flex-1 bg-purple-500/70 rounded-t"
                  style={{ height: "45%" }}
                ></div>
                <div
                  className="flex-1 bg-purple-500/80 rounded-t"
                  style={{ height: "80%" }}
                ></div>
                <div
                  className="flex-1 bg-purple-500 rounded-t"
                  style={{ height: "100%" }}
                ></div>
                <div
                  className="flex-1 bg-purple-500 rounded-t"
                  style={{ height: "90%" }}
                ></div>
                <div
                  className="flex-1 bg-purple-500/60 rounded-t"
                  style={{ height: "70%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      icon: Sparkles,
      title: "Get AI Insights",
      description:
        "Powered by Opik, receive intelligent insights about your patterns, personalized recommendations, and predictive analytics to optimize your journey.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      visual: (
        <div className="relative bg-gradient-to-br from-yellow-500/20 via-amber-500/5 to-transparent rounded-xl p-4 h-48 overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-semibold text-foreground">
                AI Insights
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 ml-auto">
                Powered by Opik
              </span>
            </div>
            <div className="bg-background/90 rounded-lg p-3 border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-xs text-foreground font-medium">
                    Peak Performance Time
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    You&apos;re 3x more productive between 9-11 AM
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-background/90 rounded-lg p-3 border border-border">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-xs text-foreground font-medium">
                    Recommendation
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Schedule Spanish practice at 9:30 AM for best results
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  } as const;

  const stepVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative py-24 px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-40 overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto">
        {/* Section Header */}
        <motion.div
          className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mb-20 xl:mb-28 2xl:mb-32"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 xl:gap-3 mb-4 xl:mb-6">
            <div className="w-12 xl:w-16 2xl:w-20 h-px bg-primary"></div>
            <span className="text-xs xl:text-sm 2xl:text-base text-primary tracking-widest uppercase font-semibold">
              How It Works
            </span>
          </div>

          <h2
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black leading-tight mb-6 xl:mb-8"
            style={{ letterSpacing: "-0.02em" }}
          >
            <span className="text-foreground">From Intention</span>
            <br />
            <span className="text-primary">To Execution.</span>
          </h2>

          <p className="text-base xl:text-lg 2xl:text-xl text-muted-foreground leading-relaxed max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
            Simple steps to transform how you achieve your goals. Rein handles
            the complexity so you can focus on what matters.
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Animated connecting line */}
          <div className="absolute left-[28px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border">
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-primary to-primary/50"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Steps */}
          <motion.div
            className="relative space-y-12 md:space-y-24 lg:space-y-28 xl:space-y-32 2xl:space-y-40"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`relative flex flex-col md:flex-row items-start gap-6 md:gap-12 lg:gap-14 xl:gap-16 2xl:gap-20 ${
                  index % 2 === 0
                    ? "md:flex-row lg:flex-row"
                    : "md:flex-row-reverse lg:flex-row-reverse"
                }`}
                variants={stepVariants}
              >
                {/* Step number indicator */}
                <div
                  className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10 flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 rounded-full ${step.bgColor} border-4 xl:border-[5px] 2xl:border-6 border-background shadow-lg`}
                >
                  <step.icon
                    className={`w-6 h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-9 2xl:h-9 ${step.color}`}
                  />
                </div>

                {/* Content */}
                <div
                  className={`flex-1 ml-20 md:ml-0 ${
                    index % 2 === 0
                      ? "md:pr-20 lg:pr-22 xl:pr-24 2xl:pr-28 md:text-right"
                      : "md:pl-20 lg:pl-22 xl:pl-24 2xl:pl-28 md:text-left"
                  }`}
                >
                  <div
                    className={`inline-flex items-center gap-2 lg:gap-3 xl:gap-3 mb-2 xl:mb-3 ${
                      index % 2 === 0 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <span
                      className={`text-sm xl:text-base 2xl:text-lg font-bold ${step.color}`}
                    >
                      Step {step.id}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 ${step.color} ${
                        index % 2 === 0 ? "md:rotate-180" : ""
                      }`}
                    />
                  </div>
                  <h3 className="text-xl md:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-foreground mb-3 xl:mb-4 2xl:mb-5">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base xl:text-lg 2xl:text-xl text-muted-foreground leading-relaxed max-w-md xl:max-w-lg 2xl:max-w-xl">
                    {step.description}
                  </p>
                </div>

                {/* Visual */}
                <div
                  className={`flex-1 ml-20 md:ml-0 w-full max-w-sm xl:max-w-md 2xl:max-w-lg ${
                    index % 2 === 0
                      ? "md:pl-20 xl:pl-24 2xl:pl-28"
                      : "md:pr-20 xl:pr-24 2xl:pr-28"
                  }`}
                >
                  <motion.div
                    className={`rounded-xl xl:rounded-2xl border ${step.borderColor} bg-card overflow-hidden shadow-lg xl:shadow-xl`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.visual}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
