import type { AssessmentData } from "./types";

export const STORAGE_KEY = "easeitr-assessment-v1";

export const WIZARD_STEPS = [
  { slug: "profile", label: "Basic taxpayer profile", shortLabel: "Profile", optional: false },
  { slug: "salary", label: "Salary & pension", shortLabel: "Salary", optional: false },
  { slug: "property", label: "House property", shortLabel: "Property", optional: true },
  { slug: "capital-gains", label: "Capital gains", shortLabel: "Gains", optional: true },
  { slug: "trading", label: "Trading activity", shortLabel: "Trading", optional: true },
  { slug: "business", label: "Business & profession", shortLabel: "Business", optional: true },
  { slug: "other-income", label: "Other income", shortLabel: "Other", optional: true },
  { slug: "deductions", label: "Deductions", shortLabel: "Deductions", optional: true },
  { slug: "tax-payments", label: "TDS, TCS & taxes paid", shortLabel: "Taxes paid", optional: true },
  { slug: "review", label: "Review & confirm", shortLabel: "Review", optional: false },
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
  skippedSections: [],
  sectionStatuses: {},
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
