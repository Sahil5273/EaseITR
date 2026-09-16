import { describe, expect, it, beforeEach } from "vitest";
import { profileSchema } from "@/lib/domain/schemas";
import { EMPTY_ASSESSMENT, STORAGE_KEY } from "@/lib/domain/constants";
import { mockAssessmentService } from "@/lib/services/mocks/assessment-service";

describe("required profile validation", () => {
  it("rejects missing required selections", () => {
    const result = profileSchema.safeParse({
      assessmentYear: "",
      taxpayerType: "",
      residentialStatus: "",
      ageCategory: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues).toHaveLength(4);
  });
});

describe("local assessment persistence", () => {
  beforeEach(() => window.localStorage.clear());

  it("saves and restores assessment data", () => {
    const assessment = {
      ...EMPTY_ASSESSMENT,
      status: "in-progress" as const,
      currentStep: "salary",
    };
    mockAssessmentService.save(assessment);
    expect(mockAssessmentService.load()?.currentStep).toBe("salary");
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("clears saved data", () => {
    mockAssessmentService.save({ ...EMPTY_ASSESSMENT, status: "in-progress" });
    mockAssessmentService.clear();
    expect(mockAssessmentService.load()).toBeNull();
  });
});
