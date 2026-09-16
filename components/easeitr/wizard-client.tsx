"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Flag, Forward, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppShell } from "./app-shell";
import { ActiveWizardSection } from "./wizard-sections";
import { ProgressSidebar, WizardProgressBar } from "./wizard-progress";
import { WIZARD_STEPS, type WizardStepSlug } from "@/lib/domain/constants";
import { useAssessment } from "@/lib/state/assessment-context";

export function WizardClient({ step }: { step: WizardStepSlug }) {
  const router = useRouter();
  const { data, savedAt, update } = useAssessment();
  const [skipModalOpen, setSkipModalOpen] = useState(false);

  const index = WIZARD_STEPS.findIndex((item) => item.slug === step);
  const currentStepObj = WIZARD_STEPS[index];
  const previous = WIZARD_STEPS[index - 1];
  const next = WIZARD_STEPS[index + 1];
  const flagged = data.reviewFlags.includes(step);

  // Auto-scroll viewport to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Check if current step has previously entered data
  const hasEnteredData = () => {
    switch (step) {
      case "property":
        return data.houseProperty.propertyCount > 0 || data.houseProperty.rentReceived > 0;
      case "capital-gains":
        return data.capitalGains.transactionCount > 0 || data.capitalGains.shortTermGains > 0 || data.capitalGains.longTermGains > 0;
      case "trading":
        return data.trading.intradayTrading || data.trading.futuresAndOptions || data.trading.turnover > 0;
      case "business":
        return data.business.activityType !== "none" || data.business.grossReceipts > 0;
      case "other-income":
        return data.otherIncome.savingsInterest > 0 || data.otherIncome.fixedDepositInterest > 0 || data.otherIncome.dividends > 0;
      case "deductions":
        return data.deductions.some((d) => d.amount > 0);
      case "tax-payments":
        return data.taxPayments.tds > 0 || data.taxPayments.tcs > 0 || data.taxPayments.advanceTax > 0;
      default:
        return false;
    }
  };

  const handleSkipRequest = () => {
    if (hasEnteredData()) {
      setSkipModalOpen(true);
    } else {
      executeSkip();
    }
  };

  const executeSkip = () => {
    setSkipModalOpen(false);
    update((current) => {
      const skipped = new Set(current.skippedSections || []);
      skipped.add(step);
      return {
        ...current,
        skippedSections: Array.from(skipped),
        sectionStatuses: {
          ...(current.sectionStatuses || {}),
          [step]: "skipped",
        },
      };
    });

    if (step === "tax-payments") {
      toast.warning(
        "Skipping tax payments may make the estimated payable amount or refund inaccurate.",
      );
    } else {
      toast.info(
        "Skipping this section may reduce the accuracy of your tax calculation and ITR recommendation.",
      );
    }

    if (next) {
      router.push(`/assessment/${next.slug}`);
    }
  };

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
        sectionStatuses: {
          ...(current.sectionStatuses || {}),
          review: "completed",
        },
      }));
      router.push("/results");
      return;
    }

    // Mark current step as completed upon explicit user forward navigation
    update((current) => {
      const skipped = (current.skippedSections || []).filter((s) => s !== step);
      return {
        ...current,
        skippedSections: skipped,
        status: next && next.slug === "review" ? "review" : "in-progress",
        currentStep: next ? next.slug : step,
        sectionStatuses: {
          ...(current.sectionStatuses || {}),
          [step]: "completed",
        },
      };
    });

    if (next) {
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
        <div className="min-w-0 flex-1 pb-20">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                Step {index + 1} of {WIZARD_STEPS.length}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em] text-slate-900 dark:text-white">
                {currentStepObj.label}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
              {savedAt
                ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Autosave ready"}
            </div>
          </div>

          <ActiveWizardSection step={step} data={data} update={update} />

          {/* Sticky Bottom Action Controls */}
          <div className="sticky bottom-4 z-20 mt-8 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            {previous ? (
              <Button variant="outline" asChild className="rounded-lg">
                <Link href={`/assessment/${previous.slug}`}>
                  <ArrowLeft className="mr-1.5 size-4" aria-hidden="true" />
                  Previous
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild className="rounded-lg">
                <Link href="/assessment">
                  <ArrowLeft className="mr-1.5 size-4" aria-hidden="true" />
                  Intro
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              className="rounded-lg"
              onClick={() => toast.success("Assessment saved on this device.")}
            >
              <Save className="mr-1.5 size-4" aria-hidden="true" />
              Save
            </Button>

            <Button variant="ghost" className="rounded-lg" onClick={toggleFlag}>
              <Flag className="mr-1.5 size-4" aria-hidden="true" />
              {flagged ? "Remove flag" : "Review later"}
            </Button>

            {currentStepObj.optional && (
              <Button
                variant="outline"
                className="rounded-lg border-amber-300 text-amber-900 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950"
                onClick={handleSkipRequest}
              >
                <Forward className="mr-1.5 size-4" aria-hidden="true" />
                Skip for now
              </Button>
            )}

            <Button variant="ghost" asChild className="mr-auto rounded-lg">
              <Link href="/dashboard">Exit & resume later</Link>
            </Button>

            <Button
              onClick={moveForward}
              className="rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
              disabled={step === "review" && !data.confirmed}
            >
              {step === "review" ? "Generate mock results" : "Save & continue"}
              <ArrowRight className="ml-1.5 size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Skip Confirmation Dialog */}
      <Dialog open={skipModalOpen} onOpenChange={setSkipModalOpen}>
        <DialogContent className="rounded-lg sm:max-w-md bg-white dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Skip this section?</DialogTitle>
            <DialogDescription className="mt-2 text-slate-600 dark:text-slate-300">
              You previously entered information for this section. Skipping it will keep your entered details, but mark the section as skipped and exclude it from current calculations until completed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setSkipModalOpen(false)}
            >
              Continue editing
            </Button>
            <Button
              variant="default"
              className="rounded-lg bg-amber-600 text-white hover:bg-amber-700"
              onClick={executeSkip}
            >
              Confirm & skip section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
