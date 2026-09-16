import Link from "next/link";
import { ReceiptIndianRupee } from "lucide-react";

export function Brand() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5"
      aria-label="EaseITR home"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm transition-transform group-hover:-rotate-3">
        <ReceiptIndianRupee className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-[-0.03em] text-slate-950 dark:text-white">
        Ease<span className="text-emerald-700 dark:text-emerald-400">ITR</span>
      </span>
    </Link>
  );
}
