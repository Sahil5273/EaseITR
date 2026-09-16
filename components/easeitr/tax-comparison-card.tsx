import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/domain/constants";
import type { RegimeComparison } from "@/lib/domain/types";

export function TaxComparisonCard({
  comparison,
}: {
  comparison: RegimeComparison;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Estimated comparison
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Old vs new tax regime</h2>
        </div>
        <Badge className="rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="mr-1 size-3.5" />
          {comparison.suggestedRegime === "new" ? "New" : "Old"} appears lower
        </Badge>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 dark:border-slate-800 dark:bg-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Old regime
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatINR(comparison.oldRegime.estimatedTax)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Estimated liability</p>
        </div>
        <ArrowRight className="mx-auto hidden size-5 text-slate-400 sm:block" />
        <div className="rounded-lg bg-emerald-50/70 border border-emerald-100 p-4 dark:border-emerald-900 dark:bg-emerald-950/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            New regime
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatINR(comparison.newRegime.estimatedTax)}
          </p>
          <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-300/80">
            Estimated liability
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
        Illustrative comparison only. Special-rate income and several detailed
        tax rules are not included.
      </p>
    </article>
  );
}
