"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { EMPTY_ASSESSMENT } from "@/lib/domain/constants";
import type { AssessmentData } from "@/lib/domain/types";
import { mockAssessmentService } from "@/lib/services/mocks/assessment-service";
import { sampleProfiles } from "@/lib/services/mocks/seed-data";

interface AssessmentContextValue {
  data: AssessmentData;
  hydrated: boolean;
  savedAt: string | null;
  update: (updater: (current: AssessmentData) => AssessmentData) => void;
  loadSample: (profile: keyof typeof sampleProfiles) => void;
  clear: () => void;
  exportData: () => string;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<AssessmentData>(EMPTY_ASSESSMENT);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = mockAssessmentService.load();
    const handle = window.setTimeout(() => {
      if (saved) setData(saved);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    if (!hydrated || data.status === "not-started") return;
    const handle = window.setTimeout(() => {
      const timestamp = new Date().toISOString();
      mockAssessmentService.save({ ...data, updatedAt: timestamp });
      setSavedAt(timestamp);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [data, hydrated]);

  const update = useCallback(
    (updater: (current: AssessmentData) => AssessmentData) => {
      setData((current) => updater(current));
    },
    [],
  );

  const loadSample = useCallback((profile: keyof typeof sampleProfiles) => {
    const sample = structuredClone(sampleProfiles[profile]);
    setData(sample);
    mockAssessmentService.save(sample);
    setSavedAt(new Date().toISOString());
  }, []);

  const clear = useCallback(() => {
    mockAssessmentService.clear();
    setData(structuredClone(EMPTY_ASSESSMENT));
    setSavedAt(null);
  }, []);

  const value = useMemo(
    () => ({
      data,
      hydrated,
      savedAt,
      update,
      loadSample,
      clear,
      exportData: () => mockAssessmentService.export(data),
    }),
    [clear, data, hydrated, loadSample, savedAt, update],
  );

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context)
    throw new Error("useAssessment must be used inside AssessmentProvider");
  return context;
}
