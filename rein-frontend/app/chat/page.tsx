import React, { Suspense } from "react";
import Chat from "./Chat";

const page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      }
    >
      <Chat />
    </Suspense>
  );
};

export default page;
