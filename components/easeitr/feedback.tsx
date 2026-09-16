import { AlertCircle, CircleAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function WarningBanner({
  title,
  children,
  serious = false,
}: {
  title: string;
  children: React.ReactNode;
  serious?: boolean;
}) {
  return (
    <div
      role={serious ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm",
        serious
          ? "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          : "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
      )}
    >
      <CircleAlert className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-semibold">{title}</p>
        <div className="mt-1 leading-6 opacity-90">{children}</div>
      </div>
    </div>
  );
}

export function UnsupportedCaseBanner({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WarningBanner title="Professional review recommended" serious>
      <div>{children}</div>
    </WarningBanner>
  );
}

export function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950 dark:bg-sky-950/40 dark:text-sky-200">
      <Info className="mt-0.5 size-4 shrink-0" />
      {children}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div
      role="alert"
      className="grid min-h-56 place-items-center rounded-3xl border border-dashed border-red-300 bg-red-50/60 p-8 text-center dark:border-red-900 dark:bg-red-950/20"
    >
      <div>
        <AlertCircle className="mx-auto size-8 text-red-600" />
        <h2 className="mt-3 font-bold">{title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {message}
        </p>
      </div>
    </div>
  );
}
