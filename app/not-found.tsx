import Link from "next/link";
import { BarChart3, FileText, Home, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShellHeader } from "@/components/easeitr/app-shell";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <AppShellHeader />
      <main className="flex-1 mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mb-6">
          <HelpCircle className="size-8" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
          404 Error
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-lg text-slate-600 dark:text-slate-300">
          The page or assessment section you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-xl bg-emerald-700 text-white hover:bg-emerald-800">
            <Link href="/">
              <Home className="mr-2 size-4" aria-hidden="true" />
              Return Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link href="/assessment">
              <FileText className="mr-2 size-4" aria-hidden="true" />
              Start Assessment
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link href="/dashboard">
              <BarChart3 className="mr-2 size-4" aria-hidden="true" />
              Sample Dashboard
            </Link>
          </Button>
        </div>
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800">
        EaseITR — Guided income-tax assessment prototype
      </footer>
    </div>
  );
}
