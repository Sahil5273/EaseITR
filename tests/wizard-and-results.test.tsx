import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TradingSection } from "@/components/easeitr/wizard-sections";
import { ITRRecommendationCard } from "@/components/easeitr/results-client";
import { WizardClient } from "@/components/easeitr/wizard-client";
import { AssessmentProvider } from "@/lib/state/assessment-context";
import { EMPTY_ASSESSMENT } from "@/lib/domain/constants";
import type { AssessmentData, ITRRecommendation } from "@/lib/domain/types";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/assessment/profile",
}));

function TradingHarness() {
  const [data, setData] = useState<AssessmentData>(
    structuredClone(EMPTY_ASSESSMENT),
  );
  return (
    <TradingSection
      data={data}
      update={(updater) => setData((current) => updater(current))}
    />
  );
}

describe("wizard flow", () => {
  it("shows F&O detail questions only after F&O is selected", async () => {
    const user = userEvent.setup();
    render(<TradingHarness />);
    expect(
      screen.queryByText("Trading business summary"),
    ).not.toBeInTheDocument();
    const foGroup = screen.getByRole("group", { name: "Futures & options?" });
    await user.click(foGroup.querySelectorAll("button")[0]);
    expect(screen.getByText("Trading business summary")).toBeInTheDocument();
  });

  it("moves forward and exposes backward navigation", async () => {
    push.mockClear();
    const user = userEvent.setup();
    render(
      <AssessmentProvider>
        <WizardClient step="salary" />
      </AssessmentProvider>,
    );
    expect(screen.getByRole("link", { name: /previous/i })).toHaveAttribute(
      "href",
      "/assessment/profile",
    );
    await user.click(screen.getByRole("button", { name: /save & continue/i }));
    expect(push).toHaveBeenCalledWith("/assessment/property");
  });
});

describe("results rendering", () => {
  it("renders an explainable recommendation", () => {
    const recommendation: ITRRecommendation = {
      form: "ITR-3",
      confidence: "medium",
      summary: "ITR-3 may apply because F&O income was reported.",
      requiresProfessionalReview: true,
      rules: [],
      alternatives: [],
    };
    render(<ITRRecommendationCard recommendation={recommendation} />);
    expect(screen.getByText("ITR-3")).toBeInTheDocument();
    expect(screen.getByText(/F&O income/)).toBeInTheDocument();
    expect(screen.getByText(/not a guarantee/i)).toBeInTheDocument();
  });
});
