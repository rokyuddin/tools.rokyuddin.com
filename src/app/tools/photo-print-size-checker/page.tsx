import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { PhotoPrintChecker } from "@/features/photo-print-checker/components/PhotoPrintChecker";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Photo Print Size Checker – Calculate DPI & Maximum Print Quality",
  description:
    "Check how large you can print any photo without blur or pixelation. Calculate exact DPI and quality ratings for 4x6, 5x7, 8x10, A4, and posters with aspect ratio crop warnings.",
  keywords: [
    "photo print size checker",
    "how big can i print a photo",
    "image print size calculator",
    "photo print quality checker",
    "dpi print calculator",
    "image resolution for print",
    "4x6 5x7 8x10 print dimensions",
  ],
};

export default function PhotoPrintCheckerPage() {
  const tool = getToolBySlug("photo-print-size-checker");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <PhotoPrintChecker />
    </ToolShell>
  );
}
