import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";

import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { Firestore } from "@google-cloud/firestore";
import { Storage } from "@google-cloud/storage";
import { GoogleAuth } from "google-auth-library";

import {
  detectDocumentType,
  fieldsFromPairs,
  pairsFromLabeledLines,
  type RecognizedPair,
} from "../../lib/services/document-map";
import type { DocumentType, UploadedDocument } from "../../lib/domain/types";

const projectId = process.env.GOOGLE_CLOUD_PROJECT || "x-cds-502821";
const bucketName = process.env.DOCUMENT_BUCKET || "easeitr-docs-x-cds-502821";
const processorLocation = process.env.DOCUMENT_AI_LOCATION || "us";
const formProcessor = process.env.FORM_PROCESSOR || "";
const invoiceProcessor = process.env.INVOICE_PROCESSOR || "";
const googleClientId =
  process.env.GOOGLE_CLIENT_ID ||
  "342857978337-7snvlfkcnjcrs7ldd2i7n6k3urpeb026.apps.googleusercontent.com";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,https://easeitr-cf2c3.web.app,https://easeitr-cf2c3.firebaseapp.com")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);

const firestore = new Firestore({ projectId });
const storage = new Storage({ projectId });
const documentAi = new DocumentProcessorServiceClient({
  apiEndpoint: `${processorLocation}-documentai.googleapis.com`,
});
const googleAuth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

function log(event: string): void {
  console.log(JSON.stringify({ event, at: new Date().toISOString() }));
}

function send(response: ServerResponse, status: number, body: unknown, origin: string | null): void {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
    headers["Access-Control-Allow-Methods"] = "GET, PUT, POST, DELETE, OPTIONS";
    headers.Vary = "Origin";
  }
  response.writeHead(status, headers);
  response.end(JSON.stringify(body));
}

function error(response: ServerResponse, status: number, code: string, message: string, origin: string | null): void {
  send(response, status, { error: { code, message } }, origin);
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 900_000) throw new Error("payload-too-large");
    chunks.push(buffer);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function maskPanText(value: string): string {
  return value.replace(/[A-Z]{5}\d{4}[A-Z]/gi, (pan) => {
    const upper = pan.toUpperCase();
    return `•••••${upper.slice(5, 9)}•`;
  });
}

function maskStored(value: unknown): unknown {
  if (typeof value === "string") return maskPanText(value);
  if (Array.isArray(value)) return value.map((item) => maskStored(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => {
        if (key === "ocrText") return [key, null];
        return [key, maskStored(item)];
      }),
    );
  }
  return value;
}

async function uidFrom(request: IncomingMessage): Promise<string | null> {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/tokeninfo", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ access_token: header.slice(7) }),
    });
    if (!tokenResponse.ok) return null;
    const info = (await tokenResponse.json()) as { aud?: string; azp?: string; sub?: string };
    if (!info.sub || (info.aud !== googleClientId && info.azp !== googleClientId)) return null;
    return info.sub;
  } catch {
    return null;
  }
}

function assessmentRef(uid: string) {
  return firestore.collection("users").doc(uid).collection("assessment").doc("current");
}

function segmentIndex(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value) {
    const toNumber = (value as { toNumber?: () => number }).toNumber;
    if (typeof toNumber === "function") return toNumber.call(value);
  }
  return 0;
}

function anchorText(full: string, anchor: unknown): string {
  const segments =
    anchor && typeof anchor === "object" && Array.isArray((anchor as { textSegments?: unknown }).textSegments)
      ? ((anchor as { textSegments: Array<{ startIndex?: unknown; endIndex?: unknown }> }).textSegments)
      : [];
  return segments
    .map((segment) => full.slice(segmentIndex(segment.startIndex), segmentIndex(segment.endIndex)))
    .join("")
    .trim();
}

