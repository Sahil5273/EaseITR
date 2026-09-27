"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AssessmentProvider } from "@/lib/state/assessment-context";
import { AuthProvider } from "@/lib/state/auth-context";
import { WebMCPBridge } from "@/components/easeitr/webmcp-bridge";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <AssessmentProvider>
          <WebMCPBridge />
          {children}
        </AssessmentProvider>
      </AuthProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
