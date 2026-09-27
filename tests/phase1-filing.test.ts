import { describe, expect, it } from "vitest";
import { EMPTY_ASSESSMENT } from "@/lib/domain/constants";
import {
  applyCapitalGainLines,
  caQuestions,
  documentNeeds,
  importAcceptedFields,
  normalizeAssessment,
  resolveMismatch,
  selfFileBlockers,
  statementMismatches,
} from "@/lib/domain/filing";
import type { UploadedDocument } from "@/lib/domain/types";

function statement(
  type: UploadedDocument["type"],
  fields: UploadedDocument["fields"],
): UploadedDocument {
  return {
    id: `doc-${type}`,
    name: `${type}.pdf`,
    type,
    mimeType: "application/pdf",
    size: 1000,
    status: "complete",
    progress: 100,
    detectedType: type,
    ocrText: null,
    fields,
    tables: [],
    processingErrors: [],
    modelVersion: "mock-extractor-0.1",
    extractedAt: "2026-09-27T00:00:00.000Z",
  };
}

describe("phase 1 filing helpers", () => {
  it("locks a non-resident assessment to the CA path", () => {
    const data = normalizeAssessment({
      ...EMPTY_ASSESSMENT,
      filingMode: "self-file",
      selfFileReady: true,
      profile: {
        ...EMPTY_ASSESSMENT.profile,
        residentialStatus: "non-resident",
      },
    });
    expect(data.filingMode).toBe("ca-pack");
    expect(data.selfFileReady).toBe(false);
    expect(caQuestions(data).join(" ")).toMatch(/residency/i);
  });

  it("imports an accepted salary figure and records the source", () => {
    const data = importAcceptedFields(
      EMPTY_ASSESSMENT,
      statement("form-16", [
        {
          id: "salary",
          category: "salary-component",
          label: "Gross salary",
          rawValue: "1284000",
          normalizedValue: 1284000,
          confidence: 0.9,
          source: null,
          verificationStatus: "accepted",
          isSensitive: false,
        },
      ]),
    );
    expect(data.salary.grossSalary).toBe(1284000);
    expect(data.importedFields[0]?.documentName).toBe("form-16.pdf");
  });

  it("keeps a salary mismatch open until a resolution is chosen", () => {
    const uploaded = importAcceptedFields(
      EMPTY_ASSESSMENT,
      statement("form-16", [
        {
          id: "salary",
          category: "salary-component",
          label: "Gross salary",
          rawValue: "1284000",
          normalizedValue: 1284000,
          confidence: 0.9,
          source: null,
          verificationStatus: "unverified",
          isSensitive: false,
        },
      ]),
    );
    expect(statementMismatches(uploaded)[0]?.resolution).toBe("open");
    expect(selfFileBlockers(uploaded).join(" ")).toMatch(/Gross salary/);
    const kept = resolveMismatch(uploaded, "form-16:salary", "keep-entered");
    expect(statementMismatches(kept)[0]?.resolution).toBe("keep-entered");
    expect(kept.salary.grossSalary).toBe(0);
  });

  it("expects Form 16 when salary is selected and no statement is reviewed", () => {
    const needs = documentNeeds(EMPTY_ASSESSMENT);
    expect(needs.find((item) => item.type === "form-16")?.state).toBe("missing");
  });

  it("rolls a long equity holding into long-term gains", () => {
    const rolled = applyCapitalGainLines({
      ...EMPTY_ASSESSMENT,
      capitalGainLines: [
        {
          id: "line-1",
          assetType: "equity-share",
          purchaseDate: "2023-01-01",
          saleDate: "2025-06-01",
          cost: 100000,
          saleValue: 180000,
        },
      ],
    });
    expect(rolled.capitalGains.longTermGains).toBe(80000);
    expect(rolled.capitalGains.shortTermGains).toBe(0);
    expect(rolled.capitalGains.hasEquityShares).toBe(true);
  });
});
