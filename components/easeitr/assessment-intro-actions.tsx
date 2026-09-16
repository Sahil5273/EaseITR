"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssessment } from "@/lib/state/assessment-context";

export function AssessmentIntroActions() {
  const router = useRouter();
  const { loadSample, update } = useAssessment();
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        className="h-12 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"
        onClick={() => {
          update((data) => ({
            ...data,
            status: "in-progress",
            currentStep: "profile",
          }));
          router.push("/assessment/profile");
        }}
      >
        Begin assessment <ArrowRight />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="h-12 rounded-xl"
        onClick={() => {
          loadSample("trader");
          router.push("/dashboard");
        }}
      >
        <Sparkles />
        Try with sample data
      </Button>
    </div>
  );
}
