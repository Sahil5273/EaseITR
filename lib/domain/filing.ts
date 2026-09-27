import { EMPTY_ASSESSMENT } from "@/lib/domain/constants";
import type {
  AssessmentData,
  CapitalGainLine,
  DocumentType,
  ExtractedDocumentField,
  ImportTarget,
  ImportedField,
  MismatchResolution,
  UploadedDocument,
} from "@/lib/domain/types";

const FIELD_TARGETS: Record<string, ImportTarget> = {
  salary: "salary.grossSalary",
  tds: "taxPayments.tds",
  "savings-interest": "otherIncome.savingsInterest",
  "fd-interest": "otherIncome.fixedDepositInterest",
  stcg: "capitalGains.shortTermGains",
  ltcg: "capitalGains.longTermGains",
  "loan-interest": "houseProperty.loanInterest",
};

export function normalizeAssessment(
  input: Partial<AssessmentData> | null | undefined,
): AssessmentData {
  const base = structuredClone(EMPTY_ASSESSMENT);
  if (!input) return base;
  const next: AssessmentData = {
    ...base,
    ...input,
    profile: { ...base.profile, ...input.profile },
    salary: { ...base.salary, ...input.salary },
    houseProperty: { ...base.houseProperty, ...input.houseProperty },
    capitalGains: { ...base.capitalGains, ...input.capitalGains },
    trading: { ...base.trading, ...input.trading },
    business: { ...base.business, ...input.business },
    otherIncome: { ...base.otherIncome, ...input.otherIncome },
    taxPayments: { ...base.taxPayments, ...input.taxPayments },
    deductions: input.deductions ?? base.deductions,
    incomeSources: input.incomeSources ?? base.incomeSources,
    reviewFlags: input.reviewFlags ?? [],
    skippedSections: input.skippedSections ?? [],
    sectionStatuses: input.sectionStatuses ?? {},
    capitalGainLines: input.capitalGainLines ?? [],
    reviewedDocuments: input.reviewedDocuments ?? [],
    importedFields: input.importedFields ?? [],
    mismatchResolutions: input.mismatchResolutions ?? {},
    filingMode: input.filingMode === "self-file" ? "self-file" : "ca-pack",
    selfFileReady: Boolean(input.selfFileReady),
  };
  if (requiresCaReview(next)) {
    next.filingMode = "ca-pack";
    next.selfFileReady = false;
  } else if (selfFileBlockers(next).length > 0) {
    next.selfFileReady = false;
  }
  return next;
}

export function requiresCaReview(data: AssessmentData) {
  return (
    data.profile.residentialStatus !== "resident" ||
    data.profile.hasForeignAssets ||
    data.profile.hasForeignIncome ||
    data.trading.auditMayApply
  );
}

export function caLockReason(data: AssessmentData) {
  if (data.profile.residentialStatus !== "resident") {
    return "A non-resident or not-ordinarily-resident status keeps this assessment on the CA path.";
  }
  if (data.profile.hasForeignAssets || data.profile.hasForeignIncome) {
    return "Foreign assets or foreign income keep this assessment on the CA path.";
  }
  if (data.trading.auditMayApply) {
    return "A possible tax audit keeps this assessment on the CA path.";
  }
  return null;
}

function readTarget(data: AssessmentData, target: ImportTarget) {
  switch (target) {
    case "salary.grossSalary":
      return data.salary.grossSalary;
    case "taxPayments.tds":
      return data.taxPayments.tds;
    case "otherIncome.savingsInterest":
      return data.otherIncome.savingsInterest;
    case "otherIncome.fixedDepositInterest":
      return data.otherIncome.fixedDepositInterest;
    case "capitalGains.shortTermGains":
      return data.capitalGains.shortTermGains;
    case "capitalGains.longTermGains":
      return data.capitalGains.longTermGains;
    case "houseProperty.loanInterest":
      return data.houseProperty.loanInterest;
  }
}

