import { recommendItr } from "@/lib/domain/itr-rules";
import { compareRegimes } from "@/lib/domain/tax-engine";
import type { AssessmentData, RegimeComparison } from "@/lib/domain/types";
import type {
  ITRRecommendationService,
  TaxCalculationService,
} from "../interfaces";

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export function compareSampleRegimes(data: AssessmentData): RegimeComparison {
  return compareRegimes(data);
}

export const mockTaxCalculationService: TaxCalculationService = {
  async compareRegimes(data) {
    await wait(180);
    return compareRegimes(data);
  },
};

export const mockITRRecommendationService: ITRRecommendationService = {
  async recommend(data) {
    await wait(180);
    return recommendItr(data);
  },
};
