"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  IndianRupee,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AppShell } from "./app-shell";
import { SummaryCard } from "./summary-card";
import { TaxComparisonCard } from "./tax-comparison-card";
import { WarningBanner } from "./feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/domain/constants";
import type { RegimeComparison } from "@/lib/domain/types";
import { mockTaxCalculationService } from "@/lib/services/mocks/tax-services";
import { sampleProfiles } from "@/lib/services/mocks/seed-data";
import { useAssessment } from "@/lib/state/assessment-context";

const chartColors = ["#059669", "#0f766e", "#334155", "#d97706", "#0284c7"];

export function DashboardClient() {
  const { data } = useAssessment();
  const assessment =
    data.status === "not-started" ? sampleProfiles.investor : data;
  const [comparison, setComparison] = useState<RegimeComparison | null>(null);
  useEffect(() => {
    let active = true;
    void mockTaxCalculationService.compareRegimes(assessment).then((value) => {
      if (active) setComparison(value);
    });
    return () => {
      active = false;
    };
  }, [assessment]);
  const chartData = useMemo(
    () =>
      [
        { name: "Salary", value: assessment.salary.grossSalary },
        {
          name: "Capital gains",
          value:
            assessment.capitalGains.shortTermGains +
            assessment.capitalGains.longTermGains,
        },
        {
          name: "Trading / business",
          value:
            assessment.trading.profitOrLoss + assessment.business.netProfit,
        },
        { name: "Property", value: assessment.houseProperty.rentReceived },
        {
          name: "Other",
          value: Object.values(assessment.otherIncome).reduce(
            (sum, value) => sum + value,
            0,
          ),
        },
      ].filter((item) => item.value > 0),
    [assessment],
  );
  const estimate = comparison?.newRegime;
  const progress =
    assessment.status === "complete"
      ? 100
      : assessment.status === "review"
        ? 88
        : assessment.status === "not-started"
          ? 0
          : 56;

  return (
    <AppShell width="wide">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="outline" className="rounded-md border-slate-300 dark:border-slate-700">
            Sample workspace
          </Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white sm:text-4xl">
            Good evening, Sample Taxpayer
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Here’s your estimated position for assessment year{" "}
            {assessment.profile.assessmentYear}.
          </p>
        </div>
        <Button
          asChild
          className="rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
        >
          <Link href={`/assessment/${assessment.currentStep || "profile"}`}>
            Continue assessment <ArrowRight />
          </Link>
        </Button>
      </div>
      <section className="mt-7 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Assessment completion</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {progress}% complete · answers saved on this device
            </p>
          </div>
          <Badge className="rounded-md bg-amber-100 text-amber-900 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-200">
            {assessment.status === "review"
              ? "Ready for review"
              : "In progress"}
          </Badge>
        </div>
        <Progress value={progress} className="mt-4 h-2 rounded-md bg-slate-100 dark:bg-slate-800" />
      </section>
      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {estimate ? (
          <>
            <SummaryCard
              label="Sample total income"
              value={formatINR(estimate.totalIncome)}
              note="Based on entered sample amounts"
              icon={WalletCards}
            />
            <SummaryCard
              label="Estimated deductions"
              value={formatINR(estimate.totalDeductions)}
              note="New-regime preview"
              icon={ReceiptText}
            />
            <SummaryCard
              label="Estimated taxable income"
              value={formatINR(estimate.taxableIncome)}
              icon={TrendingUp}
            />
            <SummaryCard
              label="Estimated tax liability"
              value={formatINR(estimate.estimatedTax)}
              note="Not a filing calculation"
              icon={IndianRupee}
              tone="warning"
            />
          </>
        ) : (
          Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-36 rounded-lg" />
          ))
        )}
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        {comparison ? (
          <TaxComparisonCard comparison={comparison} />
        ) : (
          <Skeleton className="h-80 rounded-lg" />
        )}
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Sample breakdown
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Income sources</h2>
            </div>
            <Badge variant="outline" className="rounded-md">Estimated</Badge>
          </div>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(130px,0.8fr)] items-center gap-2">
            <div className="h-48">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={192}
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                  >
                    {chartData.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatINR(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      backgroundColor: chartColors[index % chartColors.length],
                    }}
                  />
                  <span className="min-w-0 flex-1 text-slate-600 dark:text-slate-400">
                    {item.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatINR(item.value, true)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Taxes paid</h2>
            <CheckCircle2 className="size-5 text-emerald-600" />
          </div>
          <p className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
            {formatINR(estimate?.taxesPaid ?? 0)}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sample TDS and advance tax
          </p>
          <div className="mt-5 rounded-md bg-slate-50 border border-slate-100 p-3 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {estimate?.isRefund
              ? "Estimated refund"
              : "Estimated amount payable"}
            : <strong>{formatINR(estimate?.balance ?? 0)}</strong>
          </div>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-bold text-slate-900 dark:text-white">Recent documents</h2>
          <div className="mt-4 space-y-3">
            {[
              ["Form 16 – sample.pdf", "Extraction complete"],
              ["Broker statement.pdf", "Needs verification"],
            ].map(([name, state]) => (
              <div
                key={name}
                className="flex gap-3 rounded-md bg-slate-50 border border-slate-100 p-3 dark:border-slate-800 dark:bg-slate-800"
              >
                <FileText className="size-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{name}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{state}</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            asChild
            variant="ghost"
            className="mt-3 px-0 text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
          >
            <Link href="/documents">
              Open document centre <ArrowRight />
            </Link>
          </Button>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-bold text-slate-900 dark:text-white">Outstanding actions</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3 text-slate-700 dark:text-slate-300">
              <CircleAlert className="size-5 text-amber-600 shrink-0" />
              <span>Verify TDS extracted from Form 16</span>
            </li>
            <li className="flex gap-3 text-slate-700 dark:text-slate-300">
              <Clock3 className="size-5 text-slate-400 shrink-0" />
              <span>Confirm capital-gain transaction count</span>
            </li>
            <li className="flex gap-3 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <span>Profile section completed</span>
            </li>
          </ul>
        </article>
      </section>
      <div className="mt-5">
        <WarningBanner title="Sample estimates only">
          This dashboard is a frontend demonstration. It does not include
          complete tax law, official data or a filing connection.
        </WarningBanner>
      </div>
    </AppShell>
  );
}
