import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WIZARD_STEPS } from "@/lib/domain/constants";
import { WizardClient } from "@/components/easeitr/wizard-client";
import { AssessmentProvider } from "@/lib/state/assessment-context";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/assessment/property",
}));

describe("10-step wizard and skip logic", () => {
  it("has exactly 10 wizard steps configured", () => {
    expect(WIZARD_STEPS).toHaveLength(10);
    expect(WIZARD_STEPS[7].slug).toBe("deductions");
    expect(WIZARD_STEPS[8].slug).toBe("tax-payments");
    expect(WIZARD_STEPS[9].slug).toBe("review");
  });

  it("renders Skip for now button on optional steps", () => {
    render(
      <AssessmentProvider>
        <WizardClient step="property" />
      </AssessmentProvider>,
    );
    expect(
      screen.getByRole("button", { name: /skip for now/i }),
    ).toBeInTheDocument();
  });

  it("triggers skip action on optional step", async () => {
    push.mockClear();
    const user = userEvent.setup();
    render(
      <AssessmentProvider>
        <WizardClient step="property" />
      </AssessmentProvider>,
    );
    await user.click(screen.getByRole("button", { name: /skip for now/i }));
    expect(push).toHaveBeenCalledWith("/assessment/capital-gains");
  });

  it("renders TDS, TCS & taxes paid as a distinct 9th step", () => {
    render(
      <AssessmentProvider>
        <WizardClient step="tax-payments" />
      </AssessmentProvider>,
    );
    expect(
      screen.getByText(/tds, tcs & taxes already paid/i),
    ).toBeInTheDocument();
  });
});
