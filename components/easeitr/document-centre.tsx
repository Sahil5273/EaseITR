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
import { InfoNote } from "./feedback";
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
    processing: [Loader2, "Mock extraction in progress"],
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
  onStatus,
}: {
  field: ExtractedDocumentField;
  onStatus: (status: VerificationStatus) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(field.normalizedValue ?? ""));
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        field.confidence < 0.8
          ? "border-amber-300 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20"
          : "border-slate-200 dark:border-slate-800",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
              {field.isSensitive ? "•••••1234•" : value}
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
            onStatus("accepted");
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
            if (editing) onStatus("edited");
            setEditing(!editing);
          }}
        >
          <Pencil />
          {editing ? "Save edit" : "Edit"}
        </Button>
        <Button size="xs" variant="ghost" onClick={() => onStatus("rejected")}>
          <X />
          Reject
        </Button>
      </div>
    </div>
  );
}

export function DocumentUploader({
  selectedType,
  onDocument,
}: {
  selectedType: DocumentType;
  onDocument: (document: UploadedDocument | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<DocumentStatus>("idle");
  const [progress, setProgress] = useState(0);

  const process = async (file: File) => {
    const validation = mockDocumentExtractionService.validate(file);
    if (!validation.valid) {
      setError(validation.error ?? "This file cannot be uploaded.");
      setStatus("failed");
      onDocument(null);
      return;
    }
    setError(null);
    setStatus("uploading");
    setProgress(28);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setProgress(72);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setProgress(100);
    setStatus("processing");
    try {
      const document = await mockDocumentExtractionService.extract(
        file,
        selectedType,
      );
      setStatus("complete");
      onDocument(document);
    } catch {
      setError("The mock extraction could not be completed. Try again.");
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
            : "border-slate-300 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-emerald-950/30",
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
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm dark:bg-slate-800">
            <UploadCloud className="size-6" />
          </span>
          <span className="mt-4 block text-base font-bold">
            Drop a file here, or choose from your device
          </span>
          <span className="mt-2 block text-sm text-slate-500">
            PDF, PNG or JPG · maximum 10 MB
          </span>
          <span className="mt-4 flex justify-center">
            <ExtractionStatus status={status} progress={progress} />
          </span>
          {(status === "uploading" || status === "processing") && (
            <Progress value={progress} className="mx-auto mt-3 h-2 max-w-xs" />
          )}
        </span>
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function DocumentCentre() {
  const [selectedType, setSelectedType] = useState<DocumentType>("form-16");
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const setFieldStatus = (id: string, status: VerificationStatus) =>
    setDocument((current) =>
      current
        ? {
            ...current,
            fields: current.fields.map((field) =>
              field.id === id
                ? { ...field, verificationStatus: status }
                : field,
            ),
          }
        : null,
    );
  return (
    <AppShell width="wide">
      <div className="max-w-3xl">
        <Badge variant="outline" className="rounded-full">
          Mock AI-assisted workflow
        </Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          Document centre
        </h1>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Preview how financial documents could be uploaded, processed and
          verified. No real OCR or AI extraction happens in this prototype.
        </p>
      </div>
      <div className="mt-6">
        <InfoNote>
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          Files selected here are used only for the in-browser demonstration and
          are not sent to an EaseITR backend. Avoid using real sensitive
          documents.
        </InfoNote>
      </div>
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
          1. Choose a document type
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documentTypes.map((item) => (
            <button
              key={item.type}
              type="button"
              aria-pressed={selectedType === item.type}
              onClick={() => {
                setSelectedType(item.type);
                setDocument(null);
              }}
              className={cn(
                "rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900",
                selectedType === item.type
                  ? "border-emerald-600 ring-2 ring-emerald-500/20"
                  : "border-slate-200 dark:border-slate-800",
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
              <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
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
            onDocument={setDocument}
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
                Compare each sample field with the original placeholder.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDocument(null)}
              >
                <RotateCcw />
                Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={() => setDocument(null)}
              >
                <Trash2 />
                Delete
              </Button>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="grid min-h-[560px] place-items-center rounded-3xl border border-slate-200 bg-slate-100 p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <div>
                <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800">
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
                  key={field.id}
                  field={field}
                  onStatus={(status) => setFieldStatus(field.id, status)}
                />
              ))}
              <div className="rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-800">
                Detected type: <strong>{document.detectedType}</strong> · Model:{" "}
                <strong>{document.modelVersion}</strong> · Source pages and
                normalized values are included in the mock contract.
              </div>
            </div>
          </div>
        </section>
      )}
    </AppShell>
  );
}
