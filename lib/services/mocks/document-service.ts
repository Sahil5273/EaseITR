import type { DocumentType, UploadedDocument } from "@/lib/domain/types";
import type { DocumentExtractionService } from "../interfaces";

const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_SIZE = 10 * 1024 * 1024;

export const mockDocumentExtractionService: DocumentExtractionService = {
  validate(file) {
    if (!ACCEPTED_TYPES.includes(file.type))
      return { valid: false, error: "Choose a PDF, PNG or JPG file." };
    if (file.size > MAX_SIZE)
      return { valid: false, error: "File size must be 10 MB or less." };
    return { valid: true };
  },
  async extract(file, documentType: DocumentType) {
    await new Promise((resolve) => setTimeout(resolve, 1400));
    return {
      id: `mock-${Date.now()}`,
      name: file.name,
      type: documentType,
      mimeType: file.type,
      size: file.size,
      status: "complete",
      progress: 100,
      detectedType: documentType,
      ocrText: "Mock OCR text for interface demonstration only.",
      fields: [
        {
          id: "name",
          category: "person-name",
          label: "Employee name",
          rawValue: "Sample Taxpayer",
          normalizedValue: "Sample Taxpayer",
          confidence: 0.98,
          source: { page: 1, x: 0.12, y: 0.18, width: 0.35, height: 0.04 },
          verificationStatus: "unverified",
          isSensitive: false,
        },
        {
          id: "pan",
          category: "pan",
          label: "PAN",
          rawValue: "ABCDE1234F",
          normalizedValue: "•••••1234•",
          confidence: 0.91,
          source: { page: 1, x: 0.64, y: 0.18, width: 0.2, height: 0.04 },
          verificationStatus: "unverified",
          isSensitive: true,
        },
        {
          id: "employer",
          category: "employer-name",
          label: "Employer",
          rawValue: "Example Technologies Pvt Ltd",
          normalizedValue: "Example Technologies Pvt Ltd",
          confidence: 0.96,
          source: { page: 1, x: 0.12, y: 0.32, width: 0.5, height: 0.05 },
          verificationStatus: "unverified",
          isSensitive: false,
        },
        {
          id: "salary",
          category: "salary-component",
          label: "Gross salary",
          rawValue: "1284000",
          normalizedValue: 1284000,
          confidence: 0.87,
          source: { page: 2, x: 0.58, y: 0.4, width: 0.2, height: 0.04 },
          verificationStatus: "unverified",
          isSensitive: false,
        },
        {
          id: "tds",
          category: "tds",
          label: "TDS deducted",
          rawValue: "82400",
          normalizedValue: 82400,
          confidence: 0.74,
          source: { page: 2, x: 0.58, y: 0.62, width: 0.2, height: 0.04 },
          verificationStatus: "unverified",
          isSensitive: false,
        },
      ],
      tables: [],
      processingErrors: [],
      modelVersion: "mock-extractor-0.1",
      extractedAt: new Date().toISOString(),
    } satisfies UploadedDocument;
  },
};
