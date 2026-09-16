import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "EaseITR | Guided Tax Assessment and ITR Form Assistance",
    template: "%s | EaseITR",
  },
  description:
    "EaseITR guides individual taxpayers through their income details, provides estimated tax comparisons, and explains which ITR form may apply.",
  applicationName: "EaseITR",
  openGraph: {
    title: "EaseITR | Guided Tax Assessment and ITR Form Assistance",
    description:
      "EaseITR guides individual taxpayers through their income details, provides estimated tax comparisons, and explains which ITR form may apply.",
    siteName: "EaseITR",
    type: "website",
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
