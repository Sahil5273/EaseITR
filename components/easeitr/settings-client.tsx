"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Laptop,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { AppShell } from "./app-shell";
import { ConfirmationDialog } from "./confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useAssessment } from "@/lib/state/assessment-context";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const { clear, exportData } = useAssessment();
  const [currency, setCurrency] = useState("symbol");
  const [retainDocuments, setRetainDocuments] = useState(false);
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setCurrency(window.localStorage.getItem("easeitr-currency") ?? "symbol");
      setRetainDocuments(
        window.localStorage.getItem("easeitr-retain-docs") === "true",
      );
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);
  const saveCurrency = (value: string) => {
    setCurrency(value);
    window.localStorage.setItem("easeitr-currency", value);
  };
  const download = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = "easeitr-local-export.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Local mock-data export created.");
  };
  return (
    <AppShell width="reading">
      <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
        Settings & privacy
      </h1>
      <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
        Control the appearance and data stored by this frontend prototype.
      </p>
      <div className="mt-8 space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold">Appearance</h2>
          <p className="mt-2 text-sm text-slate-500">
            Choose how EaseITR looks on this device.
          </p>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="mt-5 grid gap-3 sm:grid-cols-3"
          >
            {themes.map(({ value, label, icon: Icon }) => (
              <Label
                key={value}
                htmlFor={`theme-${value}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-4",
                  theme === value &&
                    "border-emerald-600 bg-emerald-50 dark:bg-emerald-950",
                )}
              >
                <RadioGroupItem id={`theme-${value}`} value={value} />
                <Icon className="size-5" />
                {label}
              </Label>
            ))}
          </RadioGroup>
          <div className="mt-5 max-w-sm space-y-2">
            <Label htmlFor="currency">Currency display</Label>
            <NativeSelect
              id="currency"
              value={currency}
              onChange={(event) => saveCurrency(event.target.value)}
              className="h-11 w-full rounded-xl"
            >
              <NativeSelectOption value="symbol">₹1,25,000</NativeSelectOption>
              <NativeSelectOption value="code">INR 1,25,000</NativeSelectOption>
              <NativeSelectOption value="compact">₹1.25L</NativeSelectOption>
            </NativeSelect>
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex gap-3">
            <ShieldCheck className="size-6 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold">Local data & retention</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Assessment answers use browser storage. There is no EaseITR
                account database in this phase.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
            <div>
              <Label htmlFor="retention" className="font-semibold">
                Remember mock document choices
              </Label>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Uploaded file contents are never persisted by this prototype.
              </p>
            </div>
            <Switch
              id="retention"
              checked={retainDocuments}
              onCheckedChange={(checked) => {
                setRetainDocuments(checked);
                window.localStorage.setItem(
                  "easeitr-retain-docs",
                  String(checked),
                );
              }}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline" onClick={download}>
              <Download />
              Export mock data
            </Button>
            <ConfirmationDialog
              trigger={
                <Button variant="outline" className="text-red-600">
                  <Trash2 />
                  Clear locally stored data
                </Button>
              }
              title="Clear all local assessment data?"
              description="This removes saved assessment answers from this browser. The action cannot be undone."
              confirmLabel="Clear data"
              onConfirm={() => {
                clear();
                toast.success("Local assessment data cleared.");
              }}
            />
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <UserRound className="size-5" />
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are using EaseITR without an account. Sign-in, cloud sync
                and secure document storage are planned backend features.
              </p>
              <Button variant="outline" disabled className="mt-4">
                Account features — coming later
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
