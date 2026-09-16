import { EMPTY_ASSESSMENT } from "@/lib/domain/constants";
import type { AssessmentData } from "@/lib/domain/types";

function createSeed(overrides: Partial<AssessmentData>): AssessmentData {
  return {
    ...structuredClone(EMPTY_ASSESSMENT),
    ...overrides,
    profile: { ...EMPTY_ASSESSMENT.profile, ...overrides.profile },
    salary: { ...EMPTY_ASSESSMENT.salary, ...overrides.salary },
    capitalGains: {
      ...EMPTY_ASSESSMENT.capitalGains,
      ...overrides.capitalGains,
    },
    trading: { ...EMPTY_ASSESSMENT.trading, ...overrides.trading },
    business: { ...EMPTY_ASSESSMENT.business, ...overrides.business },
    otherIncome: { ...EMPTY_ASSESSMENT.otherIncome, ...overrides.otherIncome },
    taxPayments: { ...EMPTY_ASSESSMENT.taxPayments, ...overrides.taxPayments },
    updatedAt: new Date().toISOString(),
  };
}

export const sampleProfiles = {
  salaried: createSeed({
    id: "sample-salaried",
    status: "review",
    incomeSources: ["salary", "other"],
    salary: {
      ...EMPTY_ASSESSMENT.salary,
      grossSalary: 1284000,
      allowances: 96000,
      exemptIncome: 24000,
      professionalTax: 2400,
    },
    otherIncome: {
      ...EMPTY_ASSESSMENT.otherIncome,
      savingsInterest: 14000,
      fixedDepositInterest: 32000,
    },
    deductions: [
      {
        id: "80c",
        section: "80C",
        label: "Investments and eligible payments",
        amount: 150000,
      },
      { id: "80d", section: "80D", label: "Health insurance", amount: 25000 },
    ],
    taxPayments: { tds: 82400, tcs: 0, advanceTax: 0, selfAssessmentTax: 0 },
  }),
  investor: createSeed({
    id: "sample-investor",
    status: "review",
    incomeSources: ["salary", "capital-gains", "other"],
    salary: { ...EMPTY_ASSESSMENT.salary, grossSalary: 1680000 },
    capitalGains: {
      ...EMPTY_ASSESSMENT.capitalGains,
      hasEquityShares: true,
      hasEquityMutualFunds: true,
      shortTermGains: 92000,
      longTermGains: 148000,
      transactionCount: 34,
    },
    otherIncome: {
      ...EMPTY_ASSESSMENT.otherIncome,
      dividends: 22000,
      savingsInterest: 16000,
    },
    taxPayments: {
      tds: 112000,
      tcs: 0,
      advanceTax: 15000,
      selfAssessmentTax: 0,
    },
  }),
  trader: createSeed({
    id: "sample-trader",
    status: "review",
    incomeSources: ["salary", "fo", "intraday", "other"],
    salary: { ...EMPTY_ASSESSMENT.salary, grossSalary: 920000 },
    trading: {
      ...EMPTY_ASSESSMENT.trading,
      intradayTrading: true,
      futuresAndOptions: true,
      turnover: 4600000,
      profitOrLoss: 286000,
      businessExpenses: 64000,
      maintainsBooks: true,
      auditMayApply: true,
    },
    taxPayments: {
      tds: 52000,
      tcs: 0,
      advanceTax: 28000,
      selfAssessmentTax: 0,
    },
  }),
  freelancer: createSeed({
    id: "sample-freelancer",
    status: "review",
    profile: { ...EMPTY_ASSESSMENT.profile, employmentStatus: "self-employed" },
    incomeSources: ["freelance", "other"],
    business: {
      ...EMPTY_ASSESSMENT.business,
      activityType: "freelance",
      activityDescription: "Product design consulting",
      grossReceipts: 1840000,
      netProfit: 920000,
      prefersPresumptive: true,
      eligibleForPresumptive: true,
    },
    taxPayments: { tds: 184000, tcs: 0, advanceTax: 0, selfAssessmentTax: 0 },
  }),
} satisfies Record<string, AssessmentData>;
