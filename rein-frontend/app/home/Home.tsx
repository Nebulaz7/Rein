"use client";

import React, { useState } from "react";
import Navbar from "./components/HomeNavbar";
import Sidebar from "./components/Sidebar";
import PromptInput from "./components/PromptInput";
import CalenderSvg from "../svgs/CalenderSvg";
import { PanelLeft } from "lucide-react";
import PixelBlast from "../animations/PixelBlast";

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-72" : "lg:ml-16"
        }`}
      >
        <Navbar />

        {/* Sidebar Toggle Button (visible when sidebar is closed) */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed top-20 left-4 z-30 p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        {/* Hero Section */}
        <div
          className="relative pt-24 sm:pt-32 md:pt-48 w-full px-4"
          onClick={closeSidebar}
        >
          {/* Background Animation Overlay */}
          <div className="fixed inset-0 z-0 pointer-events-none blur-[3px] hidden md:hidden lg:block">
            <PixelBlast
              variant="square"
              pixelSize={3}
              color="#52cbff"
              patternScale={1.5}
              patternDensity={0.4}
              pixelSizeJitter={0}
              enableRipples={false}
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid={false}
              liquidStrength={0.12}
              liquidRadius={1.2}
              liquidWobbleSpeed={5}
              speed={0.1}
              edgeFade={0.25}
              transparent
            />
          </div>

          {/* Background glow effect */}
          <div className=" fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-screen bg-primary/20 rounded-full blur-[120px] opacity-30"></div>
          </div>

          <div className="relative z-10 flex flex-col gap-4 items-center mb-24">
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
              Turn your goals into real-world execution with AI-powered
              planning.
            </p>

            {/* Prompt Input */}
            <div className="w-full mt-6 sm:mt-10">
              <PromptInput />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
