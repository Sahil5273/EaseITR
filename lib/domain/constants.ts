import type { AssessmentData } from "./types";

export const STORAGE_KEY = "easeitr-assessment-v1";

export const WIZARD_STEPS = [
  { slug: "profile", label: "Basic profile", shortLabel: "Profile" },
  { slug: "salary", label: "Salary & pension", shortLabel: "Salary" },
  { slug: "property", label: "House property", shortLabel: "Property" },
  { slug: "capital-gains", label: "Capital gains", shortLabel: "Gains" },
  { slug: "trading", label: "Trading activity", shortLabel: "Trading" },
  { slug: "business", label: "Business & profession", shortLabel: "Business" },
  { slug: "other-income", label: "Other income", shortLabel: "Other" },
  { slug: "deductions", label: "Deductions & taxes", shortLabel: "Taxes" },
  { slug: "review", label: "Review", shortLabel: "Review" },
] as const;

export type WizardStepSlug = (typeof WIZARD_STEPS)[number]["slug"];

export const EMPTY_ASSESSMENT: AssessmentData = {
  id: "local-assessment",
  status: "not-started",
  currentStep: "profile",
  profile: {
    assessmentYear: "2026-27",
    taxpayerType: "individual",
    residentialStatus: "resident",
    ageCategory: "below-60",
    employmentStatus: "salaried",
    isCompanyDirector: false,
    heldUnlistedShares: false,
    hasForeignAssets: false,
    hasForeignIncome: false,
  },
  incomeSources: ["salary"],
  salary: {
    employerCount: 1,
    grossSalary: 0,
    allowances: 0,
    exemptIncome: 0,
    professionalTax: 0,
    standardDeduction: 75000,
    pensionIncome: 0,
  },
  houseProperty: {
    propertyCount: 0,
    occupancy: "self-occupied",
    rentReceived: 0,
    municipalTaxes: 0,
    loanInterest: 0,
  },
  capitalGains: {
    hasEquityShares: false,
    hasEquityMutualFunds: false,
    hasPropertySale: false,
    hasOtherAssets: false,
    shortTermGains: 0,
    longTermGains: 0,
    transactionCount: 0,
    capitalLosses: 0,
  },
  trading: {
    deliveryTrading: false,
    intradayTrading: false,
    futuresAndOptions: false,
    turnover: 0,
    profitOrLoss: 0,
    businessExpenses: 0,
    maintainsBooks: false,
    auditMayApply: false,
  },
  business: {
    activityType: "none",
    activityDescription: "",
    grossReceipts: 0,
    netProfit: 0,
    prefersPresumptive: false,
    eligibleForPresumptive: false,
  },
  otherIncome: {
    savingsInterest: 0,
    fixedDepositInterest: 0,
    dividends: 0,
    familyPension: 0,
    miscellaneousIncome: 0,
    lotteryIncome: 0,
  },
  deductions: [
    {
      id: "80c",
      section: "80C",
      label: "Investments and eligible payments",
      amount: 0,
    },
    { id: "80d", section: "80D", label: "Health insurance", amount: 0 },
    {
      id: "nps",
      section: "NPS",
      label: "Additional NPS contribution",
      amount: 0,
    },
  ],
  taxPayments: { tds: 0, tcs: 0, advanceTax: 0, selfAssessmentTax: 0 },
  regimePreference: "undecided",
  reviewFlags: [],
  confirmed: false,
  updatedAt: "",
};

export const formatINR = (value: number, compact = false) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
