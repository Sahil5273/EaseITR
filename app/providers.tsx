"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AssessmentProvider } from "@/lib/state/assessment-context";
import { WebMCPBridge } from "@/components/easeitr/webmcp-bridge";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AssessmentProvider>
        <WebMCPBridge />
        {children}
      </AssessmentProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
