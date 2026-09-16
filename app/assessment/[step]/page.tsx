import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WizardClient } from "@/components/easeitr/wizard-client";
import { WIZARD_STEPS, type WizardStepSlug } from "@/lib/domain/constants";

export function generateStaticParams() {
  return WIZARD_STEPS.map((step) => ({ step: step.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ step: string }>;
}): Promise<Metadata> {
  const { step } = await params;
  const currentStep = WIZARD_STEPS.find((item) => item.slug === step);
  if (!currentStep) return { title: "Assessment Step" };
  return {
    title: `${currentStep.label} — Assessment`,
    description: `Complete section for ${currentStep.label} in your EaseITR tax assessment.`,
  };
}

export default async function AssessmentStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  if (!WIZARD_STEPS.some((item) => item.slug === step)) notFound();
  return <WizardClient step={step as WizardStepSlug} />;
}
