import type { Metadata } from "next";
import { AppShell } from "@/components/easeitr/app-shell";

export const metadata: Metadata = {
  title: "Limitations",
  description:
    "What EaseITR does not do: no e-filing, a general document reader, human acceptance, and tax cases that stay with a chartered accountant.",
};

export default function LimitationsPage() {
  return (
    <AppShell width="reading">
      <h1 className="page-title">Limitations</h1>
      <p className="page-lead">
        These are the limits of this prototype. They are part of the design, not a hidden failure.
      </p>
      <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">It does not file the return</h2>
          <p className="mt-2">
            EaseITR does not log into the Income Tax portal and does not e-file. A result is a worksheet. Complex cases, non-resident cases, and foreign-income cases stay on the chartered-accountant path and do not show a confident payable figure.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">The document reader is general-purpose</h2>
          <p className="mt-2">
            Google Document AI Form Parser and Invoice Parser, both in Mumbai, read the file. They are not a model trained on Indian tax forms. “Choose for me” classifies Form 16, Form 26AS, AIS, a broker capital-gains statement, a home-loan certificate, or a bill from the labels on the page. Any other type has to be chosen by hand, and an unclear file is refused rather than guessed.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">A person accepts every figure</h2>
          <p className="mt-2">
            Low-confidence fields stay unverified. Nothing is imported until you accept it. The tax estimate is then calculated in the browser. Gemini only explains a field when you click “What this means”, and it is not allowed to compute tax or pick the ITR form.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">The tax rules are a subset</h2>
          <p className="mt-2">
            Indexation, a full tax-audit test, and employer NPS are outside this worksheet. Surcharge marginal relief is an approximation of the income above the threshold, not a full recomputation. Help articles are plain-language notes and still need review by a qualified tax professional.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">The file is seen briefly by Google</h2>
          <p className="mt-2">
            The uploaded file is deleted after it is read, and a one-day rule removes anything left behind. Document AI still processes the file in order to read it. The full recognised text is not stored. A PAN is masked before it is shown or saved.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
