import type {
  DocumentType,
  ExtractedDocumentField,
  UploadedDocument,
} from "@/lib/domain/types";
import type { DocumentExtractionService } from "../interfaces";

const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_SIZE = 10 * 1024 * 1024;

function mockField(
  partial: Pick<ExtractedDocumentField, "id" | "category" | "label" | "rawValue" | "normalizedValue" | "confidence"> &
    Partial<ExtractedDocumentField>,
): ExtractedDocumentField {
  return {
    source: { page: 1, x: 0.2, y: 0.2, width: 0.3, height: 0.04 },
    verificationStatus: "unverified",
    isSensitive: false,
    ...partial,
  };
}

function fieldsFor(documentType: DocumentType): ExtractedDocumentField[] {
  if (documentType === "form-16") {
    return [
      mockField({
        id: "name",
        category: "person-name",
        label: "Employee name",
        rawValue: "Sample Taxpayer",
        normalizedValue: "Sample Taxpayer",
        confidence: 0.98,
        source: { page: 1, x: 0.12, y: 0.18, width: 0.35, height: 0.04 },
      }),
      mockField({
        id: "pan",
        category: "pan",
        label: "PAN",
        rawValue: "ABCDE1234F",
        normalizedValue: "•••••1234•",
        confidence: 0.91,
        source: { page: 1, x: 0.64, y: 0.18, width: 0.2, height: 0.04 },
        isSensitive: true,
      }),
      mockField({
        id: "employer",
        category: "employer-name",
        label: "Employer",
        rawValue: "Example Technologies Pvt Ltd",
        normalizedValue: "Example Technologies Pvt Ltd",
        confidence: 0.96,
        source: { page: 1, x: 0.12, y: 0.32, width: 0.5, height: 0.05 },
      }),
      mockField({
        id: "salary",
        category: "salary-component",
        label: "Gross salary",
        rawValue: "1284000",
        normalizedValue: 1284000,
        confidence: 0.87,
        source: { page: 2, x: 0.58, y: 0.4, width: 0.2, height: 0.04 },
      }),
      mockField({
        id: "tds",
        category: "tds",
        label: "TDS deducted",
        rawValue: "82400",
        normalizedValue: 82400,
        confidence: 0.74,
        source: { page: 2, x: 0.58, y: 0.62, width: 0.2, height: 0.04 },
      }),
    ];
  }
  if (documentType === "form-26as") {
    return [
      mockField({
        id: "tds",
        category: "tds",
        label: "TDS as per Form 26AS",
        rawValue: "80000",
        normalizedValue: 80000,
        confidence: 0.93,
      }),
      mockField({
        id: "name",
        category: "person-name",
        label: "Deductee name",
        rawValue: "Sample Taxpayer",
        normalizedValue: "Sample Taxpayer",
        confidence: 0.7,
      }),
    ];
  }
  if (documentType === "ais") {
    return [
      mockField({
        id: "savings-interest",
        category: "total-amount",
        label: "Savings interest reported in AIS",
        rawValue: "18000",
        normalizedValue: 18000,
        confidence: 0.72,
      }),
      mockField({
        id: "fd-interest",
        category: "total-amount",
        label: "Fixed-deposit interest reported in AIS",
        rawValue: "32000",
        normalizedValue: 32000,
        confidence: 0.9,
      }),
    ];
  }
  if (documentType === "broker-capital-gains") {
    return [
      mockField({
        id: "stcg",
        category: "profit-loss",
        label: "Short-term equity gains",
        rawValue: "92000",
        normalizedValue: 92000,
        confidence: 0.88,
      }),
      mockField({
        id: "ltcg",
        category: "profit-loss",
        label: "Long-term equity gains",
        rawValue: "148000",
        normalizedValue: 148000,
        confidence: 0.76,
      }),
    ];
  }
  if (documentType === "home-loan-interest") {
    return [
      mockField({
        id: "loan-interest",
        category: "total-amount",
        label: "Home-loan interest",
        rawValue: "186000",
        normalizedValue: 186000,
        confidence: 0.84,
      }),
    ];
  }
  if (documentType === "expense-bill") {
    return [
      mockField({
        id: "vendor",
        category: "vendor-name",
        label: "Vendor",
        rawValue: "Sample Client",
        normalizedValue: "Sample Client",
        confidence: 0.9,
      }),
      mockField({
        id: "invoice",
        category: "invoice-number",
        label: "Invoice number",
        rawValue: "INV-204",
        normalizedValue: "INV-204",
        confidence: 0.66,
      }),
      mockField({
        id: "bill-total",
        category: "total-amount",
        label: "Bill amount",
        rawValue: "45000",
        normalizedValue: 45000,
        confidence: 0.81,
      }),
    ];
  }
  return [
    mockField({
      id: "name",
      category: "person-name",
      label: "Name on document",
      rawValue: "Sample Taxpayer",
      normalizedValue: "Sample Taxpayer",
      confidence: 0.9,
    }),
    mockField({
      id: "amount",
      category: "total-amount",
      label: "Amount shown",
      rawValue: "12000",
      normalizedValue: 12000,
      confidence: 0.73,
    }),
  ];
}

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
      fields: fieldsFor(documentType),
      tables: [],
      processingErrors: [],
      modelVersion: "mock-extractor-0.1",
      extractedAt: new Date().toISOString(),
    } satisfies UploadedDocument;
  },
};
