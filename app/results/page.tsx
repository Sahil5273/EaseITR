import type { Metadata } from "next";
import { ResultsClient } from "@/components/easeitr/results-client";

export const metadata: Metadata = {
  title: "ITR Recommendation & Tax Comparison",
  description:
    "Detailed explainable ITR form recommendation and Old vs New tax regime comparison for your assessment.",
};

export default function ResultsPage() {
  return <ResultsClient />;
}
