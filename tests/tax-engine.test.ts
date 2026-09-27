import { describe, expect, it } from "vitest";
import { EMPTY_ASSESSMENT } from "@/lib/domain/constants";
import { recommendItr } from "@/lib/domain/itr-rules";
import { estimateTax } from "@/lib/domain/tax-engine";
import { sampleProfiles } from "@/lib/services/mocks/seed-data";
import type { AssessmentData } from "@/lib/domain/types";

function withIncome(patch: Partial<AssessmentData> & { ordinary?: number }): AssessmentData {
  return {
    ...structuredClone(EMPTY_ASSESSMENT),
    ...patch,
    profile: { ...EMPTY_ASSESSMENT.profile, ...patch.profile },
    salary: {
      ...EMPTY_ASSESSMENT.salary,
      grossSalary: patch.ordinary ?? patch.salary?.grossSalary ?? 0,
      standardDeduction: 0,
      professionalTax: 0,
      exemptIncome: 0,
      pensionIncome: 0,
      ...patch.salary,
    },
    otherIncome: { ...EMPTY_ASSESSMENT.otherIncome, ...patch.otherIncome },
    capitalGains: { ...EMPTY_ASSESSMENT.capitalGains, ...patch.capitalGains },
    deductions: patch.deductions ?? [],
  };
}

describe("assessment-year tax computation", () => {
  it("charges no new-regime tax at the ₹12 lakh rebate limit for AY 2026-27", () => {
    const tax = estimateTax(
      withIncome({
        salary: {
          ...EMPTY_ASSESSMENT.salary,
          grossSalary: 0,
          standardDeduction: 0,
          exemptIncome: 0,
          professionalTax: 0,
          pensionIncome: 0,
          allowances: 0,
          employerCount: 0,
        },
        otherIncome: { ...EMPTY_ASSESSMENT.otherIncome, miscellaneousIncome: 1_200_000 },
      }),
      "new",
    );
    expect(tax.estimatedTax).toBe(0);
  });

  it("applies marginal relief just above ₹12 lakh", () => {
    const tax = estimateTax(
      withIncome({
        salary: {
          ...EMPTY_ASSESSMENT.salary,
          grossSalary: 0,
          standardDeduction: 0,
          exemptIncome: 0,
          professionalTax: 0,
          pensionIncome: 0,
          allowances: 0,
          employerCount: 0,
        },
        otherIncome: { ...EMPTY_ASSESSMENT.otherIncome, miscellaneousIncome: 1_210_000 },
      }),
      "new",
    );
    expect(tax.estimatedTax).toBe(10_400);
  });

  it("gives a salaried person the ₹75,000 standard deduction before the rebate", () => {
    const tax = estimateTax(
      withIncome({
        salary: {
          ...EMPTY_ASSESSMENT.salary,
          grossSalary: 1_275_000,
          exemptIncome: 0,
          professionalTax: 0,
          pensionIncome: 0,
          allowances: 0,
          employerCount: 1,
          standardDeduction: 0,
        },
      }),
      "new",
    );
    expect(tax.estimatedTax).toBe(0);
  });

  it("rebates old-regime tax at ₹5 lakh for a resident under 60", () => {
    const tax = estimateTax(
      withIncome({
        salary: {
          ...EMPTY_ASSESSMENT.salary,
          grossSalary: 0,
          standardDeduction: 0,
          exemptIncome: 0,
          professionalTax: 0,
          pensionIncome: 0,
          allowances: 0,
          employerCount: 0,
        },
        otherIncome: { ...EMPTY_ASSESSMENT.otherIncome, miscellaneousIncome: 500_000 },
      }),
      "old",
    );
    expect(tax.estimatedTax).toBe(0);
  });

  it("taxes listed equity long-term gains above ₹1.25 lakh at 12.5% plus cess", () => {
    const tax = estimateTax(
      withIncome({
        salary: {
          ...EMPTY_ASSESSMENT.salary,
          grossSalary: 0,
          standardDeduction: 0,
          exemptIncome: 0,
          professionalTax: 0,
          pensionIncome: 0,
          allowances: 0,
          employerCount: 0,
        },
        capitalGains: {
          ...EMPTY_ASSESSMENT.capitalGains,
          hasEquityShares: true,
          longTermGains: 200_000,
        },
      }),
      "new",
    );
    expect(tax.estimatedTax).toBe(9_750);
  });

  it("computes the seeded salaried profile on the new regime", () => {
    expect(estimateTax(sampleProfiles.salaried, "new").estimatedTax).toBe(32_240);
    expect(estimateTax(sampleProfiles.salaried, "old").estimatedTax).toBe(141_523);
  });
});

describe("ITR eligibility gates", () => {
  it("recommends ITR-1 for the salaried profile and blocks the business forms", () => {
    const result = recommendItr(sampleProfiles.salaried);
    expect(result.form).toBe("ITR-1");
    expect(result.confidence).toBe("high");
    expect(result.alternatives.find((item) => item.form === "ITR-3")?.eligible).toBe(false);
    expect(result.alternatives.find((item) => item.form === "ITR-2")?.eligible).toBe(true);
  });

  it("recommends ITR-2 when capital gains are reported", () => {
    const result = recommendItr(sampleProfiles.investor);
    expect(result.form).toBe("ITR-2");
    expect(result.alternatives.find((item) => item.form === "ITR-1")?.reason).toMatch(/capital gains/i);
  });

  it("recommends ITR-3 and a CA review for the audited trader", () => {
    const result = recommendItr(sampleProfiles.trader);
    expect(result.form).toBe("ITR-3");
    expect(result.requiresProfessionalReview).toBe(true);
  });

  it("recommends ITR-4 when presumptive taxation is marked", () => {
    const result = recommendItr(sampleProfiles.freelancer);
    expect(result.form).toBe("ITR-4");
    expect(result.confidence).toBe("medium");
  });

  it("blocks ITR-1 for a company director", () => {
    const result = recommendItr({
      ...sampleProfiles.salaried,
      profile: { ...sampleProfiles.salaried.profile, isCompanyDirector: true },
    });
    expect(result.form).not.toBe("ITR-1");
    expect(result.rules.find((rule) => rule.id === "director")?.outcome).toBe("excludes");
  });
});