function writeTarget(
  data: AssessmentData,
  target: ImportTarget,
  amount: number,
): AssessmentData {
  switch (target) {
    case "salary.grossSalary":
      return { ...data, salary: { ...data.salary, grossSalary: amount } };
    case "taxPayments.tds":
      return {
        ...data,
        taxPayments: { ...data.taxPayments, tds: amount },
      };
    case "otherIncome.savingsInterest":
      return {
        ...data,
        otherIncome: { ...data.otherIncome, savingsInterest: amount },
      };
    case "otherIncome.fixedDepositInterest":
      return {
        ...data,
        otherIncome: { ...data.otherIncome, fixedDepositInterest: amount },
      };
    case "capitalGains.shortTermGains":
      return {
        ...data,
        capitalGains: { ...data.capitalGains, shortTermGains: amount },
      };
    case "capitalGains.longTermGains":
      return {
        ...data,
        capitalGains: { ...data.capitalGains, longTermGains: amount },
      };
    case "houseProperty.loanInterest":
      return {
        ...data,
        houseProperty: { ...data.houseProperty, loanInterest: amount },
      };
  }
}

export function amountFromField(field: ExtractedDocumentField) {
  if (typeof field.normalizedValue === "number" && Number.isFinite(field.normalizedValue)) {
    return field.normalizedValue;
  }
  if (typeof field.normalizedValue === "string" && field.normalizedValue.trim()) {
    const parsed = Number(field.normalizedValue.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function upsertReviewedDocument(
  data: AssessmentData,
  document: UploadedDocument,
) {
  return {
    ...data,
    reviewedDocuments: [
      ...data.reviewedDocuments.filter((item) => item.type !== document.type),
      document,
    ],
  };
}

export function importAcceptedFields(
  data: AssessmentData,
  document: UploadedDocument,
) {
  let next = upsertReviewedDocument(data, document);
  const imported = next.importedFields.filter(
    (item) => item.documentType !== document.type,
  );
  for (const field of document.fields) {
    const target = FIELD_TARGETS[field.id];
    const amount = amountFromField(field);
    const usable =
      field.verificationStatus === "accepted" ||
      field.verificationStatus === "edited";
    if (!target || amount === null || !usable) continue;
    next = writeTarget(next, target, amount);
    const source: ImportedField = {
      documentId: document.id,
      documentName: document.name,
      documentType: document.type,
      fieldId: field.id,
      label: field.label,
      target,
      amount,
    };
    imported.push(source);
  }
  return { ...next, importedFields: imported };
}

export interface StatementMismatch {
  id: string;
  documentType: DocumentType;
  documentName: string;
  label: string;
  documentAmount: number;
  enteredAmount: number;
  resolution: MismatchResolution;
}

export function statementMismatches(data: AssessmentData): StatementMismatch[] {
  const rows: StatementMismatch[] = [];
  for (const document of data.reviewedDocuments) {
    for (const field of document.fields) {
      const target = FIELD_TARGETS[field.id];
      const documentAmount = amountFromField(field);
      if (!target || documentAmount === null) continue;
      const enteredAmount = readTarget(data, target);
      if (enteredAmount === documentAmount) continue;
      const id = `${document.type}:${field.id}`;
      rows.push({
        id,
        documentType: document.type,
        documentName: document.name,
        label: field.label,
        documentAmount,
        enteredAmount,
        resolution: data.mismatchResolutions[id] ?? "open",
      });
    }
  }
  return rows;
}

export function resolveMismatch(
  data: AssessmentData,
  mismatchId: string,
  resolution: MismatchResolution,
) {
  const mismatch = statementMismatches(data).find((row) => row.id === mismatchId);
  let next: AssessmentData = {
    ...data,
    mismatchResolutions: {
      ...data.mismatchResolutions,
      [mismatchId]: resolution,
    },
  };
  if (resolution === "use-document" && mismatch) {
    const document = data.reviewedDocuments.find(
      (item) => item.type === mismatch.documentType,
    );
    const field = document?.fields.find(
      (item) => `${document?.type}:${item.id}` === mismatchId,
    );
    if (document && field) {
      next = importAcceptedFields(next, {
        ...document,
        fields: document.fields.map((item) =>
          item.id === field.id
            ? { ...item, verificationStatus: "accepted" as const }
            : item,
        ),
      });
      next = {
        ...next,
        mismatchResolutions: {
          ...next.mismatchResolutions,
          [mismatchId]: resolution,
        },
      };
    }
  }
  return next;
}

export interface DocumentNeed {
  type: DocumentType;
  label: string;
  reason: string;
  state: "missing" | "uploaded" | "accepted";
}

const NEED_LABELS: Record<DocumentType, string> = {
  "form-16": "Form 16",
  "form-26as": "Form 26AS",
  ais: "Annual Information Statement",
  tis: "Taxpayer Information Summary",
  "broker-capital-gains": "Broker capital-gains statement",
  "trading-pnl": "F&O or intraday P&L",
  "bank-interest": "Bank interest certificate",
  "home-loan-interest": "Home-loan interest certificate",
  "rent-receipt": "Rent receipts",
  "donation-receipt": "Donation receipts",
  "insurance-proof": "Insurance premium receipts",
  "investment-proof": "Investment proofs",
  "expense-bill": "Freelance or business bills",
};

function documentState(
  data: AssessmentData,
  type: DocumentType,
): DocumentNeed["state"] {
  const document = data.reviewedDocuments.find((item) => item.type === type);
  if (!document) return "missing";
  const accepted = document.fields.some(
    (field) =>
      field.verificationStatus === "accepted" ||
      field.verificationStatus === "edited",
  );
  return accepted ? "accepted" : "uploaded";
}

export function documentNeeds(data: AssessmentData): DocumentNeed[] {
  const salary =
    data.incomeSources.includes("salary") || data.salary.grossSalary > 0;
  const gains =
    data.incomeSources.includes("capital-gains") ||
    data.capitalGains.hasEquityShares ||
    data.capitalGains.hasEquityMutualFunds ||
    data.capitalGains.hasPropertySale ||
    data.capitalGains.shortTermGains > 0 ||
    data.capitalGains.longTermGains > 0;
  const trading =
    data.trading.futuresAndOptions || data.trading.intradayTrading;
  const business = data.business.activityType !== "none";
  const loan = data.houseProperty.loanInterest > 0;
  const interest =
    data.otherIncome.savingsInterest > 0 ||
    data.otherIncome.fixedDepositInterest > 0;
  const candidates: Array<{ type: DocumentType; reason: string; when: boolean }> =
    [
      {
        type: "form-16",
        reason: "Salary income needs the employer's Form 16.",
        when: salary,
      },
      {
        type: "form-26as",
        reason: "Salary income needs the tax-credit statement.",
        when: salary,
      },
      {
        type: "ais",
        reason: "Interest or reported transactions should be checked against AIS.",
        when: salary || interest,
      },
      {
        type: "broker-capital-gains",
        reason: "Capital gains need the broker statement.",
        when: gains,
      },
      {
        type: "trading-pnl",
        reason: "Intraday or F&O activity needs the broker P&L.",
        when: trading,
      },
      {
        type: "home-loan-interest",
        reason: "A home-loan interest claim needs the lender certificate.",
        when: loan,
      },
      {
        type: "expense-bill",
        reason: "Freelance or business receipts need supporting bills.",
        when: business,
      },
    ];
  return candidates
    .filter((item) => item.when)
    .map((item) => ({
      type: item.type,
      label: NEED_LABELS[item.type],
      reason: item.reason,
      state: documentState(data, item.type),
    }));
}

export function selfFileBlockers(data: AssessmentData) {
  const blockers: string[] = [];
  if (requiresCaReview(data)) {
    blockers.push(
      caLockReason(data) ??
        "This assessment stays with a CA.",
    );
  }
  if (!data.confirmed) {
    blockers.push("Confirm the assessment review step before marking this ready.");
  }
  for (const need of documentNeeds(data)) {
    if (need.state !== "accepted") {
      blockers.push(`${need.label} is still ${need.state}.`);
    }
  }
  for (const row of statementMismatches(data)) {
    if (row.resolution === "open") {
      blockers.push(`${row.label} does not match the entered amount.`);
    }
  }
  if (data.reviewFlags.length > 0) {
    blockers.push("A wizard section is still marked for review.");
  }
  return blockers;
}

export function caQuestions(data: AssessmentData) {
  const questions: string[] = [];
  if (data.profile.residentialStatus !== "resident") {
    questions.push(
      "Which residency tests apply, and which schedules does that status require?",
    );
  }
  if (data.profile.hasForeignAssets || data.profile.hasForeignIncome) {
    questions.push(
      "Which foreign assets and income need Schedule FA and related disclosures?",
    );
  }
  if (data.trading.futuresAndOptions || data.trading.intradayTrading) {
    questions.push(
      "Is F&O or intraday turnover in a range where tax audit or books of account need a decision?",
    );
  }
  if (data.trading.auditMayApply) {
    questions.push("What facts make tax audit a live question for this year?");
  }
  if (data.business.prefersPresumptive || data.business.activityType !== "none") {
    questions.push(
      "Do the presumptive sections 44AD or 44ADA actually apply, or should books and net profit be used?",
    );
  }
  if (data.capitalGains.hasPropertySale) {
    questions.push(
      "Does the property sale involve indexation, an exemption, or a cost that this worksheet does not compute?",
    );
  }
  for (const need of documentNeeds(data).filter((item) => item.state !== "accepted")) {
    questions.push(`Please bring ${need.label}. ${need.reason}`);
  }
  for (const row of statementMismatches(data).filter(
    (item) => item.resolution === "open" || item.resolution === "left-for-ca",
  )) {
    questions.push(
      `${row.label}: the ${row.documentName} figure is ${row.documentAmount} and the assessment shows ${row.enteredAmount}. Which figure should be used?`,
    );
  }
  if (questions.length === 0) {
    questions.push(
      "Review the income heads, accepted documents, and sample regime comparison before filing.",
    );
  }
  return questions;
}

export function holdingClass(line: CapitalGainLine) {
  const start = Date.parse(line.purchaseDate);
  const end = Date.parse(line.saleDate);
  if (
    !line.purchaseDate ||
    !line.saleDate ||
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    end < start
  ) {
    return "undated" as const;
  }
  const days = (end - start) / 86_400_000;
  const longAfter =
    line.assetType === "property" || line.assetType === "other" ? 730 : 365;
  return days >= longAfter ? ("long" as const) : ("short" as const);
}

export function applyCapitalGainLines(data: AssessmentData): AssessmentData {
  if (data.capitalGainLines.length === 0) return data;
  let shortTermGains = 0;
  let longTermGains = 0;
  let classified = 0;
  const flags = {
    hasEquityShares: false,
    hasEquityMutualFunds: false,
    hasPropertySale: false,
    hasOtherAssets: false,
  };
  for (const line of data.capitalGainLines) {
    const gain = Math.max(0, line.saleValue - line.cost);
    const klass = holdingClass(line);
    if (klass === "long") {
      longTermGains += gain;
      classified += 1;
    }
    if (klass === "short") {
      shortTermGains += gain;
      classified += 1;
    }
    if (line.assetType === "equity-share") flags.hasEquityShares = true;
    if (line.assetType === "equity-mutual-fund") flags.hasEquityMutualFunds = true;
    if (line.assetType === "property") flags.hasPropertySale = true;
    if (line.assetType === "other") flags.hasOtherAssets = true;
  }
  return {
    ...data,
    capitalGains: {
      ...data.capitalGains,
      ...flags,
      shortTermGains:
        classified > 0 ? shortTermGains : data.capitalGains.shortTermGains,
      longTermGains:
        classified > 0 ? longTermGains : data.capitalGains.longTermGains,
      transactionCount: data.capitalGainLines.length,
    },
  };
}

export function advanceTaxSchedule(estimatedTax: number, taxCredits: number) {
  const due = Math.max(0, Math.round(estimatedTax - taxCredits));
  const steps = [
    { label: "15 June", share: 0.15 },
    { label: "15 September", share: 0.45 },
    { label: "15 December", share: 0.75 },
    { label: "15 March", share: 1 },
  ];
  let previous = 0;
  return {
    due,
    instalments: steps.map((step) => {
      const cumulative = Math.round(due * step.share);
      const instalment = cumulative - previous;
      previous = cumulative;
      return { label: step.label, cumulative, instalment };
    }),
  };
}

export function with80cAmount(data: AssessmentData, amount: number) {
  const has80c = data.deductions.some((item) => item.section === "80C");
  const deductions = has80c
    ? data.deductions.map((item) =>
        item.section === "80C" ? { ...item, amount } : item,
      )
    : [
        ...data.deductions,
        {
          id: "80c",
          section: "80C" as const,
          label: "Investments and eligible payments",
          amount,
        },
      ];
  return { ...data, deductions };
}
