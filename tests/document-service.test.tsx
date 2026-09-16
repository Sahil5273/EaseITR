import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExtractionStatus } from "@/components/easeitr/document-centre";
import { mockDocumentExtractionService } from "@/lib/services/mocks/document-service";

describe("document upload validation and extraction", () => {
  it("rejects unsupported types and oversized files", () => {
    expect(
      mockDocumentExtractionService.validate({
        name: "notes.txt",
        type: "text/plain",
        size: 100,
      }).valid,
    ).toBe(false);
    expect(
      mockDocumentExtractionService.validate({
        name: "large.pdf",
        type: "application/pdf",
        size: 11 * 1024 * 1024,
      }).valid,
    ).toBe(false);
  });

  it("returns a typed completed mock extraction", async () => {
    const result = await mockDocumentExtractionService.extract(
      { name: "sample.pdf", type: "application/pdf", size: 1000 },
      "form-16",
    );
    expect(result.status).toBe("complete");
    expect(result.modelVersion).toBe("mock-extractor-0.1");
    expect(result.fields.some((field) => field.confidence < 0.8)).toBe(true);
  });

  it("announces upload, processing, completion and failure states", () => {
    const { rerender } = render(
      <ExtractionStatus status="uploading" progress={48} />,
    );
    expect(screen.getByText(/Uploading · 48%/)).toBeInTheDocument();
    rerender(<ExtractionStatus status="processing" progress={100} />);
    expect(screen.getByText(/Mock extraction in progress/)).toBeInTheDocument();
    rerender(<ExtractionStatus status="complete" progress={100} />);
    expect(screen.getByText(/Extraction complete/)).toBeInTheDocument();
    rerender(<ExtractionStatus status="failed" progress={0} />);
    expect(screen.getByText(/Extraction failed/)).toBeInTheDocument();
  });
});
