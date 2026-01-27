"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
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
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

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

  // ─── Load or start session ──────────────────────────────────────────
  useEffect(() => {
    if (sessionIdFromUrl) {
      // Coming back to existing session
      loadExistingSession(sessionIdFromUrl);
    } else if (initialPrompt && !session) {
      // Brand new prompt → start clarification
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
      // 1. Call backend to start session
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
        router.push("/resolution"); // or your final page
        return;
      }

      const newSession = data.session;

      // 2. Set session state
      setSession({
        sessionId: newSession.sessionId,
        originalPrompt: newSession.originalPrompt,
        history: newSession.history,
        roundCount: newSession.roundCount,
        isAtLimit: false,
        isReady: false,
      });

      // 3. Show user's original prompt as first message
      const userInitialMsg = { role: "user" as const, content: prompt };
      setMessages([userInitialMsg]);

      // 4. Immediately ask AI for first clarification message
      // We do this by calling /next with an empty userMessage (first turn)
      setIsProcessing(true);

      const firstAiRes = await fetch("http://localhost:5000/context/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: newSession.sessionId,
          userMessage: "", // empty = first turn, AI starts asking
        }),
      });

      if (!firstAiRes.ok) {
        throw new Error("Failed to get initial AI clarification");
      }

      const firstAiData = await firstAiRes.json();

      // 5. Append AI's first message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: firstAiData.assistantMessage },
      ]);

      // 6. Update session state
      setSession((prev) =>
        prev
          ? {
              ...prev,
              roundCount: firstAiData.roundCount,
              isAtLimit: firstAiData.isAtLimit,
              isReady: firstAiData.isReady ?? false,
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
      // TODO: call your final resolution generation endpoint
      // Example:
      const res = await fetch("http://localhost:5000/context/implement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });

      if (!res.ok) throw new Error("Failed to generate resolution");

      const result = await res.json();
      // Redirect or show result
      router.push(`/resolution?sessionId=${session.sessionId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

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
                      <Button
                        onClick={handleSendMessage}
                        disabled={
                          !userInput.trim() ||
                          isProcessing ||
                          session?.isAtLimit
                        }
                        className="text-white font-bold px-1 py-0.5 rounded-full"
                      >
                        <ArrowUp className="w-6 h-6" />
                      </Button>

                      <Button
                        variant="default"
                        onClick={handleImplement}
                        disabled={
                          isProcessing ||
                          (!session?.isReady && !session?.isAtLimit)
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Implement Plan
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar – kept your design */}
        <div className="hidden lg:flex">
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
            {/* Your existing sidebar content – audit trace, SMART goals, etc. */}
            {/* You can connect real data from session here later */}
          </div>
        </div>
      </div>
    </div>
  );
}
