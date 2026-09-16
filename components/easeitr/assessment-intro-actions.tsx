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
        className="h-11 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800"
        onClick={() => {
          update((data) => ({
            ...data,
            status: "in-progress",
            currentStep: "profile",
          }));
          router.push("/assessment/profile");
        }}
      >
        Begin assessment <ArrowRight className="ml-1.5 size-4" aria-hidden="true" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="h-11 rounded-lg border-slate-200 font-medium"
        onClick={() => {
          loadSample("trader");
          router.push("/dashboard");
        }}
      >
        <Sparkles className="mr-1.5 size-4 text-emerald-600" aria-hidden="true" />
        Try with sample data
      </Button>
    </div>
  );
}
