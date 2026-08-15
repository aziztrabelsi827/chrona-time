"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { TimeSyncProvider } from "@/hooks/useTimeSync";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TimeSyncProvider>{children}</TimeSyncProvider>
    </ThemeProvider>
  );
}
