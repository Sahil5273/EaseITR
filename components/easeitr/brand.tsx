import Link from "next/link";
import { ReceiptIndianRupee } from "lucide-react";

export function Brand() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5"
      aria-label="EaseITR home"
    >
      <span className="grid size-9 place-items-center rounded-lg bg-emerald-700 text-white shadow-xs transition-transform group-hover:-rotate-3">
        <ReceiptIndianRupee className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        Ease<span className="text-emerald-700">ITR</span>
      </span>
    </Link>
  );
}
