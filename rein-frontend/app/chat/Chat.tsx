"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import GmailSvg from "../svgs/GmailSvg";
import SlackSvg from "../svgs/SlackSvg";
import CalenderSvg from "../svgs/CalenderSvg";
import GithubSvg from "../svgs/GithubSvg";
import Navbar from "../home/components/HomeNavbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  Play,
  Terminal,
  ChevronDown,
  MoreHorizontal,
  GripVertical,
  ArrowUp,
  X,
  Calendar,
  Github,
  Mail,
  MessageSquare,
  Check,
  Circle,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface SessionData {
  sessionId: string;
  originalPrompt: string;
  history: Message[];
  roundCount: number;
  isAtLimit: boolean;
  isReady?: boolean;
  implementationTasks?: string[];
}

interface Integration {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  description: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPrompt = searchParams.get("prompt");
  const mode = searchParams.get("mode");
  const sessionIdFromUrl = searchParams.get("sessionId");

  const [session, setSession] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── Resizable sidebar (kept from your code) ────────────────────────
  const [sidebarWidth, setSidebarWidth] = useState(640);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarStatus, setSidebarStatus] = useState("none");
  const hasInitializedRef = useRef(false);

  // Integration states
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "google-calendar",
      name: "Google Calendar",
      icon: <CalenderSvg />,
      connected: false,
      description: "Sync tasks and deadlines to your calendar",
    },
    {
      id: "github",
      name: "GitHub",
      icon: <GithubSvg />,
      connected: false,
      description: "Create issues and track progress",
    },
    {
      id: "slack",
      name: "Slack",
      icon: <SlackSvg />,
      connected: false,
      description: "Get notifications and reminders",
    },
    {
      id: "google-email",
      name: "Google Email",
      icon: <GmailSvg />,
      connected: false,
      description: "Receive email summaries and updates",
    },
  ]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(
    [],
  );

  const MIN_SIDEBAR_WIDTH = 240;
  const MAX_SIDEBAR_WIDTH = 700;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "80px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        400,
      )}px`;
    }
  }, [userInput]);

useEffect(() => {
  if (hasInitializedRef.current) return;
  
  if (sessionIdFromUrl) {
    hasInitializedRef.current = true;
    loadExistingSession(sessionIdFromUrl);
  } else if (initialPrompt && !session) {
    hasInitializedRef.current = true;
    startClarification(initialPrompt);
  }
}, [initialPrompt, sessionIdFromUrl]);


  const loadExistingSession = async (sid: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:5000/context/session/${sid}`);
      if (!res.ok) throw new Error("Session not found");

      const data = await res.json();

      setSession({
        sessionId: data.sessionId,
        originalPrompt: data.originalPrompt,
        history: data.history,
        roundCount: data.roundCount,
        isAtLimit: data.roundCount >= 2,
        isReady: data.isReady ?? data.roundCount >= 2,
      });

      setMessages(data.history || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

const startClarification = async (prompt: string) => {
  setIsProcessing(true);
  setError(null);

  try {
    // 1. Only start the session (don't ask for clarification yet)
    const res = await fetch("http://localhost:5000/context/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        `Failed to start clarification: ${res.status} - ${errText}`,
      );
    }

    const data = await res.json();

    if (data.type === "skip") {
      router.push("/resolution");
      return;
    }

    const newSession = data.session;

    setSession({
      sessionId: newSession.sessionId,
      originalPrompt: newSession.originalPrompt,
      history: newSession.history,
      roundCount: newSession.roundCount,
      isAtLimit: false,
      isReady: false,
    });

    const userInitialMsg = { role: "user" as const, content: prompt };
    setMessages([userInitialMsg]);

    // 2. NOW get first AI clarification (with empty userMessage for first turn)
    setIsProcessing(true);

    const firstAiRes = await fetch("http://localhost:5000/context/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: newSession.sessionId,
        userMessage: "",
      }),
    });

    if (!firstAiRes.ok) {
      throw new Error("Failed to get initial AI clarification");
    }

    const firstAiData = await firstAiRes.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: firstAiData.assistantMessage },
    ]);

    setSession((prev) =>
      prev
        ? {
            ...prev,
            roundCount: firstAiData.roundCount,
            isAtLimit: firstAiData.isAtLimit,
            isReady: firstAiData.isReady ?? prev.isReady,
          }
        : null,
    );
  } catch (err: any) {
    setError(err.message || "Failed to start clarification session");
    console.error(err);
  } finally {
    setIsProcessing(false);
  }
};

  const handleSendMessage = async () => {
    if (!userInput.trim() || !session || isProcessing) return;

    const userMsg = userInput.trim();
    setUserInput("");
    setIsProcessing(true);
    setError(null);

    // Optimistic UI
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      const res = await fetch("http://localhost:5000/context/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          userMessage: userMsg,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.assistantMessage },
      ]);

      setSession((prev) =>
        prev
          ? {
              ...prev,
              roundCount: data.roundCount,
              isAtLimit: data.isAtLimit,
              isReady: data.isReady ?? prev.isReady,
            }
          : null,
      );
    } catch (err: any) {
      setError(err.message);
      // Optional: rollback optimistic message
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImplement = async () => {
    if (!session?.isReady && !session?.isAtLimit) return;

    setIsProcessing(true);

    try {
      // Get only connected and selected integrations
      const activeIntegrations = selectedIntegrations.filter((id) =>
        integrations.find((int) => int.id === id && int.connected),
      );

      const res = await fetch("http://localhost:5000/context/implement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          integrations: activeIntegrations,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate resolution");

      const result = await res.json();

      // Redirect to dynamic dashboard with the resolution ID
      router.push(`/dashboard/${result.dashboardId || session.sessionId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleIntegration = (integrationId: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(integrationId)
        ? prev.filter((id) => id !== integrationId)
        : [...prev, integrationId],
    );
  };

  // Mock implementation tasks - in production, these would come from the session
  const implementationTasks = session?.implementationTasks || [
    "Create daily workout schedule",
    "Set up progress tracking milestones",
    "Configure reminder notifications",
    "Establish accountability checkpoints",
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <section className="flex flex-col gap-6 w-full max-w-3xl py-6 mx-auto px-4">
              {messages.map((m, i) => (
                <div key={i} className="flex flex-col gap-3">
                  {m.role === "user" ? (
                    <div className="relative flex flex-col overflow-hidden bg-primary/10 border border-primary/20 px-4 py-3 rounded-2xl self-end max-w-[85%]">
                      <p className="text-sm text-foreground">{m.content}</p>
                    </div>
                  ) : (
                    <div className="relative flex flex-col overflow-hidden">
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex items-center min-h-6 select-none justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center">
                              <Image
                                src="/rein-logo.svg"
                                alt="Rein AI"
                                width={16}
                                height={16}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Rein AI
                            </span>
                          </div>
                          <button className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-sm text-foreground leading-relaxed pl-10">
                          {m.content}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

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

              {error && <div className="text-red-500 pl-10">{error}</div>}

              <div ref={messagesEndRef} />
              {session?.isAtLimit && (
                <div className="pt-3 pb-3 pl-10">
                  <div
                    onClick={() => setSidebarStatus("flex")}
                    className="flex text-left font-ui rounded-lg overflow-hidden border transition duration-300 w-full max-w-md hover:bg-primary/5 px-4 border-primary/30 cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    aria-label="Open Implementation Overview"
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSidebarStatus("flex")
                    }
                  >
                    <div className="flex flex-1 align-start justify-between w-full">
                      <div className="flex flex-1 gap-2 min-w-0">
                        <div className="flex flex-col gap-1 py-4 min-w-0 flex-1">
                          <div className="leading-tight text-sm font-medium line-clamp-1">
                            Implementation Overview
                          </div>
                          <div className="text-xs line-clamp-1 text-muted-foreground">
                            Ready to implement
                            <span className="opacity-50"> ∙ </span>
                            {session.roundCount} clarification rounds
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center w-[68px] relative shrink-0">
                        <div className="absolute right-2 flex flex-1 overflow-hidden w-[52px] h-[71px] rounded-t-lg border border-border select-none scale-100 group-hover:scale-[1.035] rotate-[0.1rad] group-hover:rotate-[0.065rad] duration-300 ease-out group-hover:duration-400 transition-transform translate-y-[19%] bg-card text-muted-foreground whitespace-pre-wrap text-[0.3rem] leading-none p-2 font-mono break-words">
                          <div className="flex flex-col gap-0.5">
                            <div className="h-1 w-8 bg-primary/40 rounded-full"></div>
                            <div className="h-1 w-6 bg-muted-foreground/30 rounded-full"></div>
                            <div className="h-1 w-10 bg-muted-foreground/30 rounded-full"></div>
                            <div className="h-1 w-4 bg-muted-foreground/30 rounded-full"></div>
                            <div className="h-1 w-7 bg-primary/40 rounded-full"></div>
                            <div className="h-1 w-5 bg-muted-foreground/30 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Bottom input */}
          <div className="z-20 sticky bottom-0 bg-background">
            <div className="px-4 w-full max-w-3xl mx-auto pb-6">
              <div className="relative shadow-lg rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 -z-10" />
                <div className="bg-card border border-border rounded-2xl">
                  <textarea
                    ref={textareaRef}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply to Rein AI..."
                    disabled={isProcessing || session?.isAtLimit}
                    className={
                      session?.isAtLimit
                        ? "w-full pl-5 pt-5 pr-16 focus:outline-none resize-none text-foreground placeholder:text-muted-foreground bg-transparent text-sm min-h-20 max-h-100 opacity-50 cursor-not-allowed"
                        : "w-full pl-5 pt-5 pr-16 focus:outline-none resize-none text-foreground placeholder:text-muted-foreground bg-transparent text-sm min-h-20 max-h-100"
                    }
                  />

                  <div className="flex justify-between items-center text-sm px-3 pb-3 pt-2 gap-2">
                    <div className="flex gap-1 items-center">
                      <Image
                        src="/rein-logo.svg"
                        alt="Rein"
                        width={16}
                        height={16}
                      />
                      <span className="text-xs">Rein Agent</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSendMessage}
                        disabled={
                          !userInput.trim() ||
                          isProcessing ||
                          session?.isAtLimit
                        }
                        className="flex items-center justify-center cursor-pointer size-7 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar – kept your design */}
        <div className="hidden lg:flex" style={{ display: sidebarStatus }}>
          <div
            onMouseDown={handleMouseDown}
            className={`w-2 hover:w-2.5 bg-border hover:bg-primary/50 cursor-col-resize transition-all flex items-center justify-center group ${
              isResizing ? "bg-primary/50 w-1.5" : ""
            }`}
          >
            <div
              className={`opacity-100 text-white p-4 bg-gray rounded-full group-hover:opacity-100 transition-opacity ${isResizing ? "opacity-100" : ""}`}
            >
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>

          <div
            style={{ width: sidebarWidth }}
            className="bg-secondary/30 p-6 flex flex-col gap-6 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Implementation Overview</h2>
              <button
                onClick={() => setSidebarStatus("none")}
                className="p-1 rounded-md cursor-pointer hover:bg-secondary text-muted-foreground"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Implementation Tasks */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                What will be implemented
              </h3>
              <div className="flex flex-col gap-2">
                {implementationTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border"
                  >
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrations Selection */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Select integrations to sync
              </h3>
              <div className="flex flex-col gap-2">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    onClick={() =>
                      integration.connected && toggleIntegration(integration.id)
                    }
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      integration.connected
                        ? selectedIntegrations.includes(integration.id)
                          ? "bg-primary/10 border-primary/50 cursor-pointer"
                          : "bg-card border-border cursor-pointer hover:border-primary/30"
                        : "bg-muted/30 border-border opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selectedIntegrations.includes(integration.id) &&
                        integration.connected
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/50"
                      }`}
                    >
                      {selectedIntegrations.includes(integration.id) &&
                        integration.connected && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                    </div>

                    {/* Icon */}
                    <div
                      className={`${integration.connected ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {integration.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {integration.name}
                        </span>
                        {!integration.connected && (
                          <Badge variant="outline" className="text-xs">
                            Not connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Implement Button */}
            <div className="mt-auto pt-4">
              <Button
                variant="default"
                onClick={handleImplement}
                disabled={
                  isProcessing || (!session?.isReady && !session?.isAtLimit)
                }
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Implementing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Implement Now
                  </>
                )}
              </Button>
              {selectedIntegrations.length > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Will sync to {selectedIntegrations.length} integration
                  {selectedIntegrations.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
