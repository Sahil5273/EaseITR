"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { AppShell } from "./app-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const guides = [
  [
    "Financial year vs assessment year",
    "The financial year is when income is earned. The following assessment year is when that income is assessed and the return is generally filed.",
  ],
  [
    "ITR-1, ITR-2, ITR-3 and ITR-4",
    "These forms cover different combinations of income and eligibility conditions. The correct choice depends on more than income level alone.",
  ],
  [
    "Salary income",
    "Salary reporting can include gross salary, allowances, exempt components, professional tax, pension and tax deducted by the employer.",
  ],
  [
    "Capital gains",
    "Selling shares, mutual funds, property or other capital assets may create short-term or long-term gains or losses.",
  ],
  [
    "Intraday trading",
    "Intraday equity activity is commonly considered speculative business activity and may require business-income reporting.",
  ],
  [
    "Futures and options",
    "F&O results are commonly treated as non-speculative business income. Turnover and audit considerations can require careful calculation.",
  ],
  [
    "Presumptive taxation",
    "Eligible businesses or professionals may be able to report income using a prescribed percentage instead of detailed expense accounts.",
  ],
  [
    "Old and new tax regimes",
    "The regimes use different rates and deduction rules. A lower result depends on your income mix and eligible deductions.",
  ],
  [
    "TDS and advance tax",
    "TDS is tax deducted before payment. Advance tax is paid during the year when expected tax exceeds applicable thresholds.",
  ],
  [
    "When professional help may be needed",
    "Foreign assets, non-resident status, tax audits, carried-forward losses and complex transactions often benefit from professional review.",
  ],
] as const;

export function HelpClient() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      guides.filter(([title, copy]) =>
        `${title} ${copy}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <AppShell width="wide">
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="outline" className="rounded-full">
          Education library
        </Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          Tax concepts in plain language
        </h1>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Short, prototype explanations to help you understand the questions.
          Content requires review by a qualified tax professional.
        </p>
        <div className="relative mx-auto mt-6 max-w-xl">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search capital gains, TDS, regimes…"
            className="h-12 rounded-2xl bg-white pl-12 dark:bg-slate-900"
            aria-label="Search tax guides"
          />
        </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(([title, copy]) => (
          <article
            key={title}
            className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <BookOpen className="size-5" />
              </span>
              <Badge variant="outline" className="text-[11px]">
                Legal review needed
              </Badge>
            </div>
            <h2 className="mt-6 text-lg font-bold tracking-tight">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">{copy}</p>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <Empty className="mt-10 rounded-3xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No matching guides</EmptyTitle>
            <EmptyDescription>
              Try a broader phrase such as “income” or “tax”.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </AppShell>
  );
}
