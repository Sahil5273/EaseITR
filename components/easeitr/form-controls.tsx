"use client";

import { useId } from "react";
import { Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { IncomeSource } from "@/lib/domain/types";

export function CurrencyInput({
  label,
  value,
  onChange,
  description,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          ₹
        </span>
        <Input
          id={id}
          inputMode="numeric"
          disabled={disabled}
          value={value || ""}
          onChange={(event) =>
            onChange(Number(event.target.value.replace(/\D/g, "")))
          }
          placeholder="0"
          className="h-11 rounded-xl pl-8"
        />
      </div>
      {description && (
        <p className="text-xs leading-5 text-slate-500">{description}</p>
      )}
    </div>
  );
}

export function PercentageInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(event) =>
            onChange(Math.min(100, Number(event.target.value)))
          }
          className="h-11 rounded-xl pr-9"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          %
        </span>
      </div>
    </div>
  );
}

export function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl"
      />
    </div>
  );
}

export function YesNoSelector({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </legend>
      {description && (
        <p className="text-xs leading-5 text-slate-500">{description}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {[true, false].map((option) => (
          <Button
            key={String(option)}
            type="button"
            variant="outline"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={cn(
              "h-11 rounded-xl",
              value === option &&
                "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
            )}
          >
            {value === option && <Check />}
            {option ? "Yes" : "No"}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}

export const incomeOptions: Array<{ value: IncomeSource; label: string }> = [
  { value: "salary", label: "Salary" },
  { value: "pension", label: "Pension" },
  { value: "house-property", label: "House property" },
  { value: "capital-gains", label: "Capital gains" },
  { value: "delivery-trading", label: "Delivery trading" },
  { value: "intraday", label: "Intraday trading" },
  { value: "fo", label: "Futures & options" },
  { value: "freelance", label: "Freelance / professional" },
  { value: "business", label: "Business" },
  { value: "other", label: "Interest & other income" },
];

export function MultiSelectIncome({
  value,
  onChange,
}: {
  value: IncomeSource[];
  onChange: (value: IncomeSource[]) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">
        Which income sources apply to you?
      </legend>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Select every source you expect to report.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {incomeOptions.map((option) => {
          const selected = value.includes(option.value);
          return (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              aria-pressed={selected}
              onClick={() =>
                onChange(
                  selected
                    ? value.filter((item) => item !== option.value)
                    : [...value, option.value],
                )
              }
              className={cn(
                "h-auto min-h-11 justify-start whitespace-normal rounded-xl px-4 py-3 text-left",
                selected &&
                  "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
              )}
            >
              {selected && <Check />}
              {option.label}
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function InformationTooltip({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label="More information"
        >
          <HelpCircle />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-sm leading-5">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
