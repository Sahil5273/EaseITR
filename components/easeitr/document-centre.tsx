"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileSearch,
  FileText,
  Loader2,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "./app-shell";
import { InfoNote, WarningBanner } from "./feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type {
  DocumentStatus,
  DocumentType,
  ExtractedDocumentField,
  UploadedDocument,
  VerificationStatus,
} from "@/lib/domain/types";
import { mockDocumentExtractionService } from "@/lib/services/mocks/document-service";
import { importAcceptedFields } from "@/lib/domain/filing";
import { cloudSaveAvailable, explainCloudField, extractCloudDocument } from "@/lib/services/remote/easeitr-api";
import { useAuth } from "@/lib/state/auth-context";
import { useAssessment } from "@/lib/state/assessment-context";
import { DocumentChecklist, MismatchList } from "./filing-panels";

const documentTypes: Array<{
  type: DocumentType;
  label: string;
  hint: string;
}> = [
  { type: "form-16", label: "Form 16", hint: "Salary and TDS" },
  { type: "form-26as", label: "Form 26AS", hint: "Tax credits" },
  {
    type: "ais",
    label: "Annual Information Statement",
    hint: "Reported transactions",
  },
  {
    type: "tis",
    label: "Taxpayer Information Summary",
    hint: "Category summary",
  },
  {
    type: "broker-capital-gains",
    label: "Broker capital-gains statement",
    hint: "Equity and funds",
  },
  {
    type: "trading-pnl",
    label: "F&O or intraday P&L",
    hint: "Trading activity",
  },
  {
    type: "bank-interest",
    label: "Bank interest certificate",
    hint: "Interest income",
  },
  {
    type: "home-loan-interest",
    label: "Home-loan certificate",
    hint: "Property interest",
  },
  { type: "rent-receipt", label: "Rent receipts", hint: "Rent evidence" },
  {
    type: "donation-receipt",
    label: "Donation receipts",
    hint: "Eligible donations",
  },
  {
    type: "insurance-proof",
    label: "Insurance premium receipts",
    hint: "Premium payments",
  },
  {
    type: "investment-proof",
    label: "Investment proofs",
    hint: "Eligible investments",
  },
  {
    type: "expense-bill",
    label: "Freelance or business bill",
    hint: "Vendor, date, and amount",
  },
];

export function ConfidenceBadge({ score }: { score: number }) {
  const level = score >= 0.9 ? "High" : score >= 0.8 ? "Medium" : "Verify";
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full",
        score >= 0.9
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
          : score >= 0.8
            ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
            : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
      )}
    >
      {level} · {Math.round(score * 100)}%
    </Badge>
  );
}

export function ExtractionStatus({
  status,
  progress,
}: {
  status: DocumentStatus;
  progress: number;
}) {
  const content = {
    idle: [FileText, "Ready to upload"],
    uploading: [UploadCloud, `Uploading · ${progress}%`],
    processing: [Loader2, "Reading the document"],
    complete: [CheckCircle2, "Extraction complete"],
    failed: [AlertCircle, "Extraction failed"],
  } as const;
  const [Icon, label] = content[status];
  return (
    <div
      aria-live="polite"
      className="flex items-center gap-2 text-sm font-semibold"
    >
      <Icon
        className={cn(
          "size-4",
          (status === "uploading" || status === "processing") && "animate-spin",
          status === "complete" && "text-emerald-600",
          status === "failed" && "text-red-600",
        )}
      />
      {label}
    </div>
  );
}

export function ExtractedFieldEditor({
  field,
  onCommit,
}: {
  field: ExtractedDocumentField;
  onCommit: (status: VerificationStatus, value: string) => void;
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(field.normalizedValue ?? ""));
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        field.confidence < 0.8
          ? "border-amber-300 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20"
          : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {field.label}
          </p>
          {editing ? (
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="mt-2 h-9"
              autoFocus
            />
          ) : (
            <p className="mt-1 font-semibold">
              {field.isSensitive ? String(field.normalizedValue ?? "") : value}
            </p>
          )}
        </div>
        <ConfidenceBadge score={field.confidence} />
      </div>
      {field.confidence < 0.8 && (
        <p className="mt-2 text-xs font-medium text-amber-800 dark:text-amber-300">
          Manual verification required
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1">
        <Button
          size="xs"
          variant="ghost"
          onClick={() => {
            onCommit("accepted", value);
            toast.success(`${field.label} accepted`);
          }}
        >
          <Check />
          Accept
        </Button>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => {
            if (editing) onCommit("edited", value);
            setEditing(!editing);
          }}
        >
          <Pencil />
          {editing ? "Save edit" : "Edit"}
        </Button>
        <Button size="xs" variant="ghost" onClick={() => onCommit("rejected", value)}>
          <X />
          Reject
        </Button>
        {user && cloudSaveAvailable() && !field.isSensitive && (
          <Button
            size="xs"
            variant="ghost"
            disabled={explaining}
            onClick={() => {
              setExplaining(true);
              void user
                .getIdToken()
                .then((token) => explainCloudField(token, field.label, value))
                .then(setExplanation)
                .catch(() => setExplanation("This field could not be explained just now."))
                .finally(() => setExplaining(false));
            }}
          >
            {explaining ? "Explaining" : "What this means"}
          </Button>
        )}
      </div>
      {explanation && (
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {explanation}
        </p>
      )}
    </div>
  );
}

