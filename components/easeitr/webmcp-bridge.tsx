"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/lib/state/assessment-context";
import { sampleProfiles } from "@/lib/services/mocks/seed-data";

interface WebMCPTool {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute(input: unknown): unknown | Promise<unknown>;
}

interface ModelContext {
  registerTool(
    tool: WebMCPTool,
    options?: { signal?: AbortSignal },
  ): void | Promise<void>;
}

declare global {
  interface Document {
    readonly modelContext?: ModelContext;
  }
}

const sampleNames = Object.keys(sampleProfiles) as Array<
  keyof typeof sampleProfiles
>;

export function WebMCPBridge() {
  const router = useRouter();
  const { data, loadSample, update } = useAssessment();
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const report = () => undefined;

    void Promise.resolve(
      context.registerTool(
        {
          name: "get_assessment_summary",
          title: "Get assessment summary",
          description:
            "Read the current local EaseITR assessment status and selected income sources without returning financial values.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute() {
            const current = dataRef.current;
            return {
              status: current.status,
              currentStep: current.currentStep,
              incomeSources: current.incomeSources,
              reviewFlagCount: current.reviewFlags.length,
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(report);

    void Promise.resolve(
      context.registerTool(
        {
          name: "start_assessment",
          title: "Start tax assessment",
          description:
            "Start a blank local assessment or load one of the four clearly labelled sample profiles and open the relevant screen.",
          inputSchema: {
            type: "object",
            properties: {
              profile: { type: "string", enum: ["blank", ...sampleNames] },
            },
            required: ["profile"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            if (
              !input ||
              typeof input !== "object" ||
              !("profile" in input) ||
              typeof input.profile !== "string"
            )
              throw new Error("A valid profile is required.");
            const profile = input.profile;
            if (profile === "blank") {
              update((current) => ({
                ...current,
                status: "in-progress",
                currentStep: "profile",
              }));
              router.push("/assessment/profile");
              return {
                status: "started",
                profile: "blank",
                route: "/assessment/profile",
              };
            }
            if (!sampleNames.includes(profile as keyof typeof sampleProfiles))
              throw new Error("Unknown sample profile.");
            loadSample(profile as keyof typeof sampleProfiles);
            router.push("/dashboard");
            return { status: "loaded", profile, route: "/dashboard" };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(report);

    return () => lifecycle.abort();
  }, [loadSample, router, update]);

  return null;
}
