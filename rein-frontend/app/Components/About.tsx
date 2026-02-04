import React from "react";
import {
  Target,
  Zap,
  Calendar,
  MessageSquare,
  TrendingUp,
  Shield,
  ArrowRight,
} from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Target,
      title: "Resolution Breakdown",
      description:
        "Transform big dreams into bite-sized daily actions. Rein intelligently breaks down your goals into achievable milestones.",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
    {
      icon: MessageSquare,
      title: "AI Conversations",
      description:
        "Chat naturally about your goals. Rein understands context, remembers your progress, and adapts to your journey.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description:
        "Automatically sync with your calendar. Rein creates events, sets reminders, and respects your existing commitments.",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
    },
    {
      icon: Zap,
      title: "Streak System",
      description:
        "Build unstoppable momentum with streaks. Visual progress tracking that makes consistency addictive.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description:
        "See your growth over time with beautiful insights. Understand patterns and optimize your approach.",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
    {
      icon: Shield,
      title: "Accountability Partner",
      description:
        "Never fall off track again. Rein checks in, celebrates wins, and provides gentle nudges when needed.",
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
    },
  ];

  return (
    <section
      id="about"
      className="relative py-24 px-6 md:px-12 lg:px-24 overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-px bg-primary"></div>
            <span className="text-xs text-primary tracking-widest uppercase font-semibold">
              Why Rein
            </span>
          </div>

          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6"
            style={{ letterSpacing: "-0.02em" }}
          >
            <span className="text-foreground">Your Goals Deserve</span>
            <br />
            <span className="text-primary">An Execution Engine.</span>
          </h2>

          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            Most apps help you set goals. Rein helps you{" "}
            <span className="text-primary font-semibold">achieve</span> them. By
            leveraging AI-powered guidance, smart scheduling, and streak
            tracking, we bridge the gap between your intentions and real-world
            action. It&apos;s the difference between a to-do list and a
            transformation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-xl bg-card border ${feature.borderColor} hover:border-primary/50 transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className={`w-5 h-5 ${feature.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 md:p-8 rounded-2xl bg-card border border-primary/30 brutal-shadow">
            <div className="text-left">
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                Ready to execute?
              </h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Join the beta and start achieving your resolutions today.
              </p>
            </div>
            <button className="brutal-button px-6 py-3 rounded-full flex items-center gap-2 whitespace-nowrap">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
