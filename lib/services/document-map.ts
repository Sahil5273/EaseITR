import type {
  DocumentType,
  ExtractedDocumentField,
  VerificationStatus,
} from "../domain/types";

export interface RecognizedPair {
  key: string;
  value: string;
  confidence: number;
}

interface FieldRule {
  id: string;
  label: string;
  category: ExtractedDocumentField["category"];
  test: RegExp;
  numeric?: boolean;
  sensitive?: boolean;
}

const RULES: Partial<Record<DocumentType, FieldRule[]>> = {
  "form-16": [
    {
      id: "salary",
      label: "Gross salary",
      category: "salary-component",
      test: /gross salary|salary as per|income chargeable under the head salaries/,
      numeric: true,
    },
    {
      id: "tds",
      label: "TDS deducted",
      category: "tds",
      test: /tax deducted|\btds\b/,
      numeric: true,
    },
    {
      id: "employer",
      label: "Employer",
      category: "employer-name",
      test: /employer/,
    },
    {
      id: "name",
      label: "Employee name",
      category: "person-name",
      test: /employee name|name of the employee/,
    },
    {
      id: "pan",
      label: "PAN",
      category: "pan",
      test: /\bpan\b/,
      sensitive: true,
    },
  ],
  "form-26as": [
    {
      id: "tds",
      label: "TDS as per Form 26AS",
      category: "tds",
      test: /tax deducted|\btds\b|total tax/,
      numeric: true,
    },
    {
      id: "name",
      label: "Deductee name",
      category: "person-name",
      test: /deductee|name of the/,
    },
  ],
  ais: [
    {
      id: "savings-interest",
      label: "Savings interest reported in AIS",
      category: "total-amount",
      test: /savings/,
      numeric: true,
    },
    {
      id: "fd-interest",
      label: "Fixed-deposit interest reported in AIS",
      category: "total-amount",
      test: /fixed deposit|term deposit|time deposit|deposit/,
      numeric: true,
    },
  ],
  "broker-capital-gains": [
    {
      id: "stcg",
      label: "Short-term equity gains",
      category: "profit-loss",
      test: /short[\s-]*term|\bstcg\b/,
      numeric: true,
    },
    {
      id: "ltcg",
      label: "Long-term equity gains",
      category: "profit-loss",
      test: /long[\s-]*term|\bltcg\b/,
      numeric: true,
    },
  ],
  "home-loan-interest": [
    {
      id: "loan-interest",
      label: "Home-loan interest",
      category: "total-amount",
      test: /interest/,
      numeric: true,
    },
  ],
  "expense-bill": [
    {
      id: "vendor",
      label: "Vendor",
      category: "vendor-name",
      test: /supplier name|vendor|merchant|seller|billed by/,
    },
    {
      id: "invoice",
      label: "Invoice number",
      category: "invoice-number",
      test: /invoice id|invoice number|invoice no|bill no/,
    },
    {
      id: "bill-date",
      label: "Bill date",
      category: "bill-date",
      test: /invoice date|bill date|receipt date|^date$/,
    },
    {
      id: "bill-total",
      label: "Bill amount",
      category: "total-amount",
      test: /total amount|net amount|amount due|grand total|^total$/,
      numeric: true,
    },
  ],
};

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[_./]+/g, " ").replace(/\s+/g, " ").trim();
}

export function maskPan(value: string): string | null {
  const match = value.toUpperCase().match(/[A-Z]{5}\d{4}[A-Z]/);
  if (!match) return null;
  return `•••••${match[0].slice(5, 9)}•`;
}

export function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[₹,\s]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount);
}

function expenseCategory(pairs: RecognizedPair[]): string | null {
  const text = pairs
    .filter((pair) => /line_item|description|particular|category/i.test(pair.key))
    .map((pair) => pair.value)
    .join(" ")
    .toLowerCase();
  if (!text.trim()) return null;
  if (/rent|lease/.test(text)) return "Rent";
  if (/travel|uber|ola|flight|hotel|railway/.test(text)) return "Travel";
  if (/software|subscription|hosting|saas/.test(text)) return "Software";
  if (/consult|professional|legal|audit/.test(text)) return "Professional fees";
  return "Other";
}

