import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { ImageConverter } from "@/features/image-converter/components/ImageConverter";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Free Online Image Converter – JPG, PNG, WebP In Browser",
  description:
    "Convert JPG, PNG, WebP, GIF, BMP, and AVIF online for free. Per-file control over quality, resolution, and file size with 100% private in-browser processing.",
  keywords: [
    "image converter",
    "jpg to png",
    "png to jpg",
    "convert webp",
    "image format converter",
    "private image converter",
  ],
};

export default function ImageConverterPage() {
  const tool = getToolBySlug("image-converter");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <ImageConverter />
    </ToolShell>
  );
}
