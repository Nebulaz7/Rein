import React from "react";
import Navbar from "./components/HomeNavbar";
import PromptInput from "./components/PromptInput";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-24 sm:pt-32 md:pt-48 w-full px-4">
        {/* Background glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/20 rounded-full blur-[120px] opacity-30"></div>
        </div>

        <div className="relative z-10 flex flex-col gap-4 items-center mb-8">
          {/* Main Heading */}
          <h1 className="flex flex-wrap items-center gap-2 sm:gap-3 text-foreground justify-center font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-center">
            What will you
            <span className="sr-only"> </span>
            <span className="bg-gradient-to-b from-[#52cbff] to-[#ededed] bg-clip-text text-transparent">
              execute
            </span>
            today?
          </h1>

          {/* Subtitle */}
          <p className="font-medium text-base sm:text-lg text-muted-foreground text-center max-w-[90vw] md:max-w-xl">
            Turn your goals into real-world execution with AI-powered planning.
          </p>

          {/* Prompt Input */}
          <div className="w-full mt-6 sm:mt-10">
            <PromptInput />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
