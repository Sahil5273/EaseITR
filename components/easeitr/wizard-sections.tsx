"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { Edit3 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "./question-card";
import {
  CurrencyInput,
  MultiSelectIncome,
  YesNoSelector,
} from "./form-controls";
import { InfoNote, UnsupportedCaseBanner, WarningBanner } from "./feedback";
import type { AssessmentData } from "@/lib/domain/types";
import { WIZARD_STEPS, type WizardStepSlug } from "@/lib/domain/constants";
import { activitySchema, type ActivityFormValues } from "@/lib/domain/schemas";

export type AssessmentUpdater = (
  updater: (current: AssessmentData) => AssessmentData,
) => void;

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string | number;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <NativeSelect
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-xl"
      >
        {children}
      </NativeSelect>
    </div>
  );
}

export function ProfileSection({
  data,
  update,
}: {
  data: AssessmentData;
  update: AssessmentUpdater;
}) {
  const setProfile = <K extends keyof AssessmentData["profile"]>(
    key: K,
    value: AssessmentData["profile"][K],
  ) =>
    update((current) => ({
      ...current,
      status: "in-progress",
      profile: { ...current.profile, [key]: value },
    }));
  return (
    <div className="space-y-5">
      <QuestionCard
        title="Your tax profile"
        description="Start with the details that determine which questions and ITR forms are relevant."
        why="Residential status, age and taxpayer type can affect form eligibility and the rules used for an estimate."
      >
        <Grid>
          <SelectField
            label="Assessment year"
            value={data.profile.assessmentYear}
            onChange={(event) =>
              setProfile(
                "assessmentYear",
                event.target
                  .value as AssessmentData["profile"]["assessmentYear"],
              )
            }
          >
            <NativeSelectOption value="2026-27">2026–27</NativeSelectOption>
            <NativeSelectOption value="2025-26">2025–26</NativeSelectOption>
            <NativeSelectOption value="2024-25">2024–25</NativeSelectOption>
          </SelectField>
          <SelectField
            label="Taxpayer type"
            value={data.profile.taxpayerType}
            onChange={(event) =>
              setProfile(
                "taxpayerType",
                event.target.value as AssessmentData["profile"]["taxpayerType"],
              )
            }
          >
            <NativeSelectOption value="individual">
              Individual
            </NativeSelectOption>
            <NativeSelectOption value="huf">
              Hindu Undivided Family
            </NativeSelectOption>
          </SelectField>
          <SelectField
            label="Residential status"
            value={data.profile.residentialStatus}
            onChange={(event) =>
              setProfile(
                "residentialStatus",
                event.target
                  .value as AssessmentData["profile"]["residentialStatus"],
              )
            }
          >
            <NativeSelectOption value="resident">Resident</NativeSelectOption>
            <NativeSelectOption value="non-resident">
              Non-resident
            </NativeSelectOption>
            <NativeSelectOption value="not-ordinary-resident">
              Resident but not ordinarily resident
            </NativeSelectOption>
          </SelectField>
          <SelectField
            label="Age category"
            value={data.profile.ageCategory}
            onChange={(event) =>
              setProfile(
                "ageCategory",
                event.target.value as AssessmentData["profile"]["ageCategory"],
              )
            }
          >
            <NativeSelectOption value="below-60">Below 60</NativeSelectOption>
            <NativeSelectOption value="60-79">60 to 79</NativeSelectOption>
            <NativeSelectOption value="80-plus">80 or above</NativeSelectOption>
          </SelectField>
          <SelectField
            label="Employment status"
            value={data.profile.employmentStatus}
            onChange={(event) =>
              setProfile(
                "employmentStatus",
                event.target
                  .value as AssessmentData["profile"]["employmentStatus"],
              )
            }
          >
            <NativeSelectOption value="salaried">Salaried</NativeSelectOption>
            <NativeSelectOption value="self-employed">
              Self-employed
            </NativeSelectOption>
            <NativeSelectOption value="retired">Retired</NativeSelectOption>
            <NativeSelectOption value="other">Other</NativeSelectOption>
          </SelectField>
        </Grid>
        <div className="mt-7">
          <MultiSelectIncome
            value={data.incomeSources}
            onChange={(incomeSources) =>
              update((current) => ({ ...current, incomeSources }))
            }
          />
        </div>
      </QuestionCard>
      <QuestionCard
        title="Special situations"
        description="These answers can add disclosures or make a simple form ineligible."
        why="Director status, unlisted shares and foreign holdings often require a more detailed return or professional review."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <YesNoSelector
            label="Were you a company director?"
            value={data.profile.isCompanyDirector}
            onChange={(value) => setProfile("isCompanyDirector", value)}
          />
          <YesNoSelector
            label="Did you hold unlisted shares?"
            value={data.profile.heldUnlistedShares}
            onChange={(value) => setProfile("heldUnlistedShares", value)}
          />
          <YesNoSelector
            label="Do you own foreign assets?"
            value={data.profile.hasForeignAssets}
            onChange={(value) => setProfile("hasForeignAssets", value)}
          />
          <YesNoSelector
            label="Did you receive foreign income?"
            value={data.profile.hasForeignIncome}
            onChange={(value) => setProfile("hasForeignIncome", value)}
          />
        </div>
        {(data.profile.residentialStatus !== "resident" ||
          data.profile.hasForeignAssets ||
          data.profile.hasForeignIncome) && (
          <div className="mt-6">
            <UnsupportedCaseBanner>
              This prototype does not fully support non-resident filings,
              foreign assets or international taxation.
            </UnsupportedCaseBanner>
          </div>
        )}
      </QuestionCard>
    </div>
  );
}

