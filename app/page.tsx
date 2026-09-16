"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  FileSearch,
  FileText,
  HelpCircle,
  Home,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShellHeader } from "@/components/easeitr/app-shell";
import { Brand } from "@/components/easeitr/brand";

const incomeTypes = [
  { icon: WalletCards, label: "Salary & pension" },
  { icon: Landmark, label: "Bank interest" },
  { icon: Home, label: "House property" },
  { icon: TrendingUp, label: "Capital gains" },
  { icon: BarChart3, label: "Trading income" },
  { icon: Building2, label: "Business & freelance" },
];

const faqs = [
  {
    question: "Does EaseITR file my tax return?",
    answer:
      "No. This prototype helps you organise information, see sample estimates and understand which ITR form may apply. It does not submit anything to the Income Tax Department.",
  },
  {
    question: "Are the tax calculations final?",
    answer:
      "No. All calculations and recommendations shown here are estimates for demonstration. Your filing may need professional review, especially for complex income or residency situations.",
  },
  {
    question: "Where is my information saved?",
    answer:
      "In this frontend prototype, assessment answers are stored only in your browser when you choose to save. You can clear them at any time from Settings.",
  },
  {
    question: "Can I upload Form 16 or broker statements?",
    answer:
      "The document centre demonstrates that future workflow with sample extraction states. No real OCR or AI document processing is performed in this phase.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AppShellHeader />

      <section className="relative border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.03fr_0.97fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-6 rounded-md border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800 font-medium dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
            >
              <Sparkles className="mr-1.5 size-3.5" aria-hidden="true" /> Independent
              tax-assistance prototype
            </Badge>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-[-0.045em] text-slate-950 dark:text-white sm:text-5xl lg:text-[3.65rem]">
              EaseITR guides individual taxpayers through income details, tax estimates, regime comparison, document extraction, and ITR form recommendations.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Answer plain-language questions, understand your income picture, estimate tax liability, compare tax regimes, assist with document extraction, and see which ITR form may apply—without tax jargon.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-lg bg-emerald-700 px-6 text-base text-white hover:bg-emerald-800"
              >
                <Link href="/assessment">
                  Start tax assessment <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 rounded-lg px-6 text-base"
              >
                <Link href="/dashboard">Explore sample dashboard</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <Check className="size-4 text-emerald-600" aria-hidden="true" /> No sign-up needed
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-4 text-emerald-600" aria-hidden="true" /> Save on this device
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-4 text-emerald-600" aria-hidden="true" /> Clear explanations
              </span>
            </div>
          </div>

          <div
            className="relative mx-auto w-full max-w-xl"
            aria-label="Sample assessment summary preview"
          >
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Sample overview
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    Assessment year 2026–27
                  </p>
                </div>
                <Badge className="rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                  70% complete
                </Badge>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      Your progress
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">7 of 10 steps</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                    <div className="h-full w-[70%] rounded-md bg-emerald-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/70">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Estimated income
                    </p>
                    <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      ₹12,84,000
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/70">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Potential form
                    </p>
                    <p className="mt-1 text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                      ITR-2
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <FileText className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">Why ITR-2 may apply</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        You reported salary income and capital gains, with no business income.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <HelpCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> Estimates are for guidance only and are not a filed tax return.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">A clearer process</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
            From scattered details to a useful next step
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            We break the assessment into 10 manageable sections and explain what each answer changes.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [
              "01",
              "Tell us about your income",
              "Work through short focused steps, with help beside unfamiliar questions.",
            ],
            [
              "02",
              "Review the full picture",
              "Check your entries, resolve warnings and revisit any skipped sections.",
            ],
            [
              "03",
              "Understand your result",
              "See a sample tax estimate and the plain-language reasons behind an ITR recommendation.",
            ],
          ].map(([number, title, copy]) => (
            <article
              key={number}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {number}
              </span>
              <h3 className="mt-8 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">Built around real life</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
                Bring different kinds of income into one view
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                The prototype supports common combinations for resident individuals and flags situations that need specialist review.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {incomeTypes.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex min-h-28 flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <Icon className="size-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                  <span className="mt-5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-20 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          {
            icon: FileSearch,
            title: "Document-ready",
            copy: "Preview how Form 16 and statement extraction could reduce manual entry in a future connected version.",
          },
          {
            icon: ShieldCheck,
            title: "Explainable by design",
            copy: "See which answers triggered a recommendation instead of receiving a form name without context.",
          },
          {
            icon: LockKeyhole,
            title: "Privacy in plain language",
            copy: "Prototype answers stay in this browser. No real tax documents are uploaded to a backend in this phase.",
          },
        ].map(({ icon: Icon, title, copy }) => (
          <article key={title} className="p-2">
            <span className="grid size-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">
              {copy}
            </p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 overflow-hidden rounded-lg bg-slate-900 dark:bg-slate-900 border border-slate-800 px-6 py-10 text-white sm:px-10 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-14 lg:py-14">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-400">
              Your data, your choice
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl text-white">
              Explore without handing over your identity.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              Use sample data or save your answers locally on this device. Sensitive placeholders are masked, and you can remove stored assessment data whenever you want.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              "No account required for the prototype",
              "No real OCR or AI processing",
              "Clear local-storage controls",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-sm font-medium"
              >
                <Check className="size-4 text-emerald-400" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[0.65fr_1fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">Common questions</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-white">A little clarity before you begin</h2>
        </div>
        <Accordion
          type="single"
          collapsible
          className="border-t border-slate-200 dark:border-slate-800"
        >
          {faqs.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="py-5 text-base hover:no-underline text-slate-900 dark:text-white">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl pb-5 leading-7 text-slate-600 dark:text-slate-400">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="border-t border-slate-200 bg-emerald-50/70 dark:border-slate-800 dark:bg-emerald-950/20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Ready to organise your tax information?
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Start with your profile. You can pause and return on this device.
            </p>
          </div>
          <Button
            size="lg"
            asChild
            className="h-12 rounded-lg bg-emerald-700 px-6 text-white hover:bg-emerald-800"
          >
            <Link href="/assessment">
              Start tax assessment <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-7 sm:flex-row">
            <Brand />
            <nav
              className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600 dark:text-slate-400"
              aria-label="Footer navigation"
            >
              <Link href="/settings">Privacy</Link>
              <Link href="/help">Terms</Link>
              <span className="text-slate-400 dark:text-slate-500">Contact details coming later</span>
            </nav>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            EaseITR is an independent educational prototype and is not affiliated with the Government of India or the Income Tax Department. Estimates and form recommendations are not legal or tax advice.
          </div>
        </div>
      </footer>
    </main>
  );
}
