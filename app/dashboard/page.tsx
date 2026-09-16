import type { Metadata } from "next";
import { DashboardClient } from "@/components/easeitr/dashboard-client";

export const metadata: Metadata = {
  title: "Assessment Dashboard",
  description:
    "Review your estimated income breakdown, regime comparison, and potential ITR form recommendations.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
