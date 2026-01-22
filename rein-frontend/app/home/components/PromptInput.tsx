"use client";
import React, { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const PromptInput = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isPlanMode, setIsPlanMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "80px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 80), 200)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim()) return;

    // TODO: Pass the prompt to the chat page
    console.log("Submitting prompt:", value);
    console.log("Plan mode:", isPlanMode);

    // Navigate to chat with the prompt
    router.push(
      `/chat?prompt=${encodeURIComponent(value)}&mode=${isPlanMode ? "plan" : "build"}`,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleEnhancePrompt = () => {
    console.log("Prompt enhanced");
  };

  return (
    <div className="relative z-20 w-full max-w-[650px] mx-auto px-4">
      <div className="relative shadow-lg rounded-2xl">
        <div className="rounded-xl bg-card border-2 border-border ring-4 ring-secondary">
          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Type your idea and we'll build it together."
              className="w-full pl-5 pt-5 pr-16 focus:outline-none resize-none text-foreground placeholder:text-muted-foreground bg-transparent text-sm"
              placeholder="Let's build..."
              style={{ minHeight: "80px", maxHeight: "200px" }}
            />
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex justify-between items-center text-sm px-3 pb-3 pt-2 gap-2">
            {/* Left Side - Attach Button */}
            <div className="flex gap-1 items-center min-w-0 shrink">
              <button
                onClick={handleEnhancePrompt}
                aria-label="Enhance prompt"
                className="flex items-center justify-center shrink-0 size-8 text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-full transition-colors cursor-pointer"
                type="button"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Spacer */}
            <div className="flex-1 hidden sm:block"></div>

            {/* Right Side - Plan Toggle & Build Button */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Plan Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsPlanMode(!isPlanMode)}
                className={`rounded-full flex items-center gap-1.5 text-xs h-9 px-3 transition-colors cursor-pointer ${
                  isPlanMode
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
                aria-pressed={isPlanMode}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span className="hidden sm:inline">Plan</span>
              </button>

              {/* Build Now Button */}
              <button
                onClick={handleSubmit}
                disabled={!value.trim()}
                className="flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50 shrink-0 px-4 h-9 text-sm font-medium cursor-pointer"
                aria-label="Send message"
              >
                <span className="hidden sm:inline">Execute now</span>
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="m4.497 20.835l16.51-7.363c1.324-.59 1.324-2.354 0-2.944L4.497 3.164c-1.495-.667-3.047.814-2.306 2.202l3.152 5.904c.245.459.245 1 0 1.458l-3.152 5.904c-.74 1.388.81 2.87 2.306 2.202"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
