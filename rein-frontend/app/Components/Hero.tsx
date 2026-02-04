"use client";

import React from "react";
import CardSwap, { Card } from "../animations/CardSwap";
import { Target, Brain, Calendar, Badge, Trophy, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 lg:mt-8 md:px-12 lg:px-24 pt-24 overflow-hidden">
      {/* <div className="inline-block border-2 border-black bg-primary/10 px-4 py-1 mb-6 -rotate-1">
        <span className="text-xs font-bold uppercase tracking-widest">
          The Execution Agent is here.
        </span>
      </div> */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Text Section */}
        <section className="pt-2 pb-20 px-4 text-left">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6">
            REIN YOUR <br />
            <span className="text-primary italic">FUTURE.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl font-medium text-muted-foreground mb-10">
            Turn vague goals into real-world commits, events, and streaks. Rein
            is the bridge between your intentions and your tools.
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity">
              Start Executing
            </button>
            <button className="border border-border px-6 py-3 rounded-full font-medium hover:bg-muted transition-colors">
              Learn More
            </button>
          </div>
        </section>

        {/* Illustration Section */}
        <div className="relative flex items-center justify-center min-h-[450px] md:min-h-[500px] lg:min-h-[550px]">
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
