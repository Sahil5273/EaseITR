export type AssessmentYear = "2026-27" | "2025-26" | "2024-25";
export type ResidentialStatus =
  "resident" | "non-resident" | "not-ordinary-resident";
export type TaxpayerType = "individual" | "huf";
export type AgeCategory = "below-60" | "60-79" | "80-plus";
export type Regime = "old" | "new" | "undecided";
export type ITRForm =
  "ITR-1" | "ITR-2" | "ITR-3" | "ITR-4" | "Professional review";
export type AssessmentStatus =
  "not-started" | "in-progress" | "review" | "complete";

export type IncomeSource =
  | "salary"
  | "pension"
  | "house-property"
  | "capital-gains"
  | "delivery-trading"
  | "intraday"
  | "fo"
  | "freelance"
  | "business"
  | "other";

export interface TaxpayerProfile {
  assessmentYear: AssessmentYear;
  taxpayerType: TaxpayerType;
  residentialStatus: ResidentialStatus;
  ageCategory: AgeCategory;
  employmentStatus: "salaried" | "self-employed" | "retired" | "other";
  isCompanyDirector: boolean;
  heldUnlistedShares: boolean;
  hasForeignAssets: boolean;
  hasForeignIncome: boolean;
}

export interface SalaryIncome {
  employerCount: number;
  grossSalary: number;
  allowances: number;
  exemptIncome: number;
  professionalTax: number;
  standardDeduction: number;
  pensionIncome: number;
}

export interface HousePropertyIncome {
  propertyCount: number;
  occupancy: "self-occupied" | "let-out" | "both";
  rentReceived: number;
  municipalTaxes: number;
  loanInterest: number;
}

export interface CapitalGains {
  hasEquityShares: boolean;
  hasEquityMutualFunds: boolean;
  hasPropertySale: boolean;
  hasOtherAssets: boolean;
  shortTermGains: number;
  longTermGains: number;
  transactionCount: number;
  capitalLosses: number;
}

export interface TradingIncome {
  deliveryTrading: boolean;
  intradayTrading: boolean;
  futuresAndOptions: boolean;
  turnover: number;
  profitOrLoss: number;
  businessExpenses: number;
  maintainsBooks: boolean;
  auditMayApply: boolean;
}

export interface BusinessProfessionalIncome {
  activityType: "freelance" | "professional" | "small-business" | "none";
  activityDescription: string;
  grossReceipts: number;
  netProfit: number;
  prefersPresumptive: boolean;
  eligibleForPresumptive: boolean;
}

export interface OtherIncome {
  savingsInterest: number;
  fixedDepositInterest: number;
  dividends: number;
  familyPension: number;
  miscellaneousIncome: number;
  lotteryIncome: number;
}

export interface Deduction {
  id: string;
  section: "80C" | "80D" | "80G" | "80TTA" | "NPS" | "other";
  label: string;
  amount: number;
}

export interface TaxPayment {
  tds: number;
  tcs: number;
  advanceTax: number;
  selfAssessmentTax: number;
}

export interface PageCoordinate {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type DocumentType =
  | "form-16"
  | "form-26as"
  | "ais"
  | "tis"
  | "broker-capital-gains"
  | "trading-pnl"
  | "bank-interest"
  | "home-loan-interest"
  | "rent-receipt"
  | "donation-receipt"
  | "insurance-proof"
  | "investment-proof";

export type DocumentStatus =
  "idle" | "uploading" | "processing" | "complete" | "failed";
export type VerificationStatus =
  "unverified" | "accepted" | "edited" | "rejected";

export interface ExtractedDocumentField {
  id: string;
  category:
    | "person-name"
    | "pan"
    | "employer-name"
    | "financial-year"
    | "assessment-year"
    | "salary-component"
    | "tds"
    | "deduction-section"
    | "deduction-amount"
    | "transaction-date"
    | "asset-name"
    | "sale-value"
    | "purchase-value"
    | "profit-loss"
    | "broker-charges"
    | "gst-charges"
    | "invoice-number"
    | "bill-date"
    | "vendor-name"
    | "expense-category"
    | "total-amount";
  label: string;
  rawValue: string;
  normalizedValue: string | number | null;
  confidence: number;
  source: PageCoordinate | null;
  verificationStatus: VerificationStatus;
  isSensitive: boolean;
}

export interface ExtractedTable {
  id: string;
  page: number;
  columns: string[];
  rows: Array<Record<string, string | number>>;
  confidence: number;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: DocumentType;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  progress: number;
  detectedType: DocumentType | null;
  ocrText: string | null;
  fields: ExtractedDocumentField[];
  tables: ExtractedTable[];
  processingErrors: string[];
  modelVersion: string | null;
  extractedAt: string | null;
}

export interface RuleExplanation {
  id: string;
  title: string;
  explanation: string;
  outcome: "supports" | "excludes" | "review";
}

export interface ITRRecommendation {
  form: ITRForm;
  confidence: "high" | "medium" | "professional-review";
  summary: string;
  rules: RuleExplanation[];
  alternatives: Array<{
    form: Exclude<ITRForm, "Professional review">;
    reason: string;
    eligible: boolean;
  }>;
  requiresProfessionalReview: boolean;
}

export interface TaxEstimate {
  totalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  estimatedTax: number;
  taxesPaid: number;
  balance: number;
  isRefund: boolean;
}

export interface RegimeComparison {
  oldRegime: TaxEstimate;
  newRegime: TaxEstimate;
  suggestedRegime: Exclude<Regime, "undecided">;
  difference: number;
}

export interface AssessmentData {
  id: string;
  status: AssessmentStatus;
  currentStep: string;
  profile: TaxpayerProfile;
  incomeSources: IncomeSource[];
  salary: SalaryIncome;
  houseProperty: HousePropertyIncome;
  capitalGains: CapitalGains;
  trading: TradingIncome;
  business: BusinessProfessionalIncome;
  otherIncome: OtherIncome;
  deductions: Deduction[];
  taxPayments: TaxPayment;
  regimePreference: Regime;
  reviewFlags: string[];
  confirmed: boolean;
  updatedAt: string;
}
