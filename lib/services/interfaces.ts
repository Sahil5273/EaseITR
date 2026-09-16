import type {
  AssessmentData,
  DocumentType,
  ITRRecommendation,
  RegimeComparison,
  UploadedDocument,
} from "@/lib/domain/types";

export interface AssessmentService {
  load(): AssessmentData | null;
  save(data: AssessmentData): void;
  clear(): void;
  export(data: AssessmentData): string;
}

export interface DocumentExtractionService {
  validate(file: Pick<File, "name" | "size" | "type">): {
    valid: boolean;
    error?: string;
  };
  extract(
    file: Pick<File, "name" | "size" | "type">,
    documentType: DocumentType,
  ): Promise<UploadedDocument>;
}

export interface TaxCalculationService {
  compareRegimes(data: AssessmentData): Promise<RegimeComparison>;
}

export interface ITRRecommendationService {
  recommend(data: AssessmentData): Promise<ITRRecommendation>;
}