export function SalarySection({
  data,
  update,
}: {
  data: AssessmentData;
  update: AssessmentUpdater;
}) {
  const setSalary = <K extends keyof AssessmentData["salary"]>(
    key: K,
    value: AssessmentData["salary"][K],
  ) =>
    update((current) => ({
      ...current,
      salary: { ...current.salary, [key]: value },
    }));
  return (
    <QuestionCard
      title="Salary and pension"
      description="Use annual amounts from your salary records or Form 16."
      why="Salary components and exemptions help build the income estimate. The standard deduction preview is illustrative only."
    >
      <Grid>
        <div className="space-y-2">
          <Label htmlFor="employers">Number of employers</Label>
          <Input
            id="employers"
            type="number"
            min={0}
            value={data.salary.employerCount}
            onChange={(event) =>
              setSalary("employerCount", Number(event.target.value))
            }
            className="h-11 rounded-xl"
          />
        </div>
        <CurrencyInput
          label="Gross salary"
          value={data.salary.grossSalary}
          onChange={(value) => setSalary("grossSalary", value)}
        />
        <CurrencyInput
          label="Allowances"
          value={data.salary.allowances}
          onChange={(value) => setSalary("allowances", value)}
        />
        <CurrencyInput
          label="Exempt income"
          value={data.salary.exemptIncome}
          onChange={(value) => setSalary("exemptIncome", value)}
        />
        <CurrencyInput
          label="Professional tax"
          value={data.salary.professionalTax}
          onChange={(value) => setSalary("professionalTax", value)}
        />
        <CurrencyInput
          label="Pension income"
          value={data.salary.pensionIncome}
          onChange={(value) => setSalary("pensionIncome", value)}
        />
      </Grid>
      <div className="mt-6 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/50">
        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
          Standard-deduction preview
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-300">
          ₹75,000
        </p>
        <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-300/80">
          Sample value for interface demonstration; actual eligibility depends
          on applicable law.
        </p>
      </div>
    </QuestionCard>
  );
}

