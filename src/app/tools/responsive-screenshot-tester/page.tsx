import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { ScreenshotTester } from "@/features/screenshot-tester/components/ScreenshotTester";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Responsive Screenshot Tester – Interactive Viewport Ruler & Device Bezels",
  description:
    "Test website and app UI screenshots across mobile, tablet, laptop, and desktop viewports. Drag the interactive width ruler and present screenshots in realistic device frames.",
  keywords: [
    "responsive screenshot tester",
    "mobile screenshot tester",
    "viewport screenshot tester",
    "screenshot size tester",
    "device frame generator",
    "responsive preview screenshot",
  ],
};

export default function ResponsiveScreenshotTesterPage() {
  const tool = getToolBySlug("responsive-screenshot-tester");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <ScreenshotTester />
    </ToolShell>
  );
}
