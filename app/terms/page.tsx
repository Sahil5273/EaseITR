import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/easeitr/app-shell";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "EaseITR is an educational tax-preparation prototype. It does not file a return and it is not tax advice.",
};

export default function TermsPage() {
  return (
    <AppShell width="reading">
      <h1 className="page-title">Terms of service</h1>
      <p className="page-lead">
        By using EaseITR you accept that it is a final-year student prototype, not a chartered accountant and not the Income Tax Department.
      </p>
      <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">What you can use it for</h2>
          <p className="mt-2">
            EaseITR helps a resident individual organise income, documents, and open questions. For a complex return it is meant to reduce the work a chartered accountant still has to do. For a simple return it can prepare a worksheet you can check yourself. It does not submit a return, and a figure on the results page is not a filed assessment.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">You check the figures</h2>
          <p className="mt-2">
            Tax estimates are calculated in the browser from the rules included in this prototype. They are incomplete for cases the limitations page lists. Document fields stay unverified until you accept them. You are responsible for comparing every accepted figure with the original document before you rely on it.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">Your documents</h2>
          <p className="mt-2">
            Upload only documents you are allowed to share. Document reading requires a Google login. The file is deleted after it is read. Do not treat the sample Form 16 as a real taxpayer: the name, PAN, and amounts are made up so the reading path can be demonstrated.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">No professional relationship</h2>
          <p className="mt-2">
            Using EaseITR does not create a client relationship with a chartered accountant. Explanations from “What this means” are plain-language notes. They are not advice, they do not compute tax, and they do not choose an ITR form. Where the prototype says a case needs professional review, that path stays with a chartered accountant.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">Availability</h2>
          <p className="mt-2">
            The service can be withdrawn, can fail, and can change. Saved assessments can be cleared from Settings. Running costs are paid by the project, not by a visitor; they are described on the{" "}
            <Link className="font-medium text-emerald-800 underline" href="/costs">
              running costs
            </Link>{" "}
            page. The{" "}
            <Link className="font-medium text-emerald-800 underline" href="/privacy">
              privacy policy
            </Link>{" "}
            describes what is stored.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
