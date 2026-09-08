import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { ImageResizer } from "@/features/image-resizer/components/ImageResizer";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Free Online Image Resizer – Resize JPG, PNG & WebP In Browser",
  description:
    "Resize any image online for free. Exact pixels, percentage, or social presets with 100% private in-browser processing and batch ZIP download.",
  keywords: [
    "image resizer",
    "resize image online",
    "resize jpg png",
    "image dimension resizer",
    "private image resizer",
    "client side image resizer",
  ],
};

export default function ImageResizerPage() {
  const tool = getToolBySlug("image-resizer");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <ImageResizer />
    </ToolShell>
  );
}
