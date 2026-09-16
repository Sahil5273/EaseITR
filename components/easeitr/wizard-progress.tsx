"use client";

import Link from "next/link";
import { Check, Forward } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { WIZARD_STEPS, type WizardStepSlug } from "@/lib/domain/constants";
import { useAssessment } from "@/lib/state/assessment-context";
import { cn } from "@/lib/utils";

export function ProgressSidebar({ current }: { current: WizardStepSlug }) {
  const { data } = useAssessment();
  const currentIndex = WIZARD_STEPS.findIndex((step) => step.slug === current);

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Assessment progress
        </p>
        <nav aria-label="Assessment steps" className="space-y-1">
          {WIZARD_STEPS.map((step, index) => {
            const isSkipped = data.skippedSections?.includes(step.slug);
            const status =
              data.sectionStatuses?.[step.slug] ||
              (isSkipped
                ? "skipped"
                : index < currentIndex
                ? "completed"
                : step.slug === current
                ? "in-progress"
                : "not-started");
            const isCurrent = step.slug === current;

            return (
              <Link
                key={step.slug}
                href={`/assessment/${step.slug}`}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors",
                  isCurrent
                    ? "bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-md border text-xs font-semibold",
                      status === "completed"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : status === "skipped"
                        ? "border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                        : "border-slate-300 dark:border-slate-600",
                    )}
                  >
                    {status === "completed" ? (
                      <Check className="size-3" aria-hidden="true" />
                    ) : status === "skipped" ? (
                      <Forward className="size-3" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="truncate">{step.shortLabel}</span>
                </div>
                {status === "skipped" && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Skipped
                  </Badge>
                )}
                {status === "completed" && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Done</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function WizardProgressBar({ current }: { current: WizardStepSlug }) {
  const { data } = useAssessment();
  const index = WIZARD_STEPS.findIndex((step) => step.slug === current);
  const percent = ((index + 1) / WIZARD_STEPS.length) * 100;
  const isSkipped = data.skippedSections?.includes(current);

  return (
    <div className="mb-6 lg:hidden">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold flex items-center gap-2">
          {WIZARD_STEPS[index].label}
          {isSkipped && (
            <Badge variant="outline" className="text-xs border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950">
              Skipped
            </Badge>
          )}
        </span>
        <span className="text-slate-500 text-xs">
          Step {index + 1} of {WIZARD_STEPS.length}
        </span>
      </div>
      <Progress value={percent} className="h-2 rounded-xl" />
    </div>
  );
}
