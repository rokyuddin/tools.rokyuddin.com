import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { SocialResizer } from "@/features/social-resizer/components/SocialResizer";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Social Media Image Resizer – Instagram, Facebook, LinkedIn, X, YouTube",
  description:
    "Resize and crop images for Instagram posts & stories, Facebook covers, LinkedIn banners, X (Twitter) posts, and YouTube thumbnails. Smart background blur and batch downloads.",
  keywords: [
    "social media image resizer",
    "instagram post resizer",
    "facebook cover size",
    "linkedin banner resizer",
    "youtube thumbnail size",
    "twitter post resizer",
  ],
};

export default function SocialResizerPage() {
  const tool = getToolBySlug("social-resizer");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <SocialResizer />
    </ToolShell>
  );
}
