import { holdingClass } from "@/lib/domain/filing";
import {
  TAX_YEARS,
  oldRegimeSlabs,
  taxOnSlabs,
  type TaxYearRules,
} from "@/lib/domain/tax-year";
import type {
  AssessmentData,
  RegimeComparison,
  TaxEstimate,
  TaxLine,
} from "@/lib/domain/types";

const CESS = 0.04;

function roundRupee(value: number) {
  return Math.round(value);
}

function salaryReceived(data: AssessmentData) {
  return Math.max(0, data.salary.grossSalary + data.salary.pensionIncome - data.salary.exemptIncome);
}

function chapterVia(data: AssessmentData) {
  const lines: TaxLine[] = [];
  let total = 0;
  for (const item of data.deductions) {
    let allowed = Math.max(0, item.amount);
    let note = "";
    if (item.section === "80C") {
      allowed = Math.min(allowed, 150_000);
      note = " capped at ₹1,50,000";
    } else if (item.section === "80D") {
      const cap = data.profile.ageCategory === "below-60" ? 25_000 : 50_000;
      allowed = Math.min(allowed, cap);
      note = " capped for this age. Parent premiums are not separated";
    } else if (item.section === "NPS") {
      allowed = Math.min(allowed, 50_000);
      note = " additional NPS capped at ₹50,000. Employer NPS is not separated";
    } else if (item.section === "80TTA") {
      const cap = data.profile.ageCategory === "below-60" ? 10_000 : 50_000;
      allowed = Math.min(allowed, cap);
    }
    if (allowed <= 0) continue;
    total += allowed;
    lines.push({ label: `${item.section}${note}`, amount: allowed });
  }
  return { total, lines };
}

function houseProperty(data: AssessmentData, regime: "old" | "new") {
  const house = data.houseProperty;
  const active =
    house.propertyCount > 0 ||
    house.rentReceived > 0 ||
    house.loanInterest > 0 ||
    house.municipalTaxes > 0;
  if (!active) return { income: 0, deduction: 0, note: null as string | null };
  if (house.occupancy === "self-occupied") {
    if (regime === "new") {
      return {
        income: 0,
        deduction: 0,
        note: "Self-occupied home-loan interest is not deducted in the new regime.",
      };
    }
    const interest = Math.min(Math.max(0, house.loanInterest), 200_000);
    return {
      income: -interest,
      deduction: interest,
      note: "Self-occupied interest is capped at ₹2,00,000.",
    };
  }
  const nav = Math.max(0, house.rentReceived - house.municipalTaxes);
  const standard = nav * 0.3;
  const raw = nav - standard - Math.max(0, house.loanInterest);
  const income = Math.max(raw, -200_000);
  return {
    income,
    deduction: house.municipalTaxes + standard + Math.max(0, house.loanInterest),
    note:
      raw < -200_000
        ? "House-property loss set-off is capped at ₹2,00,000. Carry-forward is not computed."
        : house.occupancy === "both"
          ? "Self-occupied and let-out amounts are not split, so one let-out formula is used."
          : null,
  };
}

interface GainSplit {
  equityShort: number;
  equityLong: number;
  ordinaryShort: number;
  otherLong: number;
  note: string | null;
}

function splitGains(data: AssessmentData): GainSplit {
  const lines = data.capitalGainLines;
  if (lines.length > 0) {
    const split: GainSplit = {
      equityShort: 0,
      equityLong: 0,
      ordinaryShort: 0,
      otherLong: 0,
      note: lines.some((line) => holdingClass(line) === "undated")
        ? "Sales without usable dates are left out of the tax working."
        : null,
    };
    for (const line of lines) {
      const gain = Math.max(0, line.saleValue - line.cost);
      const klass = holdingClass(line);
      if (klass === "undated" || gain === 0) continue;
      const equity =
        line.assetType === "equity-share" || line.assetType === "equity-mutual-fund";
      if (klass === "short" && equity) split.equityShort += gain;
      else if (klass === "long" && equity) split.equityLong += gain;
      else if (klass === "short") split.ordinaryShort += gain;
      else split.otherLong += gain;
    }
    return applyLosses(split, data.capitalGains.capitalLosses);
  }
  const equityOnly =
    (data.capitalGains.hasEquityShares || data.capitalGains.hasEquityMutualFunds) &&
    !data.capitalGains.hasPropertySale &&
    !data.capitalGains.hasOtherAssets;
  if (equityOnly) {
    return applyLosses(
      {
        equityShort: Math.max(0, data.capitalGains.shortTermGains),
        equityLong: Math.max(0, data.capitalGains.longTermGains),
        ordinaryShort: 0,
        otherLong: 0,
        note: null,
      },
      data.capitalGains.capitalLosses,
    );
  }
  if (data.capitalGains.shortTermGains > 0 || data.capitalGains.longTermGains > 0) {
    return applyLosses(
      {
        equityShort: 0,
        equityLong: 0,
        ordinaryShort: Math.max(0, data.capitalGains.shortTermGains),
        otherLong: Math.max(0, data.capitalGains.longTermGains),
        note: "Listed-equity special rates were not used because the gains are not separated from property or other assets. Add sale lines to split them.",
      },
      data.capitalGains.capitalLosses,
    );
  }
  return {
    equityShort: 0,
    equityLong: 0,
    ordinaryShort: 0,
    otherLong: 0,
    note: null,
  };
}

