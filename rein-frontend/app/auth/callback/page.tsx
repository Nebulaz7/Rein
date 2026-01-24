"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase automatically handles the code exchange via URL hash/fragment
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Success – redirect to dashboard/home
        router.push("/home"); // or "/" or wherever
      } else {
        // Failed – back to login
        router.push("/login?error=auth_failed");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Authenticating...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait</p>
      </div>
    </div>
  );
}