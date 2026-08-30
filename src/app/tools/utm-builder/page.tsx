import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { UtmBuilder } from "@/features/utm-builder/components/UtmBuilder";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "UTM Campaign Builder & Validator – Clean Marketing URLs & Presets",
  description:
    "Build tracked marketing URLs for Meta Ads, Google Ads, LinkedIn, Newsletters, and WhatsApp. Automatic mistake detection for uppercase, spaces, and parameter overlap.",
  keywords: [
    "utm builder",
    "utm generator",
    "utm validator",
    "campaign url builder",
    "google analytics utm builder",
    "facebook ads utm parameters",
    "utm tracking link creator",
  ],
};

export default function UtmBuilderPage() {
  const tool = getToolBySlug("utm-builder");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <UtmBuilder />
    </ToolShell>
  );
}