function pairsFromDocument(document: unknown): RecognizedPair[] {
  const record =
    document && typeof document === "object"
      ? (document as { text?: string | null; pages?: unknown; entities?: unknown })
      : {};
  const text = record.text ?? "";
  const pairs: RecognizedPair[] = [];
  const pages = Array.isArray(record.pages) ? record.pages : [];
  for (const page of pages) {
    const formFields =
      page && typeof page === "object" && Array.isArray((page as { formFields?: unknown }).formFields)
        ? (page as { formFields: unknown[] }).formFields
        : [];
    for (const field of formFields) {
      if (!field || typeof field !== "object") continue;
      const item = field as {
        fieldName?: { textAnchor?: unknown; confidence?: number | null } | null;
        fieldValue?: { textAnchor?: unknown; confidence?: number | null } | null;
      };
      const key = anchorText(text, item.fieldName?.textAnchor);
      const value = anchorText(text, item.fieldValue?.textAnchor);
      if (!key || !value) continue;
      pairs.push({
        key,
        value,
        confidence: Number(item.fieldValue?.confidence ?? item.fieldName?.confidence ?? 0),
      });
    }
  }
  const entities = Array.isArray(record.entities) ? record.entities : [];
  for (const entity of entities) {
    if (!entity || typeof entity !== "object") continue;
    const item = entity as { type?: string | null; mentionText?: string | null; confidence?: number | null };
    if (!item.type || !item.mentionText) continue;
    pairs.push({
      key: item.type,
      value: item.mentionText,
      confidence: Number(item.confidence ?? 0),
    });
  }
  return pairs;
}

