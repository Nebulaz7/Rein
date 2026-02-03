'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function GitHubCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Connecting your GitHub account...');

  useEffect(() => {
    const connectGitHub = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code) {
        setError('No authorization code received from GitHub');
        return;
      }

      try {
        // Get the current user's ID from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Not authenticated. Please sign in first.');
          return;
        }

        setStatus('Exchanging authorization code...');

        // Send code to backend to complete OAuth
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github/connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code,
            userId: user.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to connect GitHub account');
        }

        const data = await response.json();
        
        setStatus('GitHub connected successfully!');
        
        // Success! Redirect back to home with success message
        setTimeout(() => {
          router.push('/home?github=connected');
        }, 1000);
      } catch (err: any) {
        console.error('GitHub connection error:', err);
        setError(err.message || 'An unexpected error occurred');
      }
    };

    connectGitHub();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="max-w-md w-full p-8 bg-card border border-border rounded-lg shadow-lg">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">
            Connection Failed
          </h1>
          <p className="text-center text-muted-foreground mb-6">{error}</p>
          <button 
            onClick={() => router.push('/home')}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-8 bg-card border border-border rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            <svg
              className="absolute inset-0 m-auto w-8 h-8 text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-foreground mb-2">
          Connecting GitHub
        </h1>
        <p className="text-center text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
