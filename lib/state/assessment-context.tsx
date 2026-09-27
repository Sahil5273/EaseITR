"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { EMPTY_ASSESSMENT } from "@/lib/domain/constants";
import { normalizeAssessment } from "@/lib/domain/filing";
import type { AssessmentData } from "@/lib/domain/types";
import { mockAssessmentService } from "@/lib/services/mocks/assessment-service";
import {
  clearCloudAssessment,
  cloudSaveAvailable,
  loadCloudAssessment,
  saveCloudAssessment,
} from "@/lib/services/remote/easeitr-api";
import { sampleProfiles } from "@/lib/services/mocks/seed-data";
import { useAuth } from "@/lib/state/auth-context";

interface AssessmentContextValue {
  data: AssessmentData;
  hydrated: boolean;
  savedAt: string | null;
  cloudAccount: boolean;
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
  const { user } = useAuth();
  const [data, setData] = useState<AssessmentData>(EMPTY_ASSESSMENT);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const syncedUser = useRef<string | null>(null);
  const cloudReady = useRef(false);

  useEffect(() => {
    const saved = mockAssessmentService.load();
    const handle = window.setTimeout(() => {
      if (saved) setData(normalizeAssessment(saved));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || !cloudSaveAvailable()) {
      syncedUser.current = null;
      cloudReady.current = false;
      return;
    }
    if (syncedUser.current === user.uid) return;
    const local = data;
    syncedUser.current = user.uid;
    let cancelled = false;
    void (async () => {
      try {
        const token = await user.getIdToken();
        const remote = await loadCloudAssessment(token);
        if (cancelled) return;
        const remoteTime = Date.parse(remote?.updatedAt ?? "") || 0;
        const localTime = Date.parse(local.updatedAt ?? "") || 0;
        if (remote && remoteTime >= localTime) {
          const next = normalizeAssessment(remote);
          setData(next);
          mockAssessmentService.save(next);
          setSavedAt(remote.updatedAt || null);
        } else if (local.status !== "not-started") {
          await saveCloudAssessment(token, local);
          setSavedAt(local.updatedAt || null);
        }
        if (!cancelled) cloudReady.current = true;
      } catch {
        if (!cancelled) {
          syncedUser.current = null;
          cloudReady.current = false;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data, hydrated, user]);

  useEffect(() => {
    if (!hydrated || data.status === "not-started") return;
    const handle = window.setTimeout(() => {
      const timestamp = new Date().toISOString();
      const next = { ...data, updatedAt: timestamp };
      mockAssessmentService.save(next);
      setSavedAt(timestamp);
      if (user && cloudSaveAvailable() && cloudReady.current) {
        void user
          .getIdToken()
          .then((token) => saveCloudAssessment(token, next))
          .catch(() => undefined);
      }
    }, 250);
    return () => window.clearTimeout(handle);
  }, [data, hydrated, user]);

  const update = useCallback(
    (updater: (current: AssessmentData) => AssessmentData) => {
      setData((current) => normalizeAssessment(updater(current)));
    },
    [],
  );

  const loadSample = useCallback((profile: keyof typeof sampleProfiles) => {
    const sample = normalizeAssessment(sampleProfiles[profile]);
    setData(sample);
    mockAssessmentService.save(sample);
    setSavedAt(new Date().toISOString());
  }, []);

  const clear = useCallback(() => {
    mockAssessmentService.clear();
    setData(structuredClone(EMPTY_ASSESSMENT));
    setSavedAt(null);
    if (user && cloudSaveAvailable()) {
      void user
        .getIdToken()
        .then((token) => clearCloudAssessment(token))
        .catch(() => undefined);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      data,
      hydrated,
      savedAt,
      cloudAccount: Boolean(user && cloudSaveAvailable()),
      update,
      loadSample,
      clear,
      exportData: () => mockAssessmentService.export(data),
    }),
    [clear, data, hydrated, loadSample, savedAt, update, user],
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
