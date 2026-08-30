import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { ImageCompressor } from "@/features/image-compressor/components/ImageCompressor";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Free Online Image Compressor – Compress JPG, PNG & WebP In Browser",
  description:
    "Compress JPG, PNG, and WebP images online for free. 100% private in-browser compression with zero server uploads, adjustable quality, and batch download.",
  keywords: [
    "image compressor",
    "compress jpg online",
    "compress png",
    "reduce image size free",
    "private image compressor",
    "client side image compression",
  ],
};

export default function ImageCompressorPage() {
  const tool = getToolBySlug("image-compressor");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <ImageCompressor />
    </ToolShell>
  );
}
