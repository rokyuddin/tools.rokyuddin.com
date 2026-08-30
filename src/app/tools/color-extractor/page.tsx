import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { ColorExtractor } from "@/features/color-extractor/components/ColorExtractor";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Screenshot Color Extractor & Eyedropper – Pick Pixel Colors from Images",
  description:
    "Extract dominant color palettes and pick exact pixel colors from screenshots and images. Interactive loupe eyedropper, WCAG contrast checker, and instant HEX, RGB, HSL, and OKLCH color codes.",
  keywords: [
    "screenshot color extractor",
    "image color picker",
    "eyedropper tool online",
    "extract palette from photo",
    "hex color from screenshot",
    "color contrast checker",
  ],
};

export default function ColorExtractorPage() {
  const tool = getToolBySlug("color-extractor");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <ColorExtractor />
    </ToolShell>
  );
}
