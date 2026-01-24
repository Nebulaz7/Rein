"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../home/components/HomeNavbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  Play,
  Terminal,
  Plus,
  ArrowUp,
  Lightbulb,
  ChevronDown,
  MoreHorizontal,
  Sparkles,
  GripVertical,
} from "lucide-react";
import { button } from "framer-motion/m";

interface Message {
  role: "user" | "assistant";
  content: string;
  actionsTaken?: number;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt");
  const mode = searchParams.get("mode");

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const MIN_SIDEBAR_WIDTH = 240;
  const MAX_SIDEBAR_WIDTH = 700;

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // This state represents the "Work in Progress" for Opik evaluations
  const [auditStats, setAuditStats] = useState({
    clarityScore: 0,
    actionability: 0,
    platformReady: false,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "80px";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
    }
  }, [userInput]);

  // 1. Initial Analysis on Load
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      handleInitialAnalysis(initialPrompt);
    }
  }, [initialPrompt]);

  const handleInitialAnalysis = async (prompt: string) => {
    setIsProcessing(true);
    setMessages([{ role: "user", content: prompt }]);

    // Simulate Agent Reasoning
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I've analyzed your goal. It's a great start! To make this executable, I've drafted some SMART goals. Does this timeline work for you, or should we adjust the intensity?`,
          actionsTaken: 3,
        },
      ]);
      setAuditStats({ clarityScore: 7, actionability: 4, platformReady: true });
      setIsProcessing(false);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const newMsg: Message = { role: "user", content: userInput };
    setMessages((prev) => [...prev, newMsg]);
    setUserInput("");
    setIsProcessing(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Understood. I've updated the plan constraints.",
          actionsTaken: 2,
        },
      ]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area - Full Width Bolt-style */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Messages Section */}
          <div className="flex-1 overflow-y-auto">
            <section className="flex flex-col gap-6 w-full max-w-3xl py-6 mx-auto px-4">
              {messages.map((m, i) => (
                <div key={i} className="flex flex-col gap-3">
                  {m.role === "user" ? (
                    /* User Message - Right aligned bubble */
                    <div className="relative flex flex-col overflow-hidden bg-primary/10 border border-primary/20 px-4 py-3 rounded-2xl self-end max-w-[85%]">
                      <p className="text-sm text-foreground">{m.content}</p>
                    </div>
                  ) : (
                    /* Assistant Message - Full width with icon */
                    <div className="relative flex flex-col overflow-hidden">
                      <div className="flex flex-col gap-3 w-full">
                        {/* Header with Rein icon and actions menu */}
                        <div className="flex items-center min-h-6 select-none justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Rein AI
                            </span>
                          </div>
                          <button className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Message Content */}
                        <div className="text-sm text-foreground leading-relaxed pl-10">
                          {m.content}
                        </div>

                        {/* Actions Taken Accordion */}
                        {m.actionsTaken && (
                          <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground pl-10 py-2 group">
                            <MoreHorizontal className="w-4 h-4" />
                            <span>{m.actionsTaken} actions taken</span>
                            <span className="flex-1" />
                            <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                          </button>
                        )}

                        {/* Version Card */}
                        <div className="pl-10 mt-2">
                          <div className="relative h-16 flex items-center justify-between p-3 py-2 rounded-lg border border-primary/20 bg-primary/5 max-w-[360px]">
                            <div className="flex-col min-w-0 pr-0">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-sm text-foreground truncate max-w-[280px]">
                                  Plan analysis complete
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground pt-1">
                                Version 1
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading State */}
              {isProcessing && (
                <div className="flex items-center gap-3 pl-10">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                  <span className="text-sm text-muted-foreground italic">
                    Rein AI is thinking...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </section>
          </div>

          {/* Scroll to Bottom Button */}
          {messages.length > 3 && (
            <div className="sticky h-0 z-10 flex justify-center w-full bottom-48">
              <button
                onClick={() =>
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex items-center justify-center size-8 rounded-full shadow-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sticky Bottom Prompt Box */}
          <div className="z-20 sticky bottom-0 bg-background">
            <div className="px-4 w-full max-w-3xl mx-auto pb-6">
              {/* Prompt Container */}
              <div className="relative shadow-lg rounded-2xl overflow-hidden">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 -z-10" />

                <div className="bg-card border border-border rounded-2xl">
                  {/* Textarea */}
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="How can Rein help you today?"
                      className="w-full pl-5 pt-5 pr-16 focus:outline-none resize-none text-foreground placeholder:text-muted-foreground bg-transparent text-sm min-h-[80px] max-h-[400px]"
                    />
                  </div>

                  {/* Bottom Toolbar */}
                  <div className="flex justify-between items-center text-sm px-3 pb-3 pt-2 overflow-hidden gap-2">
                    {/* Left Side Actions */}
                    <div className="flex gap-1 items-center min-w-0 flex-shrink">
                      {/* Model Selector */}
                      <button className="flex items-center gap-1 text-xs px-2 h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Rein Agent</span>
                        <ChevronDown className="w-3 h-3 opacity-70" />
                      </button>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Send Button */}
                      <button
                        onClick={handleSendMessage}
                        disabled={!userInput.trim() || isProcessing}
                        className="flex items-center justify-center font-bold px-3 py-1 gap-1 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                      >
                        Send
                        <ArrowUp className="w-4 h-4 inline-block mt-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Rein Intelligence Sidebar with Resize Handle */}
        <div className="hidden lg:flex">
          {/* Resize Handle */}
          <div
            onMouseDown={handleMouseDown}
            className={`w-1 hover:w-1.5 bg-border hover:bg-primary/50 cursor-col-resize transition-all flex items-center justify-center group ${
              isResizing ? "bg-primary/50 w-1.5" : ""
            }`}
          >
            <div
              className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                isResizing ? "opacity-100" : ""
              }`}
            >
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>

          {/* Sidebar Content */}
          <div
            ref={sidebarRef}
            style={{ width: sidebarWidth }}
            className="bg-secondary/30 p-6 flex flex-col gap-6 overflow-y-auto"
          >
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Rein Audit Trace
              </h2>
              <Card className="p-4 bg-black text-green-500 font-mono text-[10px] space-y-1 border-none">
                <p>
                  &gt; OPIK_TRACE_ID: {Math.random().toString(36).substring(7)}
                </p>
                <p>&gt; CLARITY_SCORE: {auditStats.clarityScore}/10</p>
                <p>&gt; ACTIONABILITY: {auditStats.actionability}/10</p>
                <p>
                  &gt; STATUS: {isProcessing ? "ANALYZING" : "AWAITING_CONFIRM"}
                </p>
              </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold">Draft SMART Goals</h2>
              {/* Example Goal Card */}
              <div className="p-3 bg-card border border-border rounded-lg shadow-sm space-y-2">
                <Badge variant="outline" className="text-[10px]">
                  GitHub + Calendar
                </Badge>
                <p className="text-xs font-medium">
                  Build MVP core architecture
                </p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Measurable:
                  5 modules
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Button
                className="w-full py-6 text-lg font-black uppercase group"
                disabled={!auditStats.platformReady}
              >
                Implement Plan
                <Play className="ml-2 w-4 h-4 group-hover:fill-current" />
              </Button>
              <p className="text-[10px] text-center mt-2 text-muted-foreground italic">
                Ready to route to Google Calendar & GitHub
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