export function PropertySection({
  data,
  update,
}: {
  data: AssessmentData;
  update: AssessmentUpdater;
}) {
  const setProperty = <K extends keyof AssessmentData["houseProperty"]>(
    key: K,
    value: AssessmentData["houseProperty"][K],
  ) =>
    update((current) => ({
      ...current,
      houseProperty: { ...current.houseProperty, [key]: value },
    }));
  return (
    <QuestionCard
      title="House property"
      description="Tell us about owned properties and any rent or home-loan interest."
      why="The use of a property and its financing affect how income or loss may be represented."
    >
      <Grid>
        <div className="space-y-2">
          <Label>Number of properties</Label>
          <Input
            type="number"
            min={0}
            value={data.houseProperty.propertyCount}
            onChange={(event) =>
              setProperty("propertyCount", Number(event.target.value))
            }
            className="h-11 rounded-xl"
          />
        </div>
        <SelectField
          label="How are they used?"
          value={data.houseProperty.occupancy}
          onChange={(event) =>
            setProperty(
              "occupancy",
              event.target
                .value as AssessmentData["houseProperty"]["occupancy"],
            )
          }
        >
          <NativeSelectOption value="self-occupied">
            Self-occupied
          </NativeSelectOption>
          <NativeSelectOption value="let-out">Let out</NativeSelectOption>
          <NativeSelectOption value="both">Both</NativeSelectOption>
        </SelectField>
        <CurrencyInput
          label="Rent received"
          value={data.houseProperty.rentReceived}
          onChange={(value) => setProperty("rentReceived", value)}
        />
        <CurrencyInput
          label="Municipal taxes paid"
          value={data.houseProperty.municipalTaxes}
          onChange={(value) => setProperty("municipalTaxes", value)}
        />
        <CurrencyInput
          label="Housing-loan interest"
          value={data.houseProperty.loanInterest}
          onChange={(value) => setProperty("loanInterest", value)}
        />
      </Grid>
    </QuestionCard>
  );
}

export function CapitalGainsSection({
  data,
  update,
}: {
  data: AssessmentData;
  update: AssessmentUpdater;
}) {
  const setGains = <K extends keyof AssessmentData["capitalGains"]>(
    key: K,
    value: AssessmentData["capitalGains"][K],
  ) =>
    update((current) => ({
      ...current,
      capitalGains: { ...current.capitalGains, [key]: value },
    }));
  return (
    <div className="space-y-5">
      <QuestionCard
        title="Assets sold during the year"
        description="Select every asset type you sold or redeemed."
        why="Different assets and holding periods can have different tax treatments."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <YesNoSelector
            label="Listed equity shares?"
            value={data.capitalGains.hasEquityShares}
            onChange={(value) => setGains("hasEquityShares", value)}
          />
          <YesNoSelector
            label="Equity mutual funds?"
            value={data.capitalGains.hasEquityMutualFunds}
            onChange={(value) => setGains("hasEquityMutualFunds", value)}
          />
          <YesNoSelector
            label="Land or property?"
            value={data.capitalGains.hasPropertySale}
            onChange={(value) => setGains("hasPropertySale", value)}
          />
          <YesNoSelector
            label="Other capital assets?"
            value={data.capitalGains.hasOtherAssets}
            onChange={(value) => setGains("hasOtherAssets", value)}
          />
        </div>
      </QuestionCard>
      <QuestionCard
        title="Gain and loss summary"
        description="Use a broker or transaction statement if available."
      >
        <Grid>
          <CurrencyInput
            label="Short-term gains"
            value={data.capitalGains.shortTermGains}
            onChange={(value) => setGains("shortTermGains", value)}
          />
          <CurrencyInput
            label="Long-term gains"
            value={data.capitalGains.longTermGains}
            onChange={(value) => setGains("longTermGains", value)}
          />
          <CurrencyInput
            label="Capital losses"
            value={data.capitalGains.capitalLosses}
            onChange={(value) => setGains("capitalLosses", value)}
          />
          <div className="space-y-2">
            <Label>Approximate transactions</Label>
            <Input
              type="number"
              min={0}
              value={data.capitalGains.transactionCount}
              onChange={(event) =>
                setGains("transactionCount", Number(event.target.value))
              }
              className="h-11 rounded-xl"
            />
          </div>
        </Grid>
      </QuestionCard>
    </div>
  );
}