function applyLosses(split: GainSplit, losses: number): GainSplit {
  let remaining = Math.max(0, losses);
  const next = { ...split };
  const take = (amount: number) => {
    const used = Math.min(amount, remaining);
    remaining -= used;
    return amount - used;
  };
  next.equityLong = take(next.equityLong);
  next.otherLong = take(next.otherLong);
  next.equityShort = take(next.equityShort);
  next.ordinaryShort = take(next.ordinaryShort);
  return next;
}

function surchargeAmount(tax: number, totalIncome: number, regime: "old" | "new") {
  const rate =
    totalIncome > 50_000_000
      ? regime === "new"
        ? 0.25
        : 0.37
      : totalIncome > 20_000_000
        ? 0.25
        : totalIncome > 10_000_000
          ? 0.15
          : totalIncome > 5_000_000
            ? 0.1
            : 0;
  if (rate === 0) return 0;
  const threshold =
    totalIncome > 50_000_000
      ? 50_000_000
      : totalIncome > 20_000_000
        ? 20_000_000
        : totalIncome > 10_000_000
          ? 10_000_000
          : 5_000_000;
  return Math.min(tax * rate, Math.max(0, totalIncome - threshold));
}

function rebateOnNormalTax(
  normalTax: number,
  normalIncome: number,
  rules: TaxYearRules,
  regime: "old" | "new",
  resident: boolean,
) {
  if (!resident || normalTax <= 0) return 0;
  if (regime === "old") {
    if (normalIncome > 500_000) return 0;
    return Math.min(normalTax, 12_500);
  }
  if (normalIncome <= rules.newRebateIncome) {
    return Math.min(normalTax, rules.newRebateCap);
  }
  const excess = normalIncome - rules.newRebateIncome;
  if (normalTax > excess) return normalTax - excess;
  return 0;
}

