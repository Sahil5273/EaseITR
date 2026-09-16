"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Download,
  RotateCcw,
  ShieldAlert,
  X,
} from "lucide-react";
import { AppShell } from "./app-shell";
import { SummaryCard } from "./summary-card";
import { TaxComparisonCard } from "./tax-comparison-card";
import { UnsupportedCaseBanner, WarningBanner } from "./feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/domain/constants";
import type {
  ITRRecommendation,
  RegimeComparison,
  RuleExplanation,
} from "@/lib/domain/types";
import {
  mockITRRecommendationService,
  mockTaxCalculationService,
} from "@/lib/services/mocks/tax-services";
import { sampleProfiles } from "@/lib/services/mocks/seed-data";
import { useAssessment } from "@/lib/state/assessment-context";

import { WIZARD_STEPS } from "@/lib/domain/constants";

export function RuleExplanationList({ rules }: { rules: RuleExplanation[] }) {
  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="flex gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
        >
          {rule.outcome === "supports" ? (
            <Check className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : rule.outcome === "review" ? (
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
          ) : (
            <X className="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden="true" />
          )}
          <div>
            <p className="font-semibold">{rule.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {rule.explanation}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ITRRecommendationCard({
  recommendation,
}: {
  recommendation: ITRRecommendation;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-900 dark:bg-slate-900">
      <div className="bg-emerald-700 px-6 py-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-100">
              Potentially applicable form
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight">
              {recommendation.form}
            </p>
          </div>
          <Badge className="rounded-xl bg-white/15 text-white hover:bg-white/15">
            {recommendation.confidence === "professional-review"
              ? "Review required"
              : `${recommendation.confidence} confidence`}
          </Badge>
        </div>
      </div>
      <div className="p-6">
        <p className="text-lg font-semibold leading-8">
          {recommendation.summary}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          This is a rule-based sample recommendation, not a guarantee of legal
          eligibility.
        </p>
      </div>
    </article>
  );
}

export function ResultsClient() {
  const router = useRouter();
  const { data, clear } = useAssessment();
  const assessment =
    data.status === "not-started" ? sampleProfiles.trader : data;
  const [recommendation, setRecommendation] =
    useState<ITRRecommendation | null>(null);
  const [comparison, setComparison] = useState<RegimeComparison | null>(null);
  useEffect(() => {
    let active = true;
    void Promise.all([
      mockITRRecommendationService.recommend(assessment),
      mockTaxCalculationService.compareRegimes(assessment),
    ]).then(([nextRecommendation, nextComparison]) => {
      if (active) {
        setRecommendation(nextRecommendation);
        setComparison(nextComparison);
      }
    });
    return () => {
      active = false;
    };
  }, [assessment]);
  const missingSalary =
    assessment.incomeSources.includes("salary") &&
    assessment.salary.grossSalary <= 0;
  const unsupported =
    assessment.profile.residentialStatus !== "resident" ||
    assessment.profile.hasForeignAssets ||
    assessment.profile.hasForeignIncome;

  const skippedNames = (assessment.skippedSections || [])
    .map(
      (slug) =>
        WIZARD_STEPS.find((s) => s.slug === slug)?.label || slug,
    )
    .join(", ");

  return (
    <AppShell width="wide">
      <div className="print:max-w-none">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge variant="outline" className="rounded-xl">
              Sample assessment result
            </Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Your estimated tax summary
            </h1>
            <p className="mt-2 text-slate-500">
              Assessment year {assessment.profile.assessmentYear} · Generated
              from local prototype data
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
              <Download className="mr-1.5 size-4" aria-hidden="true" />
              Download / print summary
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/assessment/review">Edit information</Link>
            </Button>
          </div>
        </div>

        {assessment.skippedSections && assessment.skippedSections.length > 0 && (
          <div className="mt-5">
            <WarningBanner
              title={`${assessment.skippedSections.length} section${assessment.skippedSections.length > 1 ? "s" : ""} were skipped`}
            >
              Skipped: {skippedNames}. Skipping sections may reduce the accuracy of your tax calculation and ITR form recommendation.
            </WarningBanner>
          </div>
        )}
        <section className="mt-7 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          {recommendation ? (
            <ITRRecommendationCard recommendation={recommendation} />
          ) : (
            <Skeleton className="h-72 rounded-3xl" />
          )}
          <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold">Why this result appeared</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The frontend demonstration checked the following rule groups.
            </p>
            <div className="mt-5">
              {recommendation ? (
                <RuleExplanationList rules={recommendation.rules} />
              ) : (
                <Skeleton className="h-52 rounded-2xl" />
              )}
            </div>
          </article>
        </section>
        {recommendation?.requiresProfessionalReview && (
          <div className="mt-5">
            <UnsupportedCaseBanner>
              One or more answers indicate a complex or audit-sensitive
              situation. A qualified professional should review the final filing
              position.
            </UnsupportedCaseBanner>
          </div>
        )}
        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {comparison ? (
            <>
              <SummaryCard
                label="Estimated total income"
                value={formatINR(comparison.newRegime.totalIncome)}
              />
              <SummaryCard
                label="Estimated deductions"
                value={formatINR(comparison.newRegime.totalDeductions)}
              />
              <SummaryCard
                label="Estimated taxable income"
                value={formatINR(comparison.newRegime.taxableIncome)}
              />
              <SummaryCard
                label={
                  comparison.newRegime.isRefund
                    ? "Estimated refund"
                    : "Estimated amount payable"
                }
                value={formatINR(comparison.newRegime.balance)}
                tone={comparison.newRegime.isRefund ? "positive" : "warning"}
              />
            </>
          ) : (
            Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-32 rounded-2xl" />
            ))
          )}
        </section>
        <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          {comparison ? (
            <TaxComparisonCard comparison={comparison} />
          ) : (
            <Skeleton className="h-80 rounded-3xl" />
          )}
          <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold">Alternative forms</h2>
            <p className="mt-2 text-sm text-slate-500">
              Why other common individual forms were not selected by the sample
              rules.
            </p>
            <div className="mt-5 space-y-3">
              {recommendation?.alternatives.map((alternative) => (
                <div
                  key={alternative.form}
                  className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{alternative.form}</p>
                    <Badge variant="outline">Not selected</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {alternative.reason}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold">Income summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              {[
                [
                  "Salary & pension",
                  assessment.salary.grossSalary +
                    assessment.salary.pensionIncome,
                ],
                [
                  "Capital gains",
                  assessment.capitalGains.shortTermGains +
                    assessment.capitalGains.longTermGains,
                ],
                [
                  "Trading / business",
                  assessment.trading.profitOrLoss +
                    assessment.business.netProfit,
                ],
                [
                  "Other income",
                  Object.values(assessment.otherIncome).reduce(
                    (sum, value) => sum + value,
                    0,
                  ),
                ],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex justify-between border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800"
                >
                  <dt className="text-slate-500">{String(label)}</dt>
                  <dd className="font-semibold">{formatINR(Number(value))}</dd>
                </div>
              ))}
            </dl>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold">Information checks</h2>
            <div className="mt-5 space-y-3">
              {missingSalary && (
                <WarningBanner title="Missing salary amount">
                  Salary was selected but no gross salary was entered.
                </WarningBanner>
              )}
              {unsupported && (
                <UnsupportedCaseBanner>
                  Foreign or complex residency answers are not fully supported.
                </UnsupportedCaseBanner>
              )}
              {!missingSalary && !unsupported && (
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                  <Check className="size-5" />
                  No blocking sample-data warnings found.
                </div>
              )}
            </div>
          </article>
        </section>
        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          <Button
            asChild
            className="bg-emerald-700 text-white hover:bg-emerald-800"
          >
            <Link href="/assessment/review">
              Edit information <ArrowRight />
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              clear();
              router.push("/assessment");
            }}
          >
            <RotateCcw />
            Start over
          </Button>
        </div>
        <div className="mt-8 flex gap-3 rounded-2xl bg-slate-900 p-5 text-sm leading-6 text-slate-200 print:border print:bg-white print:text-black">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-400" />
          <p>
            EaseITR is an independent frontend prototype. This summary is not an
            official tax computation, return, legal opinion or professional
            advice.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