export function TradingSection({
  data,
  update,
}: {
  data: AssessmentData;
  update: AssessmentUpdater;
}) {
  const setTrading = <K extends keyof AssessmentData["trading"]>(
    key: K,
    value: AssessmentData["trading"][K],
  ) =>
    update((current) => ({
      ...current,
      trading: { ...current.trading, [key]: value },
    }));
  const showBusinessFields =
    data.trading.intradayTrading || data.trading.futuresAndOptions;
  return (
    <div className="space-y-5">
      <QuestionCard
        title="Your trading activity"
        description="Delivery, intraday and derivatives can be treated differently."
        why="Intraday and F&O activity can point to business income and a different ITR form."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <YesNoSelector
            label="Delivery trading?"
            value={data.trading.deliveryTrading}
            onChange={(value) => setTrading("deliveryTrading", value)}
          />
          <YesNoSelector
            label="Intraday trading?"
            value={data.trading.intradayTrading}
            onChange={(value) => setTrading("intradayTrading", value)}
          />
          <YesNoSelector
            label="Futures & options?"
            value={data.trading.futuresAndOptions}
            onChange={(value) => setTrading("futuresAndOptions", value)}
          />
        </div>
      </QuestionCard>
      {showBusinessFields ? (
        <QuestionCard
          title="Trading business summary"
          description="Enter the turnover and net result from your broker’s P&L statement."
        >
          <Grid>
            <CurrencyInput
              label="Turnover"
              value={data.trading.turnover}
              onChange={(value) => setTrading("turnover", value)}
            />
            <CurrencyInput
              label="Profit or loss"
              value={data.trading.profitOrLoss}
              onChange={(value) => setTrading("profitOrLoss", value)}
            />
            <CurrencyInput
              label="Business expenses"
              value={data.trading.businessExpenses}
              onChange={(value) => setTrading("businessExpenses", value)}
            />
            <YesNoSelector
              label="Do you maintain books of account?"
              value={data.trading.maintainsBooks}
              onChange={(value) => setTrading("maintainsBooks", value)}
            />
          </Grid>
          <div className="mt-6">
            <WarningBanner title="Tax-audit check needed">
              This prototype does not determine audit applicability. Turnover,
              profit percentage and other conditions should be reviewed
              professionally.
            </WarningBanner>
          </div>
        </QuestionCard>
      ) : (
        <InfoNote>
          F&O and intraday turnover questions will appear when either activity
          is selected.
        </InfoNote>
      )}
    </div>
  );
}

