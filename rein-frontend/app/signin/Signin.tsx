"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // ← adjust path to your actual supabase client file
import { Loader2 } from "lucide-react";

const SignIn = () => {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setLoading(provider);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // Full URL – very important for Supabase to redirect correctly
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent", // forces Google to show consent screen every time (good for dev/testing)
          },
        },
      });

      if (error) throw error;

      // Success – Supabase will redirect automatically to /auth/callback
      // You don't need to do anything else here
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      setError(err.message || `Failed to sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border-2 border-primary p-8 relative overflow-hidden rounded-lg brutal-shadow">
          {/* Accent corner */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-3xl pointer-events-none"></div>

          {/* Logo */}
          <div className="flex justify-center mb-6 pb-3">
            <div className="text-3xl font-bold text-foreground">
              Welcome To <span className="text-primary">Rein</span>
            </div>
          </div>

          {/* Info text */}
          <p className="text-muted-foreground text-center mb-8 pb-4">
            To use Rein you must log into an existing account or create one using one of the options below
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Sign-in buttons */}
          <div className="space-y-4 pb-5">
            <button
              onClick={() => handleOAuthLogin("google")}
              disabled={!!loading}
              className="w-full cursor-pointer bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 px-4 rounded-lg border-2 border-border hover:border-primary transition-all duration-150 flex items-center justify-center space-x-2 brutal-shadow-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "google" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              <span>Sign in with Google</span>
            </button>

            <button
              onClick={() => handleOAuthLogin("github")}
              disabled={!!loading}
              className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg border-2 border-primary transition-all duration-150 flex items-center justify-center space-x-2 brutal-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "github" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              )}
              <span>Sign in with GitHub</span>
            </button>
          </div>

          {/* Terms and privacy */}
          <p className="mt-8 text-xs text-center text-muted-foreground pb-3">
            By signing in, you accept the{" "}
            <Link href="#" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Terms of Service
            </Link>{" "}
            and acknowledge our{" "}
            <Link href="#" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary text-sm font-medium flex items-center justify-center gap-1 transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;