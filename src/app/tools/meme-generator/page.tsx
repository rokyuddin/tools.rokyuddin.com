import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { getToolBySlug } from "@/config/tools";
import { MemeGenerator } from "@/features/meme-generator/components/MemeGenerator";

export const metadata: Metadata = {
  title: "Free Online Meme Generator – Popular Templates, Custom Text & Emoji",
  description:
    "Create memes online for free. Pick a popular Meme Template or upload your own Base Image, add draggable Text Overlays and Icon Overlays, and export as PNG, JPG, or WebP. 100% private in-browser processing.",
  keywords: [
    "meme generator",
    "meme maker online",
    "drake meme maker",
    "distracted boyfriend meme",
    "two buttons meme",
    "custom meme maker",
  ],
};

export default function MemeGeneratorPage() {
  const tool = getToolBySlug("meme-generator");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <MemeGenerator />
    </ToolShell>
  );
}
