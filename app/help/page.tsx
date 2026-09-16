import type { Metadata } from "next";
import { HelpClient } from "@/components/easeitr/help-client";

export const metadata: Metadata = {
  title: "Tax Guides & Assistance",
  description:
    "Explore clear plain-language guides on ITR forms, tax regimes, capital gains, and filing requirements.",
};

export default function HelpPage() {
  return <HelpClient />;
}
