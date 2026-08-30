import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { ReelsDownloader } from "@/features/reels-downloader/components/ReelsDownloader";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Reels Downloader – Instagram, TikTok, Facebook, YouTube Shorts & X Video Downloader",
  description:
    "Free online Reels and Short video downloader. Download Instagram Reels, TikTok without watermark, Facebook Reels, YouTube Shorts, and X (Twitter) videos in high HD quality with zero ads.",
  keywords: [
    "reels downloader",
    "instagram reels download",
    "tiktok video downloader no watermark",
    "facebook reels downloader",
    "youtube shorts download",
    "x video downloader",
    "twitter video download",
    "online video saver",
  ],
};

export default function ReelsDownloaderPage() {
  const tool = getToolBySlug("reels-downloader");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <ReelsDownloader />
    </ToolShell>
  );
}
