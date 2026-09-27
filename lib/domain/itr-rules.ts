import { compareRegimes } from "@/lib/domain/tax-engine";
import type {
  AssessmentData,
  ITRForm,
  ITRRecommendation,
  RuleExplanation,
} from "@/lib/domain/types";

type IndividualForm = Exclude<ITRForm, "Professional review">;

const FORMS: IndividualForm[] = ["ITR-1", "ITR-2", "ITR-3", "ITR-4"];

function hasBusiness(data: AssessmentData) {
  return (
    data.trading.futuresAndOptions ||
    data.trading.intradayTrading ||
    data.business.activityType !== "none"
  );
}

function hasCapitalGains(data: AssessmentData) {
  return (
    data.capitalGains.hasEquityShares ||
    data.capitalGains.hasEquityMutualFunds ||
    data.capitalGains.hasPropertySale ||
    data.capitalGains.hasOtherAssets ||
    data.capitalGainLines.length > 0 ||
    data.capitalGains.shortTermGains > 0 ||
    data.capitalGains.longTermGains > 0 ||
    data.trading.deliveryTrading
  );
}

function moreThanOneHouse(data: AssessmentData) {
  return data.houseProperty.propertyCount > 1 || data.houseProperty.occupancy === "both";
}

function presumptiveChosen(data: AssessmentData) {
  return (
    data.business.activityType !== "none" &&
    data.business.prefersPresumptive &&
    data.business.eligibleForPresumptive &&
    !data.trading.futuresAndOptions &&
    !data.trading.intradayTrading
  );
}

function incomeOverLimit(data: AssessmentData) {
  const comparison = compareRegimes(data);
  return [comparison.oldRegime, comparison.newRegime].some(
    (estimate) => estimate.totalIncome - estimate.totalDeductions > 5_000_000,
  );
}

interface FormGate {
  id: string;
  title: string;
  blocks: IndividualForm[];
  when: boolean;
  blocked: string;
  clear: string;
}

function gates(data: AssessmentData): FormGate[] {
  const business = hasBusiness(data);
  return [
    {
      id: "residency",
      title: "Residential status",
      blocks: ["ITR-1", "ITR-4"],
      when: data.profile.residentialStatus !== "resident",
      blocked: "ITR-1 and ITR-4 are for residents. A non-resident return needs a different form and often a CA.",
      clear: "The profile is resident, so residency does not block ITR-1 or ITR-4.",
    },
    {
      id: "foreign",
      title: "Foreign assets or income",
      blocks: ["ITR-1", "ITR-4"],
      when: data.profile.hasForeignAssets || data.profile.hasForeignIncome,
      blocked: "Foreign assets or foreign income cannot go on ITR-1 or ITR-4.",
      clear: "No foreign asset or foreign income was reported.",
    },
    {
      id: "taxpayer",
      title: "Taxpayer type",
      blocks: ["ITR-1"],
      when: data.profile.taxpayerType === "huf",
      blocked: "ITR-1 is for resident individuals. An HUF uses another form.",
      clear: "The taxpayer is an individual.",
    },
    {
      id: "director",
      title: "Company director",
      blocks: ["ITR-1", "ITR-4"],
      when: data.profile.isCompanyDirector,
      blocked: "A company director cannot use ITR-1 or ITR-4.",
      clear: "The profile is not marked as a company director.",
    },
    {
      id: "unlisted",
      title: "Unlisted shares",
      blocks: ["ITR-1", "ITR-4"],
      when: data.profile.heldUnlistedShares,
      blocked: "Holding unlisted equity shares blocks ITR-1 and ITR-4.",
      clear: "No unlisted equity shares were reported.",
    },
    {
      id: "gains",
      title: "Capital gains",
      blocks: ["ITR-1", "ITR-4"],
      when: hasCapitalGains(data),
      blocked: "Capital gains, including delivery trades, take the return off ITR-1 and ITR-4.",
      clear: "No capital-gain source was reported.",
    },
    {
      id: "houses",
      title: "House property count",
      blocks: ["ITR-1", "ITR-4"],
      when: moreThanOneHouse(data),
      blocked: "More than one house property, or both self-occupied and let-out, blocks ITR-1 and ITR-4.",
      clear: "At most one house property is reported.",
    },
    {
      id: "lottery",
      title: "Lottery or similar income",
      blocks: ["ITR-1", "ITR-4"],
      when: data.otherIncome.lotteryIncome > 0,
      blocked: "Lottery or similar special-rate income is outside ITR-1 and ITR-4.",
      clear: "No lottery or similar income was entered.",
    },
    {
      id: "limit",
      title: "Total-income limit",
      blocks: ["ITR-1", "ITR-4"],
      when: incomeOverLimit(data),
      blocked: "Income above ₹50 lakh is outside ITR-1 and ITR-4.",
      clear: "Income is within the ₹50 lakh limit used for ITR-1 and ITR-4.",
    },
    {
      id: "business",
      title: "Business or trading income",
      blocks: business ? ["ITR-1", "ITR-2"] : ["ITR-3", "ITR-4"],
      when: true,
      blocked: business
        ? "F&O, intraday, freelance, or business income cannot go on ITR-1 or ITR-2."
        : "ITR-3 and ITR-4 need business or professional income.",
      clear: business
        ? "Business or trading income was reported."
        : "No business or trading income was reported.",
    },
    {
      id: "presumptive",
      title: "Presumptive taxation",
      blocks: presumptiveChosen(data) ? [] : ["ITR-4"],
      when: true,
      blocked: data.trading.futuresAndOptions || data.trading.intradayTrading
        ? "F&O or intraday activity is not filed as this presumptive ITR-4 case."
        : "ITR-4 needs a presumptive business that you have marked as eligible.",
      clear: "Presumptive taxation was selected and the eligibility flag is on. That flag is your statement, not a legal ruling.",
    },
    {
      id: "audit",
      title: "Tax audit",
      blocks: data.trading.auditMayApply ? ["ITR-1", "ITR-4"] : [],
      when: data.trading.auditMayApply,
      blocked: "A possible tax audit takes the return off ITR-1 and ITR-4 and needs a CA.",
      clear: "Tax audit was not marked.",
    },
  ];
}

