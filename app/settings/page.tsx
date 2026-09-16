import type { Metadata } from "next";
import { SettingsClient } from "@/components/easeitr/settings-client";

export const metadata: Metadata = {
  title: "Preferences & Local Data",
  description:
    "Manage application appearance, local assessment data persistence, and export options.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
