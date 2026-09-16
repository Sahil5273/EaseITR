import type {
  AssessmentData,
  ITRRecommendation,
  RegimeComparison,
  TaxEstimate,
} from "@/lib/domain/types";
import type {
  ITRRecommendationService,
  TaxCalculationService,
} from "../interfaces";

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function incomeTotal(data: AssessmentData) {
  return (
    data.salary.grossSalary +
    data.salary.pensionIncome +
    data.houseProperty.rentReceived +
    data.capitalGains.shortTermGains +
    data.capitalGains.longTermGains +
    data.trading.profitOrLoss +
    data.business.netProfit +
    Object.values(data.otherIncome).reduce((sum, value) => sum + value, 0)
  );
}

function paymentsTotal(data: AssessmentData) {
  return Object.values(data.taxPayments).reduce((sum, value) => sum + value, 0);
}

function estimate(data: AssessmentData, regime: "old" | "new"): TaxEstimate {
  const totalIncome = Math.max(0, incomeTotal(data));
  const enteredDeductions = data.deductions.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const totalDeductions =
    regime === "old"
      ? enteredDeductions + data.salary.standardDeduction
      : data.salary.standardDeduction;
  const taxableIncome = Math.max(0, totalIncome - totalDeductions);
  const estimatedTax = Math.round(
    Math.max(0, taxableIncome - (regime === "new" ? 400000 : 250000)) *
      (regime === "new" ? 0.105 : 0.13),
  );
  const taxesPaid = paymentsTotal(data);
  const balance = Math.abs(estimatedTax - taxesPaid);
  return {
    totalIncome,
    totalDeductions,
    taxableIncome,
    estimatedTax,
    taxesPaid,
    balance,
    isRefund: taxesPaid > estimatedTax,
  };
}

export const mockTaxCalculationService: TaxCalculationService = {
  async compareRegimes(data) {
    await wait(180);
    const oldRegime = estimate(data, "old");
    const newRegime = estimate(data, "new");
    const suggestedRegime =
      oldRegime.estimatedTax < newRegime.estimatedTax ? "old" : "new";
    return {
      oldRegime,
      newRegime,
      suggestedRegime,
      difference: Math.abs(oldRegime.estimatedTax - newRegime.estimatedTax),
    } satisfies RegimeComparison;
  },
};

// UI DEMONSTRATION RULES ONLY — these simplified examples must never be used as production tax logic.
export const mockITRRecommendationService: ITRRecommendationService = {
  async recommend(data) {
    await wait(180);
    const complexResidency =
      data.profile.residentialStatus !== "resident" ||
      data.profile.hasForeignAssets ||
      data.profile.hasForeignIncome;
    const businessIncome =
      data.trading.futuresAndOptions ||
      data.trading.intradayTrading ||
      data.business.activityType !== "none";
    const presumptive =
      data.business.prefersPresumptive && data.business.eligibleForPresumptive;
    const capitalGains =
      data.capitalGains.hasEquityShares ||
      data.capitalGains.hasEquityMutualFunds ||
      data.capitalGains.hasPropertySale;

    let form: ITRRecommendation["form"] = "ITR-1";
    let summary =
      "ITR-1 may apply because this sample contains salary and interest income without capital gains or business income.";
    let confidence: ITRRecommendation["confidence"] = "high";
    let requiresProfessionalReview = false;

    if (complexResidency) {
      form = "Professional review";
      summary =
        "A professional review is recommended because foreign assets, foreign income or a non-resident status can require additional disclosures.";
      confidence = "professional-review";
      requiresProfessionalReview = true;
    } else if (presumptive) {
      form = "ITR-4";
      summary =
        "ITR-4 may apply because you selected presumptive taxation and the sample eligibility checks were met.";
      confidence = "medium";
    } else if (businessIncome) {
      form = "ITR-3";
      summary = data.trading.futuresAndOptions
        ? "ITR-3 may be applicable because you reported income from futures and options trading, which is generally treated as business income."
        : "ITR-3 may apply because you reported intraday, freelance or normal business income.";
      confidence = "medium";
      requiresProfessionalReview = data.trading.auditMayApply;
    } else if (capitalGains) {
      form = "ITR-2";
      summary =
        "ITR-2 may apply because you reported capital gains and no business or professional income.";
      confidence = "medium";
    }

    return {
      form,
      confidence,
      summary,
      requiresProfessionalReview,
      rules: [
        {
          id: "residency",
          title: "Residency and foreign holdings checked",
          explanation: complexResidency
            ? "A complex residency or foreign disclosure was reported."
            : "No foreign asset or non-resident flag was reported.",
          outcome: complexResidency ? "review" : "supports",
        },
        {
          id: "business",
          title: "Business-income test",
          explanation: businessIncome
            ? "Trading, freelance or business activity was reported."
            : "No business-income activity was reported.",
          outcome: businessIncome ? "supports" : "excludes",
        },
        {
          id: "gains",
          title: "Capital-gains test",
          explanation: capitalGains
            ? "One or more capital-gain sources were reported."
            : "No capital-gain source was reported.",
          outcome: capitalGains ? "supports" : "excludes",
        },
      ],
      alternatives: (["ITR-1", "ITR-2", "ITR-3", "ITR-4"] as const)
        .filter((item) => item !== form)
        .map((item) => ({
          form: item,
          eligible: false,
          reason: `The current sample answers do not match the demonstration rules for ${item}.`,
        })),
    };
  },
};
