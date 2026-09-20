import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { formatINR } from "@/lib/domain/constants";
import type { RegimeComparison } from "@/lib/domain/types";

export function TaxComparisonCard({
  comparison,
}: {
  comparison: RegimeComparison;
}) {
  const isNewSuggested = comparison.suggestedRegime === "new";

  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Estimated comparison
          </p>
          <h2 className="mt-1 text-xl font-bold">Old vs new tax regime</h2>
        </div>
        <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="mr-1 size-3.5" />
          {isNewSuggested ? "New" : "Old"} regime lower
        </Badge>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="relative overflow-hidden rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
          {!isNewSuggested && <BorderBeam size={120} duration={8} />}
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Old regime
          </p>
          <p className="mt-2 text-2xl font-bold">
            {formatINR(comparison.oldRegime.estimatedTax)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Estimated liability</p>
        </div>
        <ArrowRight className="mx-auto hidden size-5 text-slate-400 sm:block" />
        <div className="relative overflow-hidden rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200/60 dark:bg-emerald-950/50 dark:border-emerald-800/60">
          {isNewSuggested && <BorderBeam size={140} duration={8} colorFrom="#10b981" colorTo="#059669" />}
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            New regime
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-950 dark:text-emerald-100">
            {formatINR(comparison.newRegime.estimatedTax)}
          </p>
          <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-300/80">
            Estimated liability
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Illustrative comparison only. Special-rate income and several detailed
        tax rules are not included.
      </p>
    </article>
  );
}