async function explainField(label: string, value: string): Promise<string> {
  const token = await googleAuth.getAccessToken();
  const prompt = `Field label: ${label}\nField value: ${value}`;
  const models = ["gemini-2.5-flash", "gemini-2.0-flash-001"];
  for (const model of models) {
    const url = `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/asia-south1/publishers/google/models/${model}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You explain one field taken from an Indian tax document. Use at most two sentences. Do not calculate tax. Do not recommend an ITR form. Do not invent figures.",
            },
          ],
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 120, temperature: 0.2 },
      }),
    });
    if (!response.ok) continue;
    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join(" ").trim();
    if (text) return text.slice(0, 500);
  }
  throw new Error("explain-unavailable");
}

const server = createServer(async (request, response) => {
  const origin = request.headers.origin ?? null;
  const url = new URL(request.url || "/", "http://localhost");
  if (request.method === "OPTIONS") {
    send(response, 204, {}, origin);
    return;
  }
  try {
    if (request.method === "GET" && url.pathname === "/health") {
      send(response, 200, { ok: true }, origin);
      return;
    }
    const uid = await uidFrom(request);
    if (!uid) {
      error(response, 401, "unauthorized", "Sign in again to continue.", origin);
      return;
    }

    if (url.pathname === "/v1/assessments/current" && request.method === "GET") {
      const snapshot = await assessmentRef(uid).get();
      if (!snapshot.exists) {
        send(response, 200, { assessment: null }, origin);
        return;
      }
      send(response, 200, { assessment: snapshot.data() }, origin);
      return;
    }

    if (url.pathname === "/v1/assessments/current" && request.method === "PUT") {
      const body = await readJson(request);
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        error(response, 400, "invalid-assessment", "The assessment could not be saved.", origin);
        return;
      }
      const stored = maskStored(body);
      await assessmentRef(uid).set(stored as Record<string, unknown>);
      log("assessment-saved");
      send(response, 200, { saved: true }, origin);
      return;
    }

    if (url.pathname === "/v1/assessments/current" && request.method === "DELETE") {
      await assessmentRef(uid).delete();
      log("assessment-cleared");
      send(response, 200, { cleared: true }, origin);
      return;
    }

    if (url.pathname === "/v1/uploads" && request.method === "POST") {
      const body = (await readJson(request)) as { contentType?: string; size?: number };
      if (!body.contentType || !ACCEPTED_TYPES.has(body.contentType)) {
        error(response, 400, "unsupported-file", "Choose a PDF, PNG or JPG file.", origin);
        return;
      }
      if (!body.size || body.size > MAX_BYTES) {
        error(response, 400, "file-too-large", "File size must be 10 MB or less.", origin);
        return;
      }
      const objectPath = `users/${uid}/${randomUUID()}`;
      const [uploadUrl] = await storage.bucket(bucketName).file(objectPath).getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 10 * 60 * 1000,
        contentType: body.contentType,
      });
      log("upload-url-issued");
      send(response, 200, { uploadUrl, objectPath }, origin);
      return;
    }

    if (url.pathname === "/v1/extractions" && request.method === "POST") {
      const body = (await readJson(request)) as {
        objectPath?: string;
        documentType?: DocumentType;
        detectType?: boolean;
        fileName?: string;
        mimeType?: string;
        size?: number;
      };
      const prefix = `users/${uid}/`;
      if (!body.objectPath?.startsWith(prefix) || body.objectPath.includes("..")) {
        error(response, 400, "invalid-object", "That file could not be read.", origin);
        return;
      }
      const file = storage.bucket(bucketName).file(body.objectPath);
      try {
        const detect = body.detectType === true;
        if (!body.mimeType || !ACCEPTED_TYPES.has(body.mimeType)) {
          error(response, 400, "unsupported-file", "Choose a PDF, PNG or JPG file.", origin);
          return;
        }
        if (!detect && !body.documentType) {
          error(response, 400, "missing-type", "Choose a document type, or let EaseITR choose.", origin);
          return;
        }
        const processor = !detect && body.documentType === "expense-bill" ? invoiceProcessor : formProcessor;
        if (!processor) {
          error(response, 503, "extractor-unavailable", "Document reading is not configured yet.", origin);
          return;
        }
        const [metadata] = await file.getMetadata();
        const bytes = Number(metadata.size ?? 0);
        if (!bytes || bytes > MAX_BYTES) {
          error(response, 400, "file-too-large", "File size must be 10 MB or less.", origin);
          return;
        }
        const [contents] = await file.download();
        const [processed] = await documentAi.processDocument({
          name: processor,
          skipHumanReview: true,
          rawDocument: { content: contents, mimeType: body.mimeType },
        });
        const read = processed.document ?? {};
        let pairs = [
          ...pairsFromDocument(read),
          ...pairsFromLabeledLines(read.text ?? ""),
        ];
        let resolvedType = body.documentType as DocumentType;
        if (detect) {
          const detected = detectDocumentType(pairs, read.text ?? "");
          if (!detected) {
            error(
              response,
              422,
              "unknown-document",
              "EaseITR could not tell what this document is. Choose a document type and try again.",
              origin,
            );
            return;
          }
          resolvedType = detected;
          const formBillFields = fieldsFromPairs("expense-bill", pairs);
          if (detected === "expense-bill" && formBillFields.length < 2 && invoiceProcessor) {
            const [billProcessed] = await documentAi.processDocument({
              name: invoiceProcessor,
              skipHumanReview: true,
              rawDocument: { content: contents, mimeType: body.mimeType },
            });
            const billRead = billProcessed.document ?? {};
            const billPairs = [
              ...pairsFromDocument(billRead),
              ...pairsFromLabeledLines(billRead.text ?? ""),
            ];
            if (fieldsFromPairs("expense-bill", billPairs).length > 0) pairs = billPairs;
          }
        }
        const fields = fieldsFromPairs(resolvedType, pairs);
        const uploaded: UploadedDocument = {
          id: `doc-${randomUUID()}`,
          name: (body.fileName || "document").slice(0, 120),
          type: resolvedType,
          mimeType: body.mimeType,
          size: bytes,
          status: "complete",
          progress: 100,
          detectedType: resolvedType,
          ocrText: null,
          fields,
          tables: [],
          processingErrors: fields.length
            ? []
            : ["No recognised fields were found. You can enter the figures yourself."],
          modelVersion: `document-ai-${processorLocation}`,
          extractedAt: new Date().toISOString(),
        };
        log("document-read");
        send(response, 200, { document: maskStored(uploaded) }, origin);
      } finally {
        await file.delete({ ignoreNotFound: true }).catch(() => undefined);
        log("document-deleted");
      }
      return;
    }

    if (url.pathname === "/v1/fields/explain" && request.method === "POST") {
      const body = (await readJson(request)) as { label?: string; value?: string; sensitive?: boolean };
      if (body.sensitive || !body.label || !body.value) {
        error(response, 400, "explain-skipped", "This field is not explained automatically.", origin);
        return;
      }
      if (body.value.length > 80 || /[A-Z]{5}\d{4}[A-Z]/i.test(body.value)) {
        error(response, 400, "explain-skipped", "This field is not explained automatically.", origin);
        return;
      }
      const explanation = await explainField(body.label.slice(0, 80), body.value.slice(0, 80));
      log("field-explained");
      send(response, 200, { explanation }, origin);
      return;
    }

    error(response, 404, "not-found", "That request is not available.", origin);
  } catch (caught) {
    const tooLarge = caught instanceof Error && caught.message === "payload-too-large";
    log(tooLarge ? "payload-too-large" : "request-failed");
    error(
      response,
      tooLarge ? 413 : 500,
      tooLarge ? "payload-too-large" : "server-error",
      tooLarge ? "That assessment is too large to save." : "EaseITR could not complete that request.",
      origin,
    );
  }
});

const port = Number(process.env.PORT || 8080);
server.listen(port, () => log("listening"));
