import type { Metadata } from "next";
import {
  Clock3,
  FileCheck2,
  FileText,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/easeitr/app-shell";
import { AssessmentIntroActions } from "@/components/easeitr/assessment-intro-actions";
import { InfoNote, WarningBanner } from "@/components/easeitr/feedback";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Tax Assessment Questionnaire",
  description:
    "Answer guided questions to build your income-tax profile and receive explainable ITR recommendations.",
};

export default function AssessmentIntroPage() {
  return (
    <AppShell width="reading">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-start">
        <div>
          <Badge
            variant="outline"
            className="rounded-lg border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 font-medium dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
          >
            <Sparkles className="mr-1.5 size-3.5" aria-hidden="true" />
            Guided assessment
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Let’s build your tax picture.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            We’ll ask about your profile, income, deductions and taxes already
            paid. Each section explains why the information matters.
          </p>
          <div className="mt-8">
            <AssessmentIntroActions />
          </div>
          <div className="mt-8">
            <InfoNote>
              Your progress is saved locally in this browser after each change.
              No account or backend is used in this prototype.
            </InfoNote>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Before you begin
          </p>
          <ul className="mt-5 space-y-5">
            {[
              {
                icon: FileText,
                title: "Income records",
                copy: "Form 16, bank interest, rent, gains or trading summaries.",
              },
              {
                icon: FileCheck2,
                title: "Tax and deduction details",
                copy: "TDS, advance tax and eligible investment or insurance payments.",
              },
              {
                icon: Clock3,
                title: "About 8–12 minutes",
                copy: "For the sample flow. Complex circumstances may take longer.",
              },
              {
                icon: ShieldCheck,
                title: "Common resident-individual cases",
                copy: "Advanced international, audit and partnership cases are not fully supported.",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <li key={title} className="flex gap-3.5 items-start">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {copy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          [
            ListChecks,
            "One topic at a time",
            "Move backward without losing your earlier answers.",
          ],
          [
            FileText,
            "Document simulation",
            "Uploads and extracted fields are mock interactions in this phase.",
          ],
          [
            ShieldCheck,
            "Estimates, not filing",
            "Results are educational and should not be treated as certified advice.",
          ],
        ].map(([Icon, title, copy]) => {
          const CardIcon = Icon as typeof ListChecks;
          return (
            <article
              key={String(title)}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <CardIcon className="size-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
              <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{String(title)}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {String(copy)}
              </p>
            </article>
          );
        })}
      </section>

      <div className="mt-8">
        <WarningBanner title="Prototype scope">
          Calculations, document processing and ITR recommendations use sample
          frontend logic. Confirm important decisions with a qualified tax
          professional.
        </WarningBanner>
      </div>
    </AppShell>
  );
}
