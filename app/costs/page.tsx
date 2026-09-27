import type { Metadata } from "next";
import { AppShell } from "@/components/easeitr/app-shell";

export const metadata: Metadata = {
  title: "Running costs",
  description:
    "What it costs to run EaseITR, including document reading per person. Visitors are not billed.",
};

const rows = [
  ["Opening the website", "Static hosting of the pages", "₹0 at the traffic of a student demonstration"],
  ["Tax assessment, regime comparison, and ITR suggestion", "Calculated in the browser", "₹0"],
  ["Google sign-in", "Confirms the Google account", "₹0"],
  [
    "Saving an assessment",
    "A short API call, then one small Firestore document in Mumbai",
    "Inside the free daily quota for a demonstration. After that, a fraction of a rupee per save",
  ],
  [
    "Reading Form 16, AIS, Form 26AS, a broker statement, or a home-loan certificate",
    "Document AI Form Parser, one page at a time",
    "USD 0.03 per page, about ₹2.50",
  ],
  [
    "Reading a bill when you selected “Freelance or business bill”",
    "Document AI Invoice Parser. One count is a document of up to 10 pages",
    "USD 0.10 per bill, about ₹8.50. An 11 to 20 page bill is USD 0.20",
  ],
  [
    "“Choose for me”",
    "The form reader first. If the file is a bill and that read did not find the bill fields, an invoice read follows",
    "USD 0.03 per page, plus USD 0.10 when the second bill read is needed",
  ],
  [
    "“What this means”",
    "Only when you click it. Gemini 2.5 Flash, at most 120 output tokens, and never for a PAN",
    "Under USD 0.01 per click, well under ₹1",
  ],
  [
    "Keeping the uploaded file",
    "Deleted when the read finishes. Anything left is deleted within a day",
    "Not a meaningful per-person cost",
  ],
];

export default function CostsPage() {
  return (
    <AppShell width="reading">
      <h1 className="page-title">Running costs</h1>
      <p className="page-lead">
        Visitors are not charged. The project pays Google Cloud for the Mumbai services below. Rupee amounts use about ₹84 to one US dollar so the size is easy to judge. The bill itself is in US dollars. These are Google’s published list prices as read in September 2026, not a fixed quote.
      </p>
      <div className="mt-8 space-y-10 text-sm leading-7 text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">Cost of each feature</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Feature</th>
                  <th className="px-4 py-3 font-semibold">What is billed</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([feature, billed, price]) => (
                  <tr key={feature} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3 font-medium text-slate-950 dark:text-slate-50">{feature}</td>
                    <td className="px-4 py-3">{billed}</td>
                    <td className="px-4 py-3">{price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-slate-500">
            The API scales to zero, so an idle site does not keep a server running. Cloud Run in Mumbai is on Google’s lower request price: about USD 0.000024 per vCPU-second and USD 0.0000025 per GiB-second while a request runs, plus USD 0.40 per million requests, after a monthly free allowance of 180,000 vCPU-seconds, 360,000 GiB-seconds, and 2 million requests. A single document read on that API is a fraction of a US cent. Document reading is the cost that matters.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">Document reading for one person</h2>
          <p className="mt-2">
            This example is one salaried person who also has investments. Page counts vary; the prices are the list price times an assumed length.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Document</th>
                  <th className="px-4 py-3 font-semibold">Assumption</th>
                  <th className="px-4 py-3 font-semibold">Document AI</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Form 16", "4 pages, form reader", "USD 0.12, about ₹10"],
                  ["Annual Information Statement", "8 pages, form reader", "USD 0.24, about ₹20"],
                  ["Form 26AS", "3 pages, form reader", "USD 0.09, about ₹8"],
                  ["Broker capital-gains statement", "6 pages, form reader", "USD 0.18, about ₹15"],
                  ["One sample Form 16 from this site", "1 page, form reader", "USD 0.03, about ₹2.50"],
                  ["One bill, type chosen by you", "Up to 10 pages, invoice reader", "USD 0.10, about ₹8.50"],
                  [
                    "One bill, “Choose for me”, first read incomplete",
                    "1 page on the form reader, then the invoice reader",
                    "USD 0.13, about ₹11",
                  ],
                ].map(([document, assumption, price]) => (
                  <tr key={document} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3 font-medium text-slate-950 dark:text-slate-50">{document}</td>
                    <td className="px-4 py-3">{assumption}</td>
                    <td className="px-4 py-3">{price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            The four statements in the first rows come to 21 pages and USD 0.63, about ₹53, for that one person. Saving the assessment and calculating the tax add nothing meaningful on top. Two or three “What this means” clicks stay under a rupee together.
          </p>
          <p className="mt-2">
            Above one million form-reader pages in a month, Google’s published Form Parser price falls from USD 30 to USD 20 per 1,000 pages. This prototype will not reach that tier.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <a className="font-medium text-emerald-800 underline" href="https://cloud.google.com/document-ai/pricing">
                Document AI pricing
              </a>
            </li>
            <li>
              <a className="font-medium text-emerald-800 underline" href="https://cloud.google.com/run/pricing">
                Cloud Run pricing
              </a>
            </li>
            <li>
              <a className="font-medium text-emerald-800 underline" href="https://cloud.google.com/firestore/pricing">
                Firestore pricing
              </a>
            </li>
            <li>
              <a className="font-medium text-emerald-800 underline" href="https://cloud.google.com/vertex-ai/generative-ai/pricing">
                Vertex AI Gemini pricing
              </a>
            </li>
          </ul>
          <p className="mt-3 text-slate-500">
            Firestore’s published free quota is 50,000 reads, 20,000 writes, and 1 GiB stored each day. Past that quota the common published rates are about USD 0.03 per 100,000 reads and USD 0.09 per 100,000 writes; use the Mumbai row on Google’s page if it differs. A budget alert on this project is set at ₹5,000.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
