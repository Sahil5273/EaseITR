"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AssessmentProvider } from "@/lib/state/assessment-context";
import { WebMCPBridge } from "@/components/easeitr/webmcp-bridge";

import { SmoothScrollProvider } from "@/components/ui/smooth-scroll-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SmoothScrollProvider>
        <AssessmentProvider>
          <WebMCPBridge />
          {children}
        </AssessmentProvider>
      </SmoothScrollProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
