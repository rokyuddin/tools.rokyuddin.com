import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { PhotoBlur } from "@/features/photo-blur/components/PhotoBlur";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Blur & Pixelate Image Online – Censor Sensitive Text, Faces & Photos",
  description:
    "Free 100% in-browser photo blur and pixelation tool. Hide sensitive text, passwords, phone numbers, faces, and addresses in screenshots with blur, mosaic pixelate, and blackout boxes.",
  keywords: [
    "blur image",
    "pixelate image online",
    "blur screenshot",
    "censor photo",
    "hide text in image",
    "redact image online",
    "mosaic blur",
    "privacy brush",
    "blackout image",
  ],
};

export default function BlurImagePage() {
  const tool = getToolBySlug("blur-image");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <PhotoBlur />
    </ToolShell>
  );
}