export function BusinessSection({
  data,
  update,
}: {
  data: AssessmentData;
  update: AssessmentUpdater;
}) {
  const setBusiness = <K extends keyof AssessmentData["business"]>(
    key: K,
    value: AssessmentData["business"][K],
  ) =>
    update((current) => ({
      ...current,
      business: { ...current.business, [key]: value },
    }));
  const {
    register,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    mode: "onChange",
    defaultValues: { activityDescription: data.business.activityDescription },
  });
  const activityField = register("activityDescription", {
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      setBusiness("activityDescription", event.target.value),
  });
  return (
    <QuestionCard
      title="Business and professional income"
      description="Include freelance, consulting, professional or small-business receipts."
      why="Business type and the presumptive-taxation choice can change the form recommendation."
    >
      <Grid>
        <SelectField
          label="Nature of activity"
          value={data.business.activityType}
          onChange={(event) =>
            setBusiness(
              "activityType",
              event.target.value as AssessmentData["business"]["activityType"],
            )
          }
        >
          <NativeSelectOption value="none">
            No business activity
          </NativeSelectOption>
          <NativeSelectOption value="freelance">Freelance</NativeSelectOption>
          <NativeSelectOption value="professional">
            Specified profession
          </NativeSelectOption>
          <NativeSelectOption value="small-business">
            Small business
          </NativeSelectOption>
        </SelectField>
        <div className="space-y-2">
          <Label htmlFor="activity">Activity description</Label>
          <Input
            id="activity"
            {...activityField}
            placeholder="e.g. design consulting"
            className="h-11 rounded-xl"
            aria-invalid={Boolean(errors.activityDescription)}
            aria-describedby={
              errors.activityDescription ? "activity-error" : undefined
            }
          />
          {errors.activityDescription && (
            <p
              id="activity-error"
              role="alert"
              className="text-xs font-medium text-red-600"
            >
              {errors.activityDescription.message}
            </p>
          )}
        </div>
        <CurrencyInput
          label="Gross receipts"
          value={data.business.grossReceipts}
          onChange={(value) => setBusiness("grossReceipts", value)}
        />
        <CurrencyInput
          label="Net profit"
          value={data.business.netProfit}
          onChange={(value) => setBusiness("netProfit", value)}
        />
        <YesNoSelector
          label="Interested in presumptive taxation?"
          value={data.business.prefersPresumptive}
          onChange={(value) => setBusiness("prefersPresumptive", value)}
        />
        <YesNoSelector
          label="Basic sample eligibility checks met?"
          value={data.business.eligibleForPresumptive}
          onChange={(value) => setBusiness("eligibleForPresumptive", value)}
          description="This is not a legal eligibility decision."
        />
      </Grid>
    </QuestionCard>
  );
}

export function OtherIncomeSection({
  data,
  update,
}: {
  data: AssessmentData;
  update: AssessmentUpdater;
}) {
  const setOther = <K extends keyof AssessmentData["otherIncome"]>(
    key: K,
    value: number,
  ) =>
    update((current) => ({
      ...current,
      otherIncome: { ...current.otherIncome, [key]: value },
    }));
  return (
    <QuestionCard
      title="Interest and other income"
      description="Add annual amounts even if tax was already deducted."
      why="Other-source income contributes to total income and may include special-rate items."
    >
      <Grid>
        <CurrencyInput
          label="Savings-account interest"
          value={data.otherIncome.savingsInterest}
          onChange={(value) => setOther("savingsInterest", value)}
        />
        <CurrencyInput
          label="Fixed-deposit interest"
          value={data.otherIncome.fixedDepositInterest}
          onChange={(value) => setOther("fixedDepositInterest", value)}
        />
        <CurrencyInput
          label="Dividends"
          value={data.otherIncome.dividends}
          onChange={(value) => setOther("dividends", value)}
        />
        <CurrencyInput
          label="Family pension"
          value={data.otherIncome.familyPension}
          onChange={(value) => setOther("familyPension", value)}
        />
        <CurrencyInput
          label="Rental or miscellaneous income"
          value={data.otherIncome.miscellaneousIncome}
          onChange={(value) => setOther("miscellaneousIncome", value)}
        />
        <CurrencyInput
          label="Lottery or special-rate income"
          value={data.otherIncome.lotteryIncome}
          onChange={(value) => setOther("lotteryIncome", value)}
        />
      </Grid>
      {data.otherIncome.lotteryIncome > 0 && (
        <div className="mt-6">
          <WarningBanner title="Special-rate income reported">
            Lottery or similar income can have special tax treatment. This
            sample estimator does not calculate that treatment.
          </WarningBanner>
        </div>
      )}
    </QuestionCard>
  );
}

