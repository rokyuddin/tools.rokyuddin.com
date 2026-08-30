import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { WebpConverter } from "@/features/image-to-webp/components/WebpConverter";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Free Image to WebP Converter Online – Convert PNG, JPG to WebP",
  description:
    "Convert JPG, PNG, GIF, and BMP images into Google WebP format online for free. Boost website speed with 100% in-browser private conversion and batch processing.",
  keywords: [
    "image to webp",
    "png to webp",
    "jpg to webp",
    "convert to webp online",
    "webp converter",
    "core web vitals image optimizer",
  ],
};

export default function ImageToWebpPage() {
  const tool = getToolBySlug("image-to-webp");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <WebpConverter />
    </ToolShell>
  );
}
