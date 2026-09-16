"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Flag, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppShell } from "./app-shell";
import { ActiveWizardSection } from "./wizard-sections";
import { ProgressSidebar, WizardProgressBar } from "./wizard-progress";
import { WIZARD_STEPS, type WizardStepSlug } from "@/lib/domain/constants";
import { useAssessment } from "@/lib/state/assessment-context";

export function WizardClient({ step }: { step: WizardStepSlug }) {
  const router = useRouter();
  const { data, savedAt, update } = useAssessment();
  const index = WIZARD_STEPS.findIndex((item) => item.slug === step);
  const previous = WIZARD_STEPS[index - 1];
  const next = WIZARD_STEPS[index + 1];
  const flagged = data.reviewFlags.includes(step);

  const moveForward = () => {
    if (step === "review") {
      if (!data.confirmed) {
        toast.error("Confirm that you reviewed the summary first.");
        return;
      }
      update((current) => ({
        ...current,
        status: "complete",
        currentStep: "review",
      }));
      router.push("/results");
      return;
    }
    if (next) {
      update((current) => ({
        ...current,
        status: next.slug === "review" ? "review" : "in-progress",
        currentStep: next.slug,
      }));
      router.push(`/assessment/${next.slug}`);
    }
  };

  const toggleFlag = () =>
    update((current) => ({
      ...current,
      reviewFlags: flagged
        ? current.reviewFlags.filter((item) => item !== step)
        : [...current.reviewFlags, step],
    }));

  return (
    <AppShell width="wide">
      <WizardProgressBar current={step} />
      <div className="flex items-start gap-8">
        <ProgressSidebar current={step} />
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                Step {index + 1} of {WIZARD_STEPS.length}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em]">
                {WIZARD_STEPS[index].label}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Check className="size-3.5 text-emerald-600" />
              {savedAt
                ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Autosave ready"}
            </div>
          </div>
          <ActiveWizardSection step={step} data={data} update={update} />
          <div className="sticky bottom-4 z-20 mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            {previous ? (
              <Button variant="outline" asChild className="rounded-xl">
                <Link href={`/assessment/${previous.slug}`}>
                  <ArrowLeft />
                  Previous
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild className="rounded-xl">
                <Link href="/assessment">
                  <ArrowLeft />
                  Intro
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => toast.success("Assessment saved on this device.")}
            >
              <Save />
              Save
            </Button>
            <Button variant="ghost" className="rounded-xl" onClick={toggleFlag}>
              <Flag />
              {flagged ? "Remove flag" : "Review later"}
            </Button>
            <Button variant="ghost" asChild className="mr-auto rounded-xl">
              <Link href="/dashboard">Exit & resume later</Link>
            </Button>
            <Button
              onClick={moveForward}
              className="rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"
              disabled={step === "review" && !data.confirmed}
            >
              {step === "review" ? "Generate mock results" : "Save & continue"}
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
