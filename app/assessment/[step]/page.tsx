import { notFound } from "next/navigation";
import { WizardClient } from "@/components/easeitr/wizard-client";
import { WIZARD_STEPS, type WizardStepSlug } from "@/lib/domain/constants";

export function generateStaticParams() {
  return WIZARD_STEPS.map((step) => ({ step: step.slug }));
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