export function DeductionsSection({
  data,
  update,
}: {
  data: AssessmentData;
  update: AssessmentUpdater;
}) {
  const updateDeduction = (id: string, amount: number) =>
    update((current) => ({
      ...current,
      deductions: current.deductions.map((item) =>
        item.id === id ? { ...item, amount } : item,
      ),
    }));

  return (
    <QuestionCard
      title="Common deductions"
      description="Enter amounts paid or invested. Eligibility limits are not enforced in this prototype."
      why="Many deductions are available only under the old regime, so they help make the comparison meaningful."
    >
      <Grid>
        {data.deductions.map((item) => (
          <CurrencyInput
            key={item.id}
            label={`${item.section} — ${item.label}`}
            value={item.amount}
            onChange={(value) => updateDeduction(item.id, value)}
          />
        ))}
      </Grid>
    </QuestionCard>
  );
}

export function TaxPaymentsSection({
  data,
  update,
}: {
  data: AssessmentData;
  update: AssessmentUpdater;
}) {
  const setPayment = <K extends keyof AssessmentData["taxPayments"]>(
    key: K,
    value: number,
  ) =>
    update((current) => ({
      ...current,
      taxPayments: { ...current.taxPayments, [key]: value },
    }));

  return (
    <QuestionCard
      title="TDS, TCS & taxes already paid"
      description="These payments are offset against the sample tax estimate. Skipping tax payments may make the estimated payable amount or refund inaccurate."
    >
      <Grid>
        <CurrencyInput
          label="TDS"
          value={data.taxPayments.tds}
          onChange={(value) => setPayment("tds", value)}
        />
        <CurrencyInput
          label="TCS"
          value={data.taxPayments.tcs}
          onChange={(value) => setPayment("tcs", value)}
        />
        <CurrencyInput
          label="Advance tax"
          value={data.taxPayments.advanceTax}
          onChange={(value) => setPayment("advanceTax", value)}
        />
        <CurrencyInput
          label="Self-assessment tax"
          value={data.taxPayments.selfAssessmentTax}
          onChange={(value) => setPayment("selfAssessmentTax", value)}
        />
        <SelectField
          label="Regime preference"
          value={data.regimePreference}
          onChange={(event) =>
            update((current) => ({
              ...current,
              regimePreference: event.target
                .value as AssessmentData["regimePreference"],
            }))
          }
        >
          <NativeSelectOption value="undecided">
            Show me a comparison
          </NativeSelectOption>
          <NativeSelectOption value="new">New regime</NativeSelectOption>
          <NativeSelectOption value="old">Old regime</NativeSelectOption>
        </SelectField>
      </Grid>
    </QuestionCard>
  );
}

const reviewSections: Array<{
  slug: WizardStepSlug;
  label: string;
  description: (data: AssessmentData) => string;
}> = [
  {
    slug: "profile",
    label: "Basic profile",
    description: (data) =>
      `${data.profile.residentialStatus} · ${data.profile.ageCategory} · ${data.incomeSources.length} income sources`,
  },
  {
    slug: "salary",
    label: "Salary & pension",
    description: (data) =>
      `Gross salary ₹${data.salary.grossSalary.toLocaleString("en-IN")}`,
  },
  {
    slug: "property",
    label: "House property",
    description: (data) =>
      `${data.houseProperty.propertyCount} properties reported`,
  },
  {
    slug: "capital-gains",
    label: "Capital gains",
    description: (data) =>
      `${data.capitalGains.transactionCount} approximate transactions`,
  },
  {
    slug: "trading",
    label: "Trading activity",
    description: (data) =>
      data.trading.futuresAndOptions
        ? "F&O selected"
        : data.trading.intradayTrading
          ? "Intraday selected"
          : "No business trading selected",
  },
  {
    slug: "business",
    label: "Business & profession",
    description: (data) => data.business.activityType,
  },
  {
    slug: "other-income",
    label: "Other income",
    description: () => "Interest and other sources reviewed",
  },
  {
    slug: "deductions",
    label: "Deductions",
    description: (data) =>
      `${data.deductions.filter((d) => d.amount > 0).length} deduction amounts entered`,
  },
  {
    slug: "tax-payments",
    label: "TDS, TCS & taxes paid",
    description: (data) =>
      `TDS: ₹${data.taxPayments.tds.toLocaleString("en-IN")} · ${data.regimePreference} regime preference`,
  },
];

