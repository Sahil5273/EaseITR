import { describe, expect, it } from "vitest";
import { detectDocumentType, fieldsFromPairs, maskPan, pairsFromLabeledLines } from "@/lib/services/document-map";

describe("document field mapping", () => {
  it("maps a Form 16 into the review fields and masks PAN", () => {
    const fields = fieldsFromPairs("form-16", [
      { key: "Gross Salary", value: "12,84,000", confidence: 0.91 },
      { key: "Tax deducted at source", value: "82,400", confidence: 0.7 },
      { key: "PAN of the employee", value: "ABCDE1234F", confidence: 0.95 },
    ]);
    const salary = fields.find((field) => field.id === "salary");
    const tds = fields.find((field) => field.id === "tds");
    const pan = fields.find((field) => field.id === "pan");
    expect(salary?.normalizedValue).toBe(1284000);
    expect(tds?.normalizedValue).toBe(82400);
    expect(tds?.verificationStatus).toBe("unverified");
    expect(pan?.rawValue).toBe("•••••1234•");
    expect(pan?.normalizedValue).toBe("•••••1234•");
    expect(pan?.rawValue).not.toContain("ABCDE");
  });

  it("keeps a low-confidence bill category unverified", () => {
    const fields = fieldsFromPairs("expense-bill", [
      { key: "supplier_name", value: "Harbour Studio", confidence: 0.93 },
      { key: "invoice_id", value: "INV-204", confidence: 0.66 },
      { key: "invoice_date", value: "12 Mar 2026", confidence: 0.88 },
      { key: "total_amount", value: "₹45,000", confidence: 0.9 },
      { key: "line_item/description", value: "Design software subscription", confidence: 0.8 },
    ]);
    expect(fields.find((field) => field.id === "vendor")?.normalizedValue).toBe(
      "Harbour Studio",
    );
    expect(fields.find((field) => field.id === "bill-total")?.normalizedValue).toBe(45000);
    const category = fields.find((field) => field.id === "category");
    expect(category?.normalizedValue).toBe("Software");
    expect(category?.confidence).toBeLessThan(0.8);
    expect(category?.verificationStatus).toBe("unverified");
  });

  it("splits short-term and long-term broker gains", () => {
    const fields = fieldsFromPairs("broker-capital-gains", [
      { key: "Short-term capital gain", value: "92000", confidence: 0.88 },
      { key: "Long-term capital gain", value: "1,48,000", confidence: 0.76 },
    ]);
    expect(fields.find((field) => field.id === "stcg")?.normalizedValue).toBe(92000);
    expect(fields.find((field) => field.id === "ltcg")?.normalizedValue).toBe(148000);
  });

  it("masks a PAN wherever it is recognised", () => {
    expect(maskPan("pan ABCDE1234F on file")).toBe("•••••1234•");
  });

  it("reads a typed sample Form 16 line by line", () => {
    const fields = fieldsFromPairs(
      "form-16",
      pairsFromLabeledLines(
        "Employee name: Asha Mehta\nPAN: ABCDE1234F\nEmployer: Example Technologies Pvt Ltd\nGross salary: 1284000\nTax deducted: 82400",
      ),
    );
    expect(fields.find((field) => field.id === "salary")?.normalizedValue).toBe(1284000);
    expect(fields.find((field) => field.id === "tds")?.normalizedValue).toBe(82400);
    expect(fields.find((field) => field.id === "pan")?.normalizedValue).toBe("•••••1234•");
  });

  it("chooses a document type from the labels on the page", () => {
    const sample =
      "Sample Form 16\nEmployee name: Asha Mehta\nPAN: ABCDE1234F\nEmployer: Example Technologies Pvt Ltd\nGross salary: 1284000\nTax deducted: 82400";
    expect(detectDocumentType(pairsFromLabeledLines(sample), sample)).toBe("form-16");
    expect(
      detectDocumentType([], "Form 26AS\nTax credit statement\nTax deducted: 82400"),
    ).toBe("form-26as");
    expect(detectDocumentType([], "Annual Information Statement\nSavings interest: 4200")).toBe(
      "ais",
    );
    expect(detectDocumentType([], "Short-term capital gain 15000")).toBe("broker-capital-gains");
    expect(detectDocumentType([], "Tax invoice\nInvoice number: 18")).toBe("expense-bill");
    expect(detectDocumentType([], "A holiday photo of the sea")).toBeNull();
  });
});
