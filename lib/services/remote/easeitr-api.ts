import type { AssessmentData, DocumentType, UploadedDocument } from "@/lib/domain/types";
import { apiBaseUrl } from "@/lib/firebase/public-config";

interface ErrorEnvelope {
  error?: { message?: string };
}

async function readPayload(response: Response): Promise<ErrorEnvelope & Record<string, unknown>> {
  return (await response.json().catch(() => ({}))) as ErrorEnvelope & Record<string, unknown>;
}

async function request<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error("Saved assessments are not connected yet.");
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = await readPayload(response);
  if (!response.ok) {
    throw new Error(payload.error?.message || "EaseITR could not complete that request.");
  }
  return payload as T;
}

export function cloudSaveAvailable(): boolean {
  return apiBaseUrl.length > 0;
}

export async function loadCloudAssessment(token: string): Promise<AssessmentData | null> {
  const payload = await request<{ assessment: AssessmentData | null }>(
    token,
    "/v1/assessments/current",
  );
  return payload.assessment;
}

export async function saveCloudAssessment(token: string, data: AssessmentData): Promise<void> {
  await request(token, "/v1/assessments/current", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function clearCloudAssessment(token: string): Promise<void> {
  await request(token, "/v1/assessments/current", { method: "DELETE" });
}

function mimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "";
}

export async function extractCloudDocument(
  token: string,
  file: File,
  documentType: DocumentType | "auto",
): Promise<UploadedDocument> {
  const mimeType = file.type || mimeFromName(file.name);
  const issued = await request<{ uploadUrl: string; objectPath: string }>(token, "/v1/uploads", {
    method: "POST",
    body: JSON.stringify({ contentType: mimeType, size: file.size }),
  });
  const uploaded = await fetch(issued.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: file,
  });
  if (!uploaded.ok) throw new Error("The file could not be uploaded. Try again.");
  const extracted = await request<{ document: UploadedDocument }>(token, "/v1/extractions", {
    method: "POST",
    body: JSON.stringify({
      objectPath: issued.objectPath,
      documentType: documentType === "auto" ? undefined : documentType,
      detectType: documentType === "auto",
      fileName: file.name,
      mimeType,
      size: file.size,
    }),
  });
  return { ...extracted.document, ocrText: null };
}

export async function explainCloudField(
  token: string,
  label: string,
  value: string,
): Promise<string> {
  const payload = await request<{ explanation: string }>(token, "/v1/fields/explain", {
    method: "POST",
    body: JSON.stringify({ label, value, sensitive: false }),
  });
  return payload.explanation;
}
