"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
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
import { useAuth } from "@/lib/state/auth-context";
import { cloudSaveAvailable } from "@/lib/services/remote/easeitr-api";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const { clear, exportData, cloudAccount } = useAssessment();
  const { user, signIn, signOutUser } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const effectiveTheme = mounted ? theme : "system";
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
    toast.success("Assessment export created.");
  };
  return (
    <AppShell width="reading">
      <h1 className="page-title">
        Settings & privacy
      </h1>
      <p className="page-lead">
        Control the appearance and data stored by this frontend prototype.
      </p>
      <div className="mt-8 space-y-5">
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold">Appearance</h2>
          <p className="mt-2 text-sm text-slate-500">
            Choose how EaseITR looks on this device.
          </p>
          <RadioGroup
            value={effectiveTheme}
            onValueChange={setTheme}
            className="mt-5 grid gap-3 sm:grid-cols-3"
          >
            {themes.map(({ value, label, icon: Icon }) => (
              <Label
                key={value}
                htmlFor={`theme-${value}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-4",
                  effectiveTheme === value &&
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
        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="flex gap-3">
            <ShieldCheck className="size-6 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold">Saved assessment</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {cloudAccount
                  ? "This assessment is saved to your Google account. Document files are deleted after they are read."
                  : cloudSaveAvailable()
                    ? "On this device the assessment stays in the browser until you sign in. After sign-in it is saved to your Google account."
                    : "The assessment stays in this browser. Saving it to a Google account is not connected yet."}
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-muted p-4">
            <div>
              <Label htmlFor="retention" className="font-semibold">
                Remember document choices on this device
              </Label>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Uploaded files are not kept. Only the fields you accept are saved.
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
              Export assessment
            </Button>
            <ConfirmationDialog
              trigger={
                <Button variant="outline" className="text-red-600">
                  <Trash2 />
                  Clear locally stored data
                </Button>
              }
              title="Clear this assessment?"
              description="This removes the assessment from this browser and, if you are signed in, from your Google account."
              confirmLabel="Clear data"
              onConfirm={() => {
                clear();
                toast.success("Assessment data cleared.");
              }}
            />
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-muted">
              <UserRound className="size-5" />
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Google account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {user
                  ? `Signed in as ${user.email ?? "your Google account"}. Assessments save with this account. EaseITR does not file on the Income Tax portal.`
                  : cloudSaveAvailable()
                    ? "Sign in to save an assessment to your Google account and to read Form 16, AIS, 26AS, broker statements, and bills."
                    : "Google sign-in is set up. Saving an assessment and reading a document connect when the EaseITR service is published."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  if (user) void signOutUser();
                  else
                    void signIn().catch(() =>
                      toast.error("Google sign-in did not finish. Try again."),
                    );
                }}
              >
                {user ? "Sign out" : "Sign in with Google"}
              </Button>
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <Link className="font-medium text-emerald-800 underline" href="/privacy">
                  Privacy policy
                </Link>
                <Link className="font-medium text-emerald-800 underline" href="/terms">
                  Terms of service
                </Link>
                <Link className="font-medium text-emerald-800 underline" href="/costs">
                  Running costs
                </Link>
                <Link className="font-medium text-emerald-800 underline" href="/limitations">
                  Limitations
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