export function estimateTax(data: AssessmentData, regime: "old" | "new"): TaxEstimate {
  const rules = TAX_YEARS[data.profile.assessmentYear] ?? TAX_YEARS["2026-27"];
  const notes: string[] = [
    `${rules.label}. Health and education cess is 4%. The final figure is rounded to the nearest rupee.`,
  ];
  const lines: TaxLine[] = [];
  const received = salaryReceived(data);
  const hasSalary = data.salary.grossSalary + data.salary.pensionIncome > 0;
  const standardDeduction = hasSalary
    ? regime === "new"
      ? rules.newStandardDeduction
      : rules.oldStandardDeduction
    : 0;
  const professionalTax = regime === "old" ? Math.max(0, data.salary.professionalTax) : 0;
  if (regime === "new" && data.salary.professionalTax > 0) {
    notes.push("Professional tax is not deducted in the new regime.");
  }
  const salaryIncome = Math.max(0, received - standardDeduction - professionalTax);
  const house = houseProperty(data, regime);
  if (house.note) notes.push(house.note);
  const gains = splitGains(data);
  if (gains.note) notes.push(gains.note);
  const familyCap = regime === "new" ? rules.familyPensionCapNew : rules.familyPensionCapOld;
  const familyDeduction = Math.min(
    data.otherIncome.familyPension,
    familyCap,
    data.otherIncome.familyPension / 3,
  );
  const otherIncome =
    data.otherIncome.savingsInterest +
    data.otherIncome.fixedDepositInterest +
    data.otherIncome.dividends +
    data.otherIncome.familyPension -
    familyDeduction +
    data.otherIncome.miscellaneousIncome;
  const businessProfit = data.business.netProfit;
  const tradingProfit = data.trading.profitOrLoss;
  const intradayLossOnly =
    data.trading.intradayTrading &&
    !data.trading.futuresAndOptions &&
    tradingProfit < 0;
  if (intradayLossOnly) {
    notes.push("An intraday loss is not set off against salary in this computation.");
  }
  if (
    data.trading.intradayTrading &&
    data.trading.futuresAndOptions &&
    tradingProfit < 0
  ) {
    notes.push("Intraday and F&O results are one figure, so speculative-loss rules are not separated.");
  }
  const ordinaryBefore = Math.max(
    0,
    salaryIncome +
      house.income +
      otherIncome +
      gains.ordinaryShort +
      businessProfit +
      (intradayLossOnly ? 0 : tradingProfit),
  );
  const via = regime === "old" ? chapterVia(data) : { total: 0, lines: [] as TaxLine[] };
  if (regime === "new" && data.deductions.some((item) => item.amount > 0)) {
    notes.push("80C, 80D, 80G, and additional NPS are ignored in the new regime.");
  }
  const viaAllowed = Math.min(via.total, ordinaryBefore);
  const normalIncome = Math.max(0, ordinaryBefore - viaAllowed);
  const taxableEquityLong = Math.max(0, gains.equityLong - rules.equityLongTermExemption);
  const equityLongTax = taxableEquityLong * rules.equityLongTermRate;
  const equityShortTax = gains.equityShort * rules.equityShortTermRate;
  const otherLongTax = gains.otherLong * rules.otherLongTermRate;
  const lotteryTax = Math.max(0, data.otherIncome.lotteryIncome) * 0.3;
  if (data.otherIncome.lotteryIncome > 0) {
    notes.push("Lottery income is taxed at 30% and is excluded from the slab rebate.");
  }
  if (gains.otherLong > 0) {
    notes.push("Indexation and exemptions on property or other long-term gains are not computed.");
  }
  const slabs = regime === "new" ? rules.newRegimeSlabs : oldRegimeSlabs(data.profile.ageCategory);
  const slabTax = taxOnSlabs(normalIncome, slabs);
  const resident = data.profile.residentialStatus === "resident";
  const rebate = rebateOnNormalTax(slabTax, normalIncome, rules, regime, resident);
  if (!resident) notes.push("The section 87A rebate is not applied to a non-resident.");
  const specialTax = equityShortTax + equityLongTax + otherLongTax + lotteryTax;
  const taxAfterRebate = Math.max(0, slabTax - rebate) + specialTax;
  const grossTotal =
    received +
    Math.max(0, house.income) +
    otherIncome +
    gains.ordinaryShort +
    gains.equityShort +
    gains.equityLong +
    gains.otherLong +
    Math.max(0, businessProfit) +
    Math.max(0, intradayLossOnly ? 0 : tradingProfit) +
    Math.max(0, data.otherIncome.lotteryIncome);
  const surcharge = surchargeAmount(taxAfterRebate, grossTotal, regime);
  if (surcharge > 0) {
    notes.push("Surcharge marginal relief is limited to the income above the threshold. It is not a full recomputation.");
  }
  const cess = (taxAfterRebate + surcharge) * CESS;
  const estimatedTax = roundRupee(taxAfterRebate + surcharge + cess);
  const taxesPaid = Object.values(data.taxPayments).reduce((sum, value) => sum + value, 0);
  const balance = Math.abs(estimatedTax - taxesPaid);
  const deductionTotal =
    standardDeduction +
    professionalTax +
    house.deduction +
    familyDeduction +
    viaAllowed +
    Math.min(gains.equityLong, rules.equityLongTermExemption);

  if (received > 0) lines.push({ label: "Salary and pension after exemptions", amount: received });
  if (standardDeduction > 0) lines.push({ label: "Standard deduction", amount: standardDeduction });
  if (professionalTax > 0) lines.push({ label: "Professional tax", amount: professionalTax });
  if (house.income !== 0) lines.push({ label: "House property", amount: house.income });
  if (otherIncome > 0) lines.push({ label: "Other income after family-pension deduction", amount: otherIncome });
  if (gains.ordinaryShort > 0) lines.push({ label: "Short-term gains taxed at slab rates", amount: gains.ordinaryShort });
  if (gains.equityShort > 0) {
    lines.push({
      label: `Listed equity short-term gains at ${rules.equityShortTermRate * 100}%`,
      amount: gains.equityShort,
    });
  }
  if (gains.equityLong > 0) {
    lines.push({
      label: `Listed equity long-term gains above ${rules.equityLongTermExemption.toLocaleString("en-IN")}`,
      amount: taxableEquityLong,
    });
  }
  if (gains.otherLong > 0) lines.push({ label: "Other long-term gains", amount: gains.otherLong });
  if (viaAllowed > 0) {
    lines.push({ label: "Chapter VI-A deductions allowed", amount: viaAllowed });
  }
  lines.push({ label: "Income taxed at slab rates", amount: normalIncome });
  lines.push({ label: "Tax on slab income", amount: roundRupee(slabTax) });
  if (rebate > 0) lines.push({ label: "Section 87A rebate and marginal relief", amount: roundRupee(rebate) });
  if (specialTax > 0) lines.push({ label: "Tax at special rates", amount: roundRupee(specialTax) });
  if (surcharge > 0) lines.push({ label: "Surcharge", amount: roundRupee(surcharge) });
  lines.push({ label: "Health and education cess", amount: roundRupee(cess) });
  lines.push({ label: "Tax after cess", amount: estimatedTax });

  return {
    totalIncome: roundRupee(grossTotal),
    totalDeductions: roundRupee(deductionTotal),
    taxableIncome: roundRupee(normalIncome + taxableEquityLong + gains.equityShort + gains.otherLong + data.otherIncome.lotteryIncome),
    estimatedTax,
    taxesPaid,
    balance,
    isRefund: taxesPaid > estimatedTax,
    lines,
    notes,
  };
}

export function compareRegimes(data: AssessmentData): RegimeComparison {
  const oldRegime = estimateTax(data, "old");
  const newRegime = estimateTax(data, "new");
  const suggestedRegime = oldRegime.estimatedTax < newRegime.estimatedTax ? "old" : "new";
  return {
    oldRegime,
    newRegime,
    suggestedRegime,
    difference: Math.abs(oldRegime.estimatedTax - newRegime.estimatedTax),
  };
}
