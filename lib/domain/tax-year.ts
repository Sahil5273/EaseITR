import type { AgeCategory, AssessmentYear } from "@/lib/domain/types";

export interface Slab {
  upTo: number;
  rate: number;
}

export interface TaxYearRules {
  year: AssessmentYear;
  label: string;
  newRegimeSlabs: Slab[];
  /** Normal income up to this amount can get the new-regime rebate. */
  newRebateIncome: number;
  newRebateCap: number;
  newStandardDeduction: number;
  oldStandardDeduction: number;
  /** Listed-equity short-term rate under section 111A. */
  equityShortTermRate: number;
  /** Listed-equity long-term rate under section 112A. */
  equityLongTermRate: number;
  equityLongTermExemption: number;
  /** Other long-term gains. Indexation is not computed. */
  otherLongTermRate: number;
  familyPensionCapNew: number;
  familyPensionCapOld: number;
}

const OLD_STANDARD = 50_000;
const FAMILY_PENSION_OLD = 15_000;

/**
 * Slabs follow the Income Tax Department Budget 2025 FAQ and PIB release for
 * AY 2026-27, and the Finance (No. 2) Act, 2024 slabs for AY 2025-26.
 * AY 2024-25 uses the section 115BAC slabs introduced for FY 2023-24.
 */
export const TAX_YEARS: Record<AssessmentYear, TaxYearRules> = {
  "2024-25": {
    year: "2024-25",
    label: "Assessment year 2024-25",
    newRegimeSlabs: [
      { upTo: 300_000, rate: 0 },
      { upTo: 600_000, rate: 0.05 },
      { upTo: 900_000, rate: 0.1 },
      { upTo: 1_200_000, rate: 0.15 },
      { upTo: 1_500_000, rate: 0.2 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.3 },
    ],
    newRebateIncome: 700_000,
    newRebateCap: 25_000,
    newStandardDeduction: 50_000,
    oldStandardDeduction: OLD_STANDARD,
    equityShortTermRate: 0.15,
    equityLongTermRate: 0.1,
    equityLongTermExemption: 100_000,
    otherLongTermRate: 0.2,
    familyPensionCapNew: FAMILY_PENSION_OLD,
    familyPensionCapOld: FAMILY_PENSION_OLD,
  },
  "2025-26": {
    year: "2025-26",
    label: "Assessment year 2025-26",
    newRegimeSlabs: [
      { upTo: 300_000, rate: 0 },
      { upTo: 700_000, rate: 0.05 },
      { upTo: 1_000_000, rate: 0.1 },
      { upTo: 1_200_000, rate: 0.15 },
      { upTo: 1_500_000, rate: 0.2 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.3 },
    ],
    newRebateIncome: 700_000,
    newRebateCap: 25_000,
    newStandardDeduction: 75_000,
    oldStandardDeduction: OLD_STANDARD,
    equityShortTermRate: 0.2,
    equityLongTermRate: 0.125,
    equityLongTermExemption: 125_000,
    otherLongTermRate: 0.125,
    familyPensionCapNew: 25_000,
    familyPensionCapOld: FAMILY_PENSION_OLD,
  },
  "2026-27": {
    year: "2026-27",
    label: "Assessment year 2026-27",
    newRegimeSlabs: [
      { upTo: 400_000, rate: 0 },
      { upTo: 800_000, rate: 0.05 },
      { upTo: 1_200_000, rate: 0.1 },
      { upTo: 1_600_000, rate: 0.15 },
      { upTo: 2_000_000, rate: 0.2 },
      { upTo: 2_400_000, rate: 0.25 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.3 },
    ],
    newRebateIncome: 1_200_000,
    newRebateCap: 60_000,
    newStandardDeduction: 75_000,
    oldStandardDeduction: OLD_STANDARD,
    equityShortTermRate: 0.2,
    equityLongTermRate: 0.125,
    equityLongTermExemption: 125_000,
    otherLongTermRate: 0.125,
    familyPensionCapNew: 25_000,
    familyPensionCapOld: FAMILY_PENSION_OLD,
  },
};

export function oldRegimeSlabs(age: AgeCategory): Slab[] {
  if (age === "80-plus") {
    return [
      { upTo: 500_000, rate: 0 },
      { upTo: 1_000_000, rate: 0.2 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.3 },
    ];
  }
  if (age === "60-79") {
    return [
      { upTo: 300_000, rate: 0 },
      { upTo: 500_000, rate: 0.05 },
      { upTo: 1_000_000, rate: 0.2 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.3 },
    ];
  }
  return [
    { upTo: 250_000, rate: 0 },
    { upTo: 500_000, rate: 0.05 },
    { upTo: 1_000_000, rate: 0.2 },
    { upTo: Number.POSITIVE_INFINITY, rate: 0.3 },
  ];
}

export function taxOnSlabs(income: number, slabs: Slab[]) {
  const taxable = Math.max(0, income);
  let tax = 0;
  let previous = 0;
  for (const slab of slabs) {
    if (taxable <= previous) break;
    const slice = Math.min(taxable, slab.upTo) - previous;
    tax += slice * slab.rate;
    previous = slab.upTo;
  }
  return tax;
}
