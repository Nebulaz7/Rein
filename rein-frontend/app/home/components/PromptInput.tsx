"use client";
import React, { useState, useRef, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

// Pool of productivity and work habits suggestions
const PRODUCTIVITY_SUGGESTIONS = [
  "Build a morning routine that sticks",
  "Create a deep work schedule",
  "Start a daily journaling habit",
  "Establish a weekly review system",
  "Build a habit of reading 30 mins daily",
  "Create a Pomodoro workflow",
  "Develop a workout routine before work",
  "Start meal prepping on Sundays",
  "Build a meditation practice",
  "Create a no-phone morning rule",
  "Establish inbox zero by 10am",
  "Start a gratitude journal",
  "Build a sleep schedule optimization plan",
  "Create a focused work environment",
  "Develop a networking habit",
  "Start time-blocking my calendar",
  "Build a skill learning routine",
  "Create a monthly goal review system",
  "Establish a daily standup for myself",
  "Start a side project schedule",
  "Build a healthy lunch break routine",
  "Create a wind-down evening routine",
  "Develop a weekly planning session",
  "Start tracking my habits daily",
  "Build a distraction-free work mode",
];

// Function to get random suggestions
const getRandomSuggestions = (count: number = 3): string[] => {
  const shuffled = [...PRODUCTIVITY_SUGGESTIONS].sort(
    () => Math.random() - 0.5,
  );
  return shuffled.slice(0, count);
};

const PromptInput = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isPlanMode, setIsPlanMode] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "80px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 80), 200)}px`;
    }
  }, [value]);

  // Generate random suggestions on mount
  useEffect(() => {
    setSuggestions(getRandomSuggestions(3));
  }, []);

  const refreshSuggestions = () => {
    setSuggestions(getRandomSuggestions(3));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (!value.trim() || isEnhancing) return;

    const payload = {
      prompt: value.trim(),
      mode: isPlanMode ? "plan" : "build",
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch("https://rein-63fq.onrender.com/context/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Backend analysis result:", result);
    } catch (error) {
      console.error("Error submitting prompt:", error);
    }

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

  const handleEnhancePrompt = async () => {
    if (!value.trim() || isEnhancing) return;

    setIsEnhancing(true);

    // TODO: Call AI API to enhance the prompt
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock enhancement - in production, this would come from the API
    const enhanced = `${value}\n\nEnhanced with: specific timeline, measurable goals, and actionable steps.`;
    setValue(enhanced);

    setIsEnhancing(false);
  };

  return (
    <div className="relative z-20 w-full max-w-[650px] mx-auto px-4">
      <div className="relative shadow-lg rounded-2xl focus-within:ring-6 focus-within:ring-primary">
        <div className="rounded-xl bg-card border-2 border-border ring-6 ring-secondary">
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
            {/* Left Side - Enhance Button */}
            <div className="flex gap-1 items-center min-w-0 shrink relative">
              <button
                onClick={handleEnhancePrompt}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                disabled={!value.trim() || isEnhancing}
                aria-label="Enhance prompt with AI"
                className="flex items-center justify-center shrink-0 size-8 text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed bg-secondary hover:bg-secondary/80 disabled:hover:bg-secondary rounded-full transition-colors cursor-pointer relative"
                type="button"
              >
                {isEnhancing ? (
                  <svg
                    className="w-4 h-4 animate-spin text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>

              {/* Tooltip */}
              {showTooltip && !isEnhancing && value.trim() && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-card border border-border rounded-lg shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <p className="text-xs text-foreground">Enhance with AI</p>
                  <div className="absolute top-full left-4 -translate-x-1/2 border-4 border-transparent border-t-border"></div>
                  <div className="absolute top-full left-4 -translate-x-1/2 -mt-px border-4 border-transparent border-t-card"></div>
                </div>
              )}
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
                disabled={!value.trim() || isEnhancing}
                className="flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50 shrink-0 px-4 h-9 text-sm font-medium cursor-pointer"
                aria-label="Send message"
              >
                <span className="hidden sm:inline">
                  {isEnhancing ? "Enhancing..." : "Execute now"}
                </span>
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

      <div>
        {/* Suggestion pills */}
        <div className="flex flex-wrap justify-center items-center gap-2 mt-6 mb-8">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-1.5 bg-secondary brutal-shadow-sm brutal-shadow-hover text-sm rounded-full cursor-pointer hover:bg-secondary/80 hover:border-primary/30 border border-transparent transition-all text-foreground"
            >
              {suggestion}
            </button>
          ))}
          <button
            onClick={refreshSuggestions}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-full transition-colors cursor-pointer"
            aria-label="Refresh suggestions"
            title="Get new suggestions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
