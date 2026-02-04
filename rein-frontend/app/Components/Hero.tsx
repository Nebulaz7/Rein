"use client";

import React from "react";
import CardSwap, { Card } from "../animations/CardSwap";
import { Target, Brain, Calendar, Trophy, Zap } from "lucide-react";
import Grainient from "../animations/Grainient";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
        <div className="hidden lg:flex relative items-center justify-center min-h-[450px] md:min-h-[500px] lg:min-h-[550px]">
          <div className="relative w-full h-full">
            <CardSwap
              width={320}
              height={200}
              cardDistance={50}
              verticalDistance={50}
              delay={4000}
              pauseOnHover={true}
              skewAmount={4}
              easing="elastic"
            >
              {/* Card 1 - Set Goals */}
              <Card className="!bg-background !border-primary/30 brutal-card min-w-[90%] min-h-[55vh] p-6 flex flex-col gap-3 shadow-lg shadow-primary/10">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Set Your Goals
                </h3>
                <p className="text-sm text-muted-foreground">
                  Define resolutions with clarity. Rein helps you break them
                  into actionable steps.
                </p>
              </Card>

              {/* Card 2 - AI Guidance */}
              <Card className="!bg-background !border-primary/30 brutal-card min-w-[90%] min-h-[55vh] p-6 flex flex-col gap-3 shadow-lg shadow-primary/10">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  AI-Powered Guidance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized nudges and insights to keep you on track
                  every day.
                </p>
              </Card>

              {/* Card 3 - Track Progress */}
              <Card className="!bg-background !border-primary/30 brutal-card min-w-[90%] min-h-[55vh] p-6 flex flex-col gap-3 shadow-lg shadow-primary/10">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Track Progress
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visualize your journey and celebrate milestones as you achieve
                  your goals.
                </p>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
