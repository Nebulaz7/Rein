"use client";

import React, { useState } from "react";
import Navbar from "./components/HomeNavbar";
import Sidebar from "./components/Sidebar";
import PromptInput from "./components/PromptInput";
import CalenderSvg from "../svgs/CalenderSvg";
import { PanelLeft } from "lucide-react";

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
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
              Turn your goals into real-world execution with AI-powered
              planning.
              <CalenderSvg className="w-6 h-6 inline-block ml-2" />
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
