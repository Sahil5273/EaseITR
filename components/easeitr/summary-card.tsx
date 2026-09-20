import type { LucideIcon } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { cn } from "@/lib/utils";

export function SummaryCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "positive" | "warning";
}) {
  return (
    <SpotlightCard
      className="p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)]"
      spotlightColor={
        tone === "positive"
          ? "rgba(16, 185, 129, 0.18)"
          : tone === "warning"
            ? "rgba(217, 119, 6, 0.15)"
            : "rgba(99, 102, 241, 0.12)"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {Icon && (
          <Icon
            className={cn(
              "size-5",
              tone === "positive"
                ? "text-emerald-600"
                : tone === "warning"
                  ? "text-amber-600"
                  : "text-slate-400",
            )}
          />
        )}
      </div>
      <p
        className={cn(
          "mt-3 text-2xl font-bold tracking-[-0.03em]",
          tone === "positive" && "text-emerald-700 dark:text-emerald-400",
          tone === "warning" && "text-amber-700 dark:text-amber-400",
        )}
      >
        {value}
      </p>
      {note && <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>}
    </SpotlightCard>
  );
}
