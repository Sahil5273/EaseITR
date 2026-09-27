import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/easeitr/app-shell";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What EaseITR stores on this device, what is saved after Google sign-in, and how an uploaded document is read and deleted.",
};

export default function PrivacyPage() {
  return (
    <AppShell width="reading">
      <h1 className="page-title">Privacy policy</h1>
      <p className="page-lead">
        EaseITR is a student prototype for resident individuals in India. This page describes what the application actually does with your information.
      </p>
      <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">On this device, without an account</h2>
          <p className="mt-2">
            The assessment form, the regime comparison, and the ITR suggestion are calculated in your browser. A copy of that assessment is kept in this browser so you can pause and return. It is not sent to EaseITR until you sign in. Clearing the assessment in Settings removes that browser copy.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">After you sign in with Google</h2>
          <p className="mt-2">
            Sign-in uses your Google account to confirm who you are. EaseITR receives the account id and email address needed to keep your session. The same assessment can then be saved through the EaseITR service into Cloud Firestore in Mumbai (asia-south1), under your account. The browser copy remains as well. Signing out ends the session in this browser. Clearing data in Settings deletes the saved assessment from the service when you are signed in.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">Documents</h2>
          <p className="mt-2">
            Document reading works only after you log in. The file is uploaded to a private bucket in Mumbai over a short-lived link, read by Google Document AI, and deleted when the read finishes. A leftover object is removed by a one-day lifecycle rule. EaseITR does not keep the file, and it does not keep the full recognised text. A PAN is masked before the result is shown and before an accepted field is saved. Nothing from the document is written into the assessment until you accept a field.
          </p>
          <p className="mt-2">
            If you choose “Choose for me”, the form reader decides whether the file looks like a Form 16, Form 26AS, an Annual Information Statement, a broker capital-gains statement, a home-loan interest certificate, or a bill. A bill that the first read cannot fill in may be read a second time by the invoice reader. Google sees the file for the duration of that processing.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">“What this means”</h2>
          <p className="mt-2">
            That button is available only while you are signed in, and it is skipped for a PAN or another sensitive value. It sends the field label and the value you are looking at to Gemini, in Mumbai, and asks for a short explanation. Gemini is instructed not to calculate tax and not to choose an ITR form. The explanation is not stored as part of the assessment.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">What this is not</h2>
          <p className="mt-2">
            EaseITR does not file on the Income Tax portal, does not log into the Income Tax Department, and does not train a model on your documents. It is not affiliated with the Government of India. The sample Form 16 in the document centre is fictional.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">Contact</h2>
          <p className="mt-2">
            Questions about this prototype can be sent to sahil06030352@gmail.com. The published list of running costs is on the{" "}
            <Link className="font-medium text-emerald-800 underline" href="/costs">
              running costs
            </Link>{" "}
            page, and the limits of the prototype are on the{" "}
            <Link className="font-medium text-emerald-800 underline" href="/limitations">
              limitations
            </Link>{" "}
            page.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
