"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/domain/constants";
import {
  advanceTaxSchedule,
  caLockReason,
  caQuestions,
  documentNeeds,
  requiresCaReview,
  resolveMismatch,
  selfFileBlockers,
  statementMismatches,
  with80cAmount,
} from "@/lib/domain/filing";
import type { AssessmentData, MismatchResolution } from "@/lib/domain/types";
import { compareSampleRegimes } from "@/lib/services/mocks/tax-services";
import { useAssessment } from "@/lib/state/assessment-context";
import { InfoNote, WarningBanner } from "./feedback";

export function FilingModeBar() {
  const { data, update } = useAssessment();
  const locked = requiresCaReview(data);
  const reason = caLockReason(data);
  const choose = (mode: AssessmentData["filingMode"]) =>
    update((current) => ({
      ...current,
      filingMode: mode,
      status: current.status === "not-started" ? "in-progress" : current.status,
    }));

  return (
    <div className="border-b border-border bg-card/75 backdrop-blur dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <p className="text-base font-semibold">How will you use this assessment?</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={data.filingMode === "ca-pack" ? "default" : "outline"}
            className="rounded-xl"
            aria-pressed={data.filingMode === "ca-pack"}
            onClick={() => choose("ca-pack")}
          >
            Prepare for a CA
          </Button>
          <Button
            type="button"
            size="sm"
            variant={data.filingMode === "self-file" ? "default" : "outline"}
            className="rounded-xl"
            aria-pressed={data.filingMode === "self-file"}
            disabled={locked}
            onClick={() => choose("self-file")}
          >
            {locked && <LockKeyhole className="size-4" aria-hidden="true" />}
            File it yourself
          </Button>
        </div>
        {reason ? (
          <p className="text-base leading-7 text-amber-800 dark:text-amber-200">{reason}</p>
        ) : (
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            {data.filingMode === "self-file"
              ? "The self-file checklist stays closed until documents and mismatches are resolved."
              : "The CA pack collects income, documents, mismatches, and questions."}
          </p>
        )}
      </div>
    </div>
  );
}

