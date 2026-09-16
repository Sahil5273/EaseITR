import { STORAGE_KEY } from "@/lib/domain/constants";
import type { AssessmentData } from "@/lib/domain/types";
import type { AssessmentService } from "../interfaces";

export const mockAssessmentService: AssessmentService = {
  load() {
    if (typeof window === "undefined") return null;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as AssessmentData;
    } catch {
      return null;
    }
  },
  save(data) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
  export(data) {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        prototype: true,
        assessment: data,
      },
      null,
      2,
    );
  },
};