function blockedForms(items: FormGate[]) {
  const blocked = new Set<IndividualForm>();
  for (const gate of items) {
    const active = gate.id === "business" || gate.id === "presumptive" || gate.when;
    if (!active) continue;
    for (const form of gate.blocks) blocked.add(form);
  }
  return blocked;
}

function describe(gate: FormGate, blocked: Set<IndividualForm>) {
  const active = gate.id === "business" || gate.id === "presumptive" || gate.when;
  const blocking = active && gate.blocks.some((form) => blocked.has(form));
  if (
    gate.when &&
    (gate.id === "residency" || gate.id === "foreign" || gate.id === "audit")
  ) {
    return { explanation: gate.blocked, outcome: "review" as const };
  }
  if (blocking) return { explanation: gate.blocked, outcome: "excludes" as const };
  return { explanation: gate.clear, outcome: "supports" as const };
}

function reasonFor(form: IndividualForm, items: FormGate[], blocked: Set<IndividualForm>) {
  if (!blocked.has(form)) {
    if (form === "ITR-2") return "ITR-2 can be used where there is no business income. It is broader than ITR-1.";
    if (form === "ITR-3") return "ITR-3 can be used for business or professional income, including instead of presumptive taxation.";
    return `${form} is not blocked by the gates collected in this assessment.`;
  }
  const gate = items.find((item) => item.blocks.includes(form) && (item.when || item.id === "business" || item.id === "presumptive"));
  return gate?.blocked ?? `${form} is blocked by the answers in this assessment.`;
}

export function recommendItr(data: AssessmentData): ITRRecommendation {
  const items = gates(data);
  const blocked = blockedForms(items);
  const review =
    data.profile.residentialStatus !== "resident" ||
    data.profile.hasForeignAssets ||
    data.profile.hasForeignIncome ||
    data.trading.auditMayApply;
  let form: ITRForm = "ITR-2";
  if (review && (data.profile.residentialStatus !== "resident" || data.profile.hasForeignAssets || data.profile.hasForeignIncome)) {
    form = "Professional review";
  } else if (!blocked.has("ITR-4") && presumptiveChosen(data)) {
    form = "ITR-4";
  } else if (!blocked.has("ITR-3") && hasBusiness(data)) {
    form = "ITR-3";
  } else if (!blocked.has("ITR-1")) {
    form = "ITR-1";
  } else if (!blocked.has("ITR-2")) {
    form = "ITR-2";
  } else {
    form = "Professional review";
  }

  const rules: RuleExplanation[] = items.map((gate) => {
    const described = describe(gate, blocked);
    return {
      id: gate.id,
      title: gate.title,
      explanation: described.explanation,
      outcome: described.outcome,
    };
  });

  const summary =
    form === "Professional review"
      ? "A CA should choose the form. Residency, foreign assets, foreign income, or the mix of answers is outside a confident self-file recommendation."
      : form === "ITR-1"
        ? "ITR-1 fits a resident individual with salary, one house, and other-source income inside the collected gates."
        : form === "ITR-2"
          ? "ITR-2 fits because there is no business income, and at least one ITR-1 gate is closed."
          : form === "ITR-3"
            ? "ITR-3 fits because business, freelance, intraday, or F&O income was reported."
            : "ITR-4 fits the presumptive answers you marked. Those answers are not a legal eligibility ruling.";

  return {
    form,
    confidence: review ? "professional-review" : form === "ITR-1" ? "high" : "medium",
    summary,
    requiresProfessionalReview: review,
    rules,
    alternatives: FORMS.filter((item) => item !== form).map((item) => ({
      form: item,
      eligible: !blocked.has(item),
      reason: reasonFor(item, items, blocked),
    })),
  };
}