export function DocumentChecklist({ data }: { data: AssessmentData }) {
  const needs = documentNeeds(data);
  if (needs.length === 0) {
    return (
      <InfoNote>
        No extra documents are expected from the income sources selected so far.
      </InfoNote>
    );
  }
  return (
    <ul className="space-y-3">
      {needs.map((need) => (
        <li
          key={need.type}
          className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
        >
          <div>
            <p className="font-semibold">{need.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{need.reason}</p>
          </div>
          <Badge variant="outline" className="rounded-full capitalize">
            {need.state}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export function MismatchList({ data }: { data: AssessmentData }) {
  const { update } = useAssessment();
  const rows = statementMismatches(data);
  if (rows.length === 0) {
    return (
      <InfoNote>
        Accepted statement figures match the amounts in this assessment, or no
        comparable statement has been added yet.
      </InfoNote>
    );
  }
  const choose = (id: string, resolution: MismatchResolution) =>
    update((current) => resolveMismatch(current, id, resolution));
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <article
          key={row.id}
          className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{row.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {row.documentName}: {formatINR(row.documentAmount)} · entered{" "}
                {formatINR(row.enteredAmount)}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full capitalize">
              {row.resolution.replaceAll("-", " ")}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => choose(row.id, "use-document")}>
              Use statement
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => choose(row.id, "keep-entered")}>
              Keep entered
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => choose(row.id, "left-for-ca")}>
              Leave for CA
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

export function SampleWorking({ data }: { data: AssessmentData }) {
  const comparison = useMemo(() => compareSampleRegimes(data), [data]);
  const hidden = requiresCaReview(data);
  if (hidden) {
    return (
      <WarningBanner title="Sample tax figure hidden">
        This case is on the CA path. The pack below is the output. Phase 2
        replaces this sample formula with assessment-year slabs.
      </WarningBanner>
    );
  }
  const regime = comparison.suggestedRegime;
  const estimate = regime === "old" ? comparison.oldRegime : comparison.newRegime;
  const lines = [
    ["Income heads added", estimate.totalIncome],
    ["Deductions in this sample", estimate.totalDeductions],
    ["Taxable income", estimate.taxableIncome],
    ["Sample tax", estimate.estimatedTax],
    ["Taxes already entered", estimate.taxesPaid],
    [estimate.isRefund ? "Sample refund" : "Sample payable", estimate.balance],
  ] as const;
  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Sample working</CardTitle>
        <CardDescription>
          {regime === "old" ? "Old" : "New"} regime sample, using one flat rate
          above a single threshold. This is not a slab computation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-sm">
          {lines.map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800"
            >
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-semibold">{formatINR(value)}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

export function RegimeWhatIf({ data }: { data: AssessmentData }) {
  const current =
    data.deductions.find((item) => item.section === "80C")?.amount ?? 0;
  const [amount, setAmount] = useState(current);
  const comparison = compareSampleRegimes(with80cAmount(data, amount));
  if (requiresCaReview(data)) return null;
  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Regime what-if</CardTitle>
        <CardDescription>
          80C is counted only in the old-regime sample. The new-regime sample
          ignores it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block text-sm font-semibold" htmlFor="what-if-80c">
          Try 80C at
        </label>
        <Input
          id="what-if-80c"
          inputMode="numeric"
          value={amount || ""}
          onChange={(event) =>
            setAmount(Number(event.target.value.replace(/\D/g, "")) || 0)
          }
          className="h-11 max-w-xs rounded-xl"
        />
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          At {formatINR(amount)} of 80C, the sample prefers the{" "}
          <strong>{comparison.suggestedRegime}</strong> regime by{" "}
          {formatINR(comparison.difference)}. Old-regime sample tax{" "}
          {formatINR(comparison.oldRegime.estimatedTax)}. New-regime sample tax{" "}
          {formatINR(comparison.newRegime.estimatedTax)}.
        </p>
      </CardContent>
    </Card>
  );
}

export function AdvanceTaxPanel({ data }: { data: AssessmentData }) {
  if (requiresCaReview(data)) return null;
  const comparison = compareSampleRegimes(data);
  const estimate =
    comparison.suggestedRegime === "old"
      ? comparison.oldRegime
      : comparison.newRegime;
  const schedule = advanceTaxSchedule(
    estimate.estimatedTax,
    data.taxPayments.tds + data.taxPayments.tcs,
  );
  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Advance-tax dates</CardTitle>
        <CardDescription>
          Sample instalments on the {comparison.suggestedRegime} regime after
          TDS and TCS. Salary fully covered by TDS often has nothing due here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {schedule.due === 0 ? (
          <InfoNote>
            TDS and TCS already cover this sample tax, so no instalment is
            shown.
          </InfoNote>
        ) : (
          <ul className="space-y-3 text-sm">
            {schedule.instalments.map((item) => (
              <li key={item.label} className="flex justify-between gap-4">
                <span>{item.label}</span>
                <span className="font-semibold">
                  {formatINR(item.instalment)} · cumulative {formatINR(item.cumulative)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function CaPack({ data }: { data: AssessmentData }) {
  const questions = caQuestions(data);
  const imported = data.importedFields;
  return (
    <section id="ca-pack" className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">CA pack</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Assessment year {data.profile.assessmentYear} ·{" "}
          {data.profile.residentialStatus} · {data.profile.ageCategory}. This
          pack is a preparation file, not a filed return.
        </p>
      </div>
      <Card className="rounded-3xl border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Income entered</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            {[
              ["Salary", data.salary.grossSalary],
              ["Pension", data.salary.pensionIncome],
              ["House property rent", data.houseProperty.rentReceived],
              ["Home-loan interest", data.houseProperty.loanInterest],
              ["Short-term gains", data.capitalGains.shortTermGains],
              ["Long-term gains", data.capitalGains.longTermGains],
              ["Trading result", data.trading.profitOrLoss],
              ["Business profit", data.business.netProfit],
              [
                "Other income",
                Object.values(data.otherIncome).reduce((sum, value) => sum + value, 0),
              ],
              ["TDS", data.taxPayments.tds],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between gap-4">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-semibold">{formatINR(Number(value))}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <div>
        <h3 className="text-lg font-bold">Documents</h3>
        <div className="mt-3">
          <DocumentChecklist data={data} />
        </div>
      </div>
      {imported.length > 0 && (
        <div>
          <h3 className="text-lg font-bold">Figures taken from statements</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {imported.map((field) => (
              <li key={`${field.documentType}-${field.fieldId}`}>
                {field.label}: {formatINR(field.amount)} from {field.documentName}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h3 className="text-lg font-bold">Open comparisons</h3>
        <div className="mt-3">
          <MismatchList data={data} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold">Questions for the CA</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
          {questions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SelfFileGate({ data }: { data: AssessmentData }) {
  const { update } = useAssessment();
  if (data.filingMode !== "self-file") {
    return (
      <InfoNote>
        Switch to “File it yourself” when you want the ready checklist.
        The CA pack remains available either way. Filing itself stays on the
        Income Tax portal.
      </InfoNote>
    );
  }
  const blockers = selfFileBlockers(data);
  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Self-file checklist</CardTitle>
        <CardDescription>
          Ready means the sample file is internally consistent. It does not
          submit a return.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {blockers.length > 0 ? (
          <ul className="space-y-2 text-sm leading-6">
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            <Check className="size-4" aria-hidden="true" />
            Documents, mismatches, and the review step are clear.
          </p>
        )}
        <Button
          type="button"
          disabled={blockers.length > 0}
          className="rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"
          onClick={() =>
            update((current) => ({ ...current, selfFileReady: true }))
          }
        >
          {data.selfFileReady ? "Marked ready" : "Mark ready to file yourself"}
        </Button>
        <p className="text-sm leading-6 text-slate-500">
          Submit on the{" "}
          <Link
            href="https://www.incometax.gov.in/"
            className="font-semibold text-emerald-800 underline dark:text-emerald-300"
            target="_blank"
            rel="noreferrer"
          >
            Income Tax portal
          </Link>
          . EaseITR does not log in or file for you.
        </p>
      </CardContent>
    </Card>
  );
}