function makeField(
  rule: FieldRule,
  rawValue: string,
  normalizedValue: string | number,
  confidence: number,
): ExtractedDocumentField {
  const verificationStatus: VerificationStatus = "unverified";
  return {
    id: rule.id,
    category: rule.category,
    label: rule.label,
    rawValue,
    normalizedValue,
    confidence,
    source: null,
    verificationStatus,
    isSensitive: rule.sensitive === true,
  };
}

export function fieldsFromPairs(
  documentType: DocumentType,
  pairs: RecognizedPair[],
): ExtractedDocumentField[] {
  const rules = RULES[documentType] ?? [];
  const best = new Map<string, ExtractedDocumentField>();
  for (const pair of pairs) {
    const key = normalizeKey(pair.key);
    const rule = rules.find((candidate) => candidate.test.test(key));
    if (!rule) continue;
    const confidence = Math.max(0, Math.min(1, pair.confidence));
    let rawValue = pair.value.trim();
    let normalizedValue: string | number | null = rawValue;
    if (rule.sensitive) {
      const masked = maskPan(rawValue);
      if (!masked) continue;
      rawValue = masked;
      normalizedValue = masked;
    } else if (rule.numeric) {
      const amount = parseAmount(rawValue);
      if (amount === null) continue;
      normalizedValue = amount;
    }
    if (!rawValue) continue;
    const field = makeField(rule, rawValue, normalizedValue, confidence);
    const current = best.get(rule.id);
    if (!current || field.confidence > current.confidence) best.set(rule.id, field);
  }
  if (documentType === "expense-bill" && !best.has("category")) {
    const category = expenseCategory(pairs);
    if (category) {
      best.set(
        "category",
        makeField(
          {
            id: "category",
            label: "Expense category",
            category: "expense-category",
            test: /$^/,
          },
          category,
          category,
          0.62,
        ),
      );
    }
  }
  return [...best.values()];
}

const TYPE_SIGNALS: Partial<Record<DocumentType, Array<{ test: RegExp; weight: number }>>> = {
  "form-16": [
    { test: /form 16|form no 16/, weight: 6 },
    { test: /gross salary|salary as per|income chargeable under the head salaries/, weight: 4 },
    { test: /employee name|name of the employee/, weight: 2 },
    { test: /\bemployer\b/, weight: 1 },
  ],
  "form-26as": [{ test: /form 26as|\b26as\b|tax credit statement/, weight: 6 }],
  ais: [{ test: /annual information statement/, weight: 6 }],
  "broker-capital-gains": [
    { test: /capital gain/, weight: 4 },
    { test: /short term|\bstcg\b|long term|\bltcg\b/, weight: 3 },
  ],
  "home-loan-interest": [
    { test: /home loan|housing loan/, weight: 6 },
    { test: /interest certificate/, weight: 2 },
  ],
  "expense-bill": [
    { test: /tax invoice|invoice number|invoice no|invoice id|bill no/, weight: 5 },
    { test: /supplier name|\bvendor\b|grand total|amount due/, weight: 2 },
  ],
};

/** Picks a supported document type from labels already read. Returns null when the file is unclear. */
export function detectDocumentType(pairs: RecognizedPair[], text = ""): DocumentType | null {
  const haystack = normalizeKey(
    `${text}\n${pairs.map((pair) => `${pair.key} ${pair.value}`).join("\n")}`,
  ).replace(/-/g, " ");
  let best: DocumentType | null = null;
  let bestScore = 0;
  for (const [type, signals] of Object.entries(TYPE_SIGNALS) as Array<
    [DocumentType, Array<{ test: RegExp; weight: number }>]
  >) {
    let score = 0;
    for (const signal of signals) {
      if (signal.test.test(haystack)) score += signal.weight;
    }
    if (score > bestScore) {
      best = type;
      bestScore = score;
    }
  }
  return bestScore >= 4 ? best : null;
}

/** Reads lines such as "Gross salary: 1284000" without keeping the page text. */
export function pairsFromLabeledLines(text: string): RecognizedPair[] {
  const pairs: RecognizedPair[] = [];
  const pattern = /([A-Za-z][A-Za-z ]{1,40})\s*:\s*([^\n:]{1,80})/g;
  for (const match of text.matchAll(pattern)) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (!key || !value) continue;
    pairs.push({ key, value, confidence: 0.86 });
  }
  return pairs;
}
