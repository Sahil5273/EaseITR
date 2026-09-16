import Link from "next/link";
import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { WIZARD_STEPS, type WizardStepSlug } from "@/lib/domain/constants";
import { cn } from "@/lib/utils";

export function ProgressSidebar({ current }: { current: WizardStepSlug }) {
  const currentIndex = WIZARD_STEPS.findIndex((step) => step.slug === current);
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Assessment progress
        </p>
        <nav aria-label="Assessment steps" className="space-y-1">
          {WIZARD_STEPS.map((step, index) => (
            <Link
              key={step.slug}
              href={`/assessment/${step.slug}`}
              aria-current={step.slug === current ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                step.slug === current
                  ? "bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800",
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full border text-xs",
                  index < currentIndex
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 dark:border-slate-600",
                )}
              >
                {index < currentIndex ? (
                  <Check className="size-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              {step.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export function WizardProgressBar({ current }: { current: WizardStepSlug }) {
  const index = WIZARD_STEPS.findIndex((step) => step.slug === current);
  const percent = ((index + 1) / WIZARD_STEPS.length) * 100;
  return (
    <div className="mb-6 lg:hidden">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold">{WIZARD_STEPS[index].label}</span>
        <span className="text-slate-500">
          Step {index + 1} of {WIZARD_STEPS.length}
        </span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}