export function DocumentUploader({
  selectedType,
  onDocument,
  onSelectType,
}: {
  selectedType: DocumentType | "auto";
  onDocument: (document: UploadedDocument | null) => void;
  onSelectType?: (type: DocumentType | "auto") => void;
}) {
  const { user, signIn } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<DocumentStatus>("idle");
  const [progress, setProgress] = useState(0);

  const process = async (file: File, type: DocumentType | "auto" = selectedType) => {
    const mimeType =
      file.type ||
      (file.name.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : file.name.toLowerCase().endsWith(".png")
          ? "image/png"
          : file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")
            ? "image/jpeg"
            : "");
    const validation = mockDocumentExtractionService.validate({
      name: file.name,
      size: file.size,
      type: mimeType,
    });
    if (!validation.valid) {
      setError(validation.error ?? "This file cannot be uploaded.");
      setStatus("failed");
      onDocument(null);
      return;
    }
    let account = user;
    if (!account) {
      try {
        account = await signIn();
      } catch {
        setError("Google sign-in did not finish. Try again from Settings.");
        setStatus("failed");
        onDocument(null);
        return;
      }
    }
    if (!account) {
      setError("Sign in with Google to read this document.");
      setStatus("failed");
      onDocument(null);
      return;
    }
    if (!cloudSaveAvailable()) {
      setError("Document reading is not connected yet.");
      setStatus("failed");
      onDocument(null);
      return;
    }
    setError(null);
    setStatus("uploading");
    setProgress(35);
    setStatus("processing");
    setProgress(70);
    try {
      const token = await account.getIdToken();
      const document = await extractCloudDocument(token, file, type);
      if (type === "auto") {
        const label =
          documentTypes.find((item) => item.type === document.type)?.label ??
          "a supported document";
        toast.success(
          `EaseITR read this as ${label}. Check the fields before you accept them.`,
        );
      }
      setProgress(100);
      setStatus("complete");
      onDocument(document);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The document could not be read. Try again.",
      );
      setStatus("failed");
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) void process(file);
        }}
        className={cn(
          "grid min-h-56 w-full place-items-center rounded-3xl border-2 border-dashed p-6 text-center outline-none transition-colors focus-visible:ring-4 focus-visible:ring-emerald-500/30",
          dragging
            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
            : "border-slate-300 bg-muted hover:border-emerald-500 hover:bg-emerald-50/60 dark:border-slate-700 dark:hover:bg-emerald-950/30",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void process(file);
          }}
          aria-label="Upload tax document"
        />
        <span>
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-card text-emerald-700 shadow-sm">
            <UploadCloud className="size-6" />
          </span>
          <span className="mt-4 block text-base font-bold">
            Drop a file here, or choose from your device
          </span>
          <span className="mt-2 block text-sm text-slate-500">
            PDF, PNG or JPG · maximum 10 MB. The file is deleted after it is read. Nothing is added until you accept a field.
          </span>
          <span className="mt-4 flex justify-center">
            <ExtractionStatus status={status} progress={progress} />
          </span>
          {(status === "uploading" || status === "processing") && (
            <Progress value={progress} className="mx-auto mt-3 h-2 max-w-xs" />
          )}
        </span>
      </button>
      <div className="mt-4 flex flex-col items-start gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={status === "uploading" || status === "processing"}
          onClick={() => {
            onSelectType?.("auto");
            void (async () => {
              try {
                const response = await fetch("/sample-form-16.pdf");
                if (!response.ok) {
                  setError("The sample Form 16 could not be opened.");
                  setStatus("failed");
                  return;
                }
                const blob = await response.blob();
                await process(
                  new File([blob], "sample-form-16.pdf", { type: "application/pdf" }),
                  "auto",
                );
              } catch {
                setError("The sample Form 16 could not be opened.");
                setStatus("failed");
              }
            })();
          }}
        >
          Try the sample Form 16
        </Button>
        <p className="text-sm text-slate-500">
          A fictional Form 16. EaseITR chooses the type from the file, the same way as an upload with “Choose for me”.
        </p>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function DocumentCentre() {
  const { user } = useAuth();
  const { data, update } = useAssessment();
  const [selectedType, setSelectedType] = useState<DocumentType | "auto">("auto");
  const [draft, setDraft] = useState<{
    type: DocumentType;
    document: UploadedDocument | null;
  } | null>(null);
  const document =
    selectedType !== "auto" && draft?.type === selectedType
      ? draft.document
      : selectedType === "auto"
        ? null
        : (data.reviewedDocuments.find((item) => item.type === selectedType) ??
          null);
  const numericFields = new Set([
    "salary",
    "tds",
    "savings-interest",
    "fd-interest",
    "stcg",
    "ltcg",
    "loan-interest",
  ]);

  const storeDocument = (next: UploadedDocument | null) => {
    const type = next?.type ?? (selectedType === "auto" ? null : selectedType);
    if (!type) return;
    if (next) setSelectedType(next.type);
    setDraft({ type, document: next });
    if (!next) {
      update((current) => ({
        ...current,
        reviewedDocuments: current.reviewedDocuments.filter(
          (item) => item.type !== type,
        ),
        importedFields: current.importedFields.filter(
          (item) => item.documentType !== type,
        ),
        status: current.status === "not-started" ? "in-progress" : current.status,
      }));
      return;
    }
    update((current) =>
      importAcceptedFields(
        {
          ...current,
          status: current.status === "not-started" ? "in-progress" : current.status,
        },
        next,
      ),
    );
  };

  const commitField = (id: string, status: VerificationStatus, value: string) => {
    if (!document) return;
    const next: UploadedDocument = {
      ...document,
      fields: document.fields.map((field) => {
        if (field.id !== id) return field;
        const numeric = numericFields.has(field.id)
          ? Number(value.replace(/\D/g, "")) || 0
          : value;
        return { ...field, verificationStatus: status, normalizedValue: numeric };
      }),
    };
    storeDocument(next);
  };

  return (
    <AppShell width="wide">
      <div className="max-w-3xl">
        <Badge variant="outline" className="rounded-full">
          You accept every field
        </Badge>
        <h1 className="page-title mt-3">
          Document centre
        </h1>
        <p className="page-lead">
          Add a statement, accept the fields you trust, and those amounts are
          written into the assessment. The file is deleted after it is read.
          A low-confidence field stays unverified until you accept it.
        </p>
      </div>
      <div className="mt-6">
        {user ? (
          <InfoNote>
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            Signed in. The file is deleted after it is read. A figure is added to the assessment only after you accept it.
          </InfoNote>
        ) : (
          <WarningBanner title="Document reading needs a login">
            You can only use document reading after you log in. The assessment form on this device does not need an account. Adding a file, or trying the sample Form 16, asks you to sign in with Google.
          </WarningBanner>
        )}
      </div>
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
          Documents this assessment expects
        </h2>
        <div className="mt-4">
          <DocumentChecklist data={data} />
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
          1. Choose a type, or let EaseITR choose
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <button
            type="button"
            aria-pressed={selectedType === "auto"}
            onClick={() => {
              setSelectedType("auto");
              setDraft(null);
            }}
            className={cn(
              "rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
              selectedType === "auto"
                ? "border-emerald-600 ring-2 ring-emerald-500/20"
                : "border-border",
            )}
          >
            <FileSearch
              className={cn(
                "size-5",
                selectedType === "auto" ? "text-emerald-600" : "text-slate-400",
              )}
            />
            <p className="mt-4 text-sm font-bold">Choose for me</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload without a type. The reader picks Form 16, 26AS, AIS, a broker statement, a home-loan certificate, or a bill.
            </p>
          </button>
          {documentTypes.map((item) => (
            <button
              key={item.type}
              type="button"
              aria-pressed={selectedType === item.type}
              onClick={() => {
                setSelectedType(item.type);
                setDraft(null);
              }}
              className={cn(
                "rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                selectedType === item.type
                  ? "border-emerald-600 ring-2 ring-emerald-500/20"
                  : "border-border",
              )}
            >
              <FileText
                className={cn(
                  "size-5",
                  selectedType === item.type
                    ? "text-emerald-600"
                    : "text-slate-400",
                )}
              />
              <p className="mt-4 text-sm font-bold">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.hint}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
          2. Add your file
        </h2>
        <div className="mt-4">
          <DocumentUploader
            selectedType={selectedType}
            onDocument={storeDocument}
            onSelectType={setSelectedType}
          />
        </div>
      </section>
      {document && (
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                3. Verify extracted fields
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Check each field against your file before you accept it.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedType === "auto") return;
                  setDraft({ type: selectedType, document: null });
                }}
              >
                <RotateCcw />
                Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={() => storeDocument(null)}
              >
                <Trash2 />
                Delete
              </Button>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="grid min-h-[560px] place-items-center rounded-3xl border border-border bg-muted p-8 text-center">
              <div>
                <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-card text-muted-foreground shadow-sm">
                  <FileSearch className="size-8" />
                </span>
                <p className="mt-5 font-bold">Original document placeholder</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Page-level highlights and coordinates will appear here when a
                  real extraction service is connected.
                </p>
                <Badge variant="outline" className="mt-4">
                  {document.name}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              {document.fields.map((field) => (
                <ExtractedFieldEditor
                  key={`${field.id}-${field.verificationStatus}`}
                  field={field}
                  onCommit={(status, value) => commitField(field.id, status, value)}
                />
              ))}
              <div className="rounded-2xl bg-muted p-4 text-xs leading-5 text-muted-foreground">
                Detected type: <strong>{document.detectedType}</strong> · Model:{" "}
                <strong>{document.modelVersion}</strong> · Source pages and
                normalized values are included in the mock contract.
              </div>
            </div>
          </div>
        </section>
      )}
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
          Statement comparisons
        </h2>
        <div className="mt-4">
          <MismatchList data={data} />
        </div>
      </section>
    </AppShell>
  );
}
