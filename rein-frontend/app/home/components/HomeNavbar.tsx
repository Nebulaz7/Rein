"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface Integration {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
}

interface UserProfile {
  avatarUrl: string | null;
  fullName: string | null;
  email: string | null;
  provider: string | null;
}

const Navbar = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    avatarUrl: null,
    fullName: null,
    email: null,
    provider: null,
  });

  // Fetch user profile on mount
  useEffect(() => {
    const searchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
      }
    };

    searchUser();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Extract profile info from user metadata
        const metadata = user.user_metadata;
        const provider = user.app_metadata?.provider || null;

        setUserProfile({
          avatarUrl: metadata?.avatar_url || metadata?.picture || null,
          fullName: metadata?.full_name || metadata?.name || null,
          email: user.email || null,
          provider: provider,
        });
      }
    };

    fetchUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const metadata = session.user.user_metadata;
        const provider = session.user.app_metadata?.provider || null;

        setUserProfile({
          avatarUrl: metadata?.avatar_url || metadata?.picture || null,
          fullName: metadata?.full_name || metadata?.name || null,
          email: session.user.email || null,
          provider: provider,
        });
      } else {
        setUser(null);
        setUserProfile({
          avatarUrl: null,
          fullName: null,
          email: null,
          provider: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "github",
      name: "GitHub",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
      ),
      connected: false,
    },
    {
      id: "calendar",
      name: "Google Calendar",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      connected: false,
    },
    {
      id: "slack",
      name: "Slack",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
        </svg>
      ),
      connected: false,
    },
  ]);

  // Function to check calendar connection status
  const checkCalendarConnection = async (userId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/mcp/calendar/status?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.connected || false;
      }
      return false;
    } catch (error) {
      console.error('Failed to check calendar connection:', error);
      return false;
    }
  };

  // Function to check Slack connection status
  const checkSlackConnection = async (userId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/slack/status?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.connected || false;
      }
      return false;
    } catch (error) {
      console.error('Failed to check Slack connection:', error);
      return false;
    }
  };

  // Check integration statuses when user is available
  useEffect(() => {
    const checkIntegrationStatuses = async () => {
      if (!user?.id) return;
      
      try {
        const [calendarConnected, slackConnected] = await Promise.all([
          checkCalendarConnection(user.id),
          checkSlackConnection(user.id),
        ]);

        setIntegrations(prev => 
          prev.map(integration => {
            if (integration.id === 'calendar') {
              return { ...integration, connected: calendarConnected };
            }
            if (integration.id === 'slack') {
              return { ...integration, connected: slackConnected };
            }
            return integration;
          })
        );
      } catch (error) {
        console.error('Failed to check integration statuses:', error);
      }
    };

    checkIntegrationStatuses();

    // Also check for OAuth callback in URL
    const params = new URLSearchParams(window.location.search);
    const slackStatus = params.get('slack');
    
    if (slackStatus === 'connected') {
      // Slack just connected, refresh status
      checkIntegrationStatuses();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user?.id]);

  const handleConnect = (id: string) => {
    const userId = user?.id;
    if (!userId) {
      console.error("No user ID available");
      return;
    }

    if (id === "calendar") {
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/mcp/calendar/auth?userId=${userId}`,
        "calendar-auth",
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      if (!authWindow) {
        alert("Popup blocked. Please allow popups for this site.");
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        const backendOrigin = process.env.NEXT_PUBLIC_API_URL ? 
          new URL(process.env.NEXT_PUBLIC_API_URL).origin : 
          window.location.origin;
        
        if (event.origin !== backendOrigin && event.origin !== window.location.origin) {
          console.warn('Ignoring message from unauthorized origin:', event.origin);
          return;
        }

        if (event.data?.type === "calendar_connected" && event.data?.success) {
          console.log("Calendar connected successfully!");
          setIntegrations((prev) =>
            prev.map((int) =>
              int.id === "calendar" ? { ...int, connected: true } : int,
            ),
          );
          authWindow.close();
          window.removeEventListener("message", handleMessage);
        }
      };

      window.addEventListener("message", handleMessage);

      const checkClosed = setInterval(() => {
        if (authWindow.closed) {
          window.removeEventListener("message", handleMessage);
          clearInterval(checkClosed);
        }
      }, 500);
    } else if (id === "slack") {
      // Redirect to Slack OAuth flow
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/slack/connect?userId=${userId}`;
    } else {
      console.log(`Connecting to ${id}... (not implemented yet)`);
    }
  };

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <nav className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between">
      {/* Logo */}
      <Link href="/home" className="flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center">
          <Image
            src="/rein-logo.png"
            className="rounded-md"
            alt="Rein Logo"
            width={24}
            height={24}
          />
        </div>
        <h1 className="text-foreground font-semibold text-xl hidden sm:block">
          <span className="text-primary">Rein</span>
        </h1>
      </Link>

      {/* Center: Integrations Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border hover:border-primary rounded-lg transition-all duration-150 cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span className="text-foreground text-sm font-medium hidden sm:inline">
            Integrations
          </span>
          {connectedCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full">
              {connectedCount}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform duration-150 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* Dropdown Content */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-64 bg-card border-2 border-border rounded-lg shadow-lg z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Connect Apps
                </p>
              </div>

              <div className="py-2">
                {integrations.map((integration) => (
                  <button
                    key={integration.id}
                    onClick={() => handleConnect(integration.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${
                          integration.connected
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {integration.icon}
                      </div>
                      <span className="text-foreground text-sm">
                        {integration.name}
                      </span>
                    </div>
                    {integration.connected ? (
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Connected
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Connect
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-3">
        {/* User Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
          >
            {userProfile.avatarUrl ? (
              <Image
                src={userProfile.avatarUrl}
                alt={userProfile.fullName || "User avatar"}
                width={32}
                height={32}
                className="w-10 h-10 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-10 h-10 bg-secondary border-2 border-border rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
            <svg
              className={`w-5 h-5 text-muted-foreground hidden sm:block transition-transform duration-150 ${
                isProfileDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsProfileDropdownOpen(false)}
              />

              {/* Dropdown Content */}
              <div className="absolute top-full mt-2 right-0 w-64 bg-card border-2 border-border rounded-lg shadow-lg z-20 overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    {userProfile.avatarUrl ? (
                      <Image
                        src={userProfile.avatarUrl}
                        alt={userProfile.fullName || "User avatar"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {userProfile.fullName || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {userProfile.email}
                      </p>
                      {userProfile.provider && (
                        <p className="text-xs text-primary capitalize"></p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/settings"
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm text-foreground">Settings</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors cursor-pointer text-red-500"
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="text-sm">Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;