export function ReviewSection({
  data,
  update,
}: {
  data: AssessmentData;
  update: AssessmentUpdater;
}) {
  const unsupported =
    data.profile.residentialStatus !== "resident" ||
    data.profile.hasForeignAssets ||
    data.profile.hasForeignIncome;
  const missing =
    data.incomeSources.includes("salary") && data.salary.grossSalary <= 0;

  const skippedNames = (data.skippedSections || [])
    .map(
      (slug) =>
        WIZARD_STEPS.find((s) => s.slug === slug)?.label || slug,
    )
    .join(", ");

  return (
    <div className="space-y-5">
      <QuestionCard
        title="Review your assessment"
        description="Check the summary and edit any section before generating sample results."
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {reviewSections.map((section) => {
            const isSkipped = data.skippedSections?.includes(section.slug);
            return (
              <div
                key={section.slug}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{section.label}</p>
                    {isSkipped && (
                      <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        Skipped
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm capitalize text-slate-500">
                    {isSkipped ? "Section skipped by user" : section.description(data)}
                  </p>
                </div>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/assessment/${section.slug}`}>
                    <Edit3 className="size-4 mr-1.5" aria-hidden="true" />
                    Edit
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </QuestionCard>
      {data.skippedSections && data.skippedSections.length > 0 && (
        <WarningBanner
          title={`${data.skippedSections.length} section${data.skippedSections.length > 1 ? "s" : ""} intentionally skipped`}
        >
          Skipped: {skippedNames}. Skipping sections may reduce the accuracy of your tax calculation and ITR form recommendation.
        </WarningBanner>
      )}
      {data.reviewFlags.length > 0 && (
        <WarningBanner
          title={`${data.reviewFlags.length} section${data.reviewFlags.length > 1 ? "s" : ""} marked for review`}
        >
          Revisit: {data.reviewFlags.join(", ")}.
        </WarningBanner>
      )}
      {missing && (
        <WarningBanner title="Missing salary amount">
          You selected salary income but have not entered a gross salary.
        </WarningBanner>
      )}
      {unsupported && (
        <UnsupportedCaseBanner>
          One or more profile answers are outside the prototype’s supported
          scope. You can still view the demonstration results, but professional
          review is recommended.
        </UnsupportedCaseBanner>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={data.confirmed}
            onCheckedChange={(checked) =>
              update((current) => ({ ...current, confirmed: checked === true }))
            }
            aria-describedby="confirm-copy"
          />
          <span>
            <span className="font-semibold">I have reviewed this summary</span>
            <span
              id="confirm-copy"
              className="mt-1 block text-sm leading-6 text-slate-500"
            >
              I understand these are sample estimates and recommendations, not a
              filed return or professional advice.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}

export function ActiveWizardSection({
  step,
  data,
  update,
}: {
  step: WizardStepSlug;
  data: AssessmentData;
  update: AssessmentUpdater;
}) {
  switch (step) {
    case "profile":
      return <ProfileSection data={data} update={update} />;
    case "salary":
      return <SalarySection data={data} update={update} />;
    case "property":
      return <PropertySection data={data} update={update} />;
    case "capital-gains":
      return <CapitalGainsSection data={data} update={update} />;
    case "trading":
      return <TradingSection data={data} update={update} />;
    case "business":
      return <BusinessSection data={data} update={update} />;
    case "other-income":
      return <OtherIncomeSection data={data} update={update} />;
    case "deductions":
      return <DeductionsSection data={data} update={update} />;
    case "tax-payments":
      return <TaxPaymentsSection data={data} update={update} />;
    case "review":
      return <ReviewSection data={data} update={update} />;
  }
}
