import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { TextCleaner } from "@/features/text-cleaner/components/TextCleaner";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Personal Data & Text Cleanup Tool – 1-Click Messy Text Cleaner",
  description:
    "Clean messy copied text in one click. Remove extra spaces, collapse blank lines, normalize curly quotes, strip invisible Unicode characters, and deduplicate email lists.",
  keywords: [
    "text cleaner",
    "clean text online",
    "remove extra spaces",
    "remove duplicate lines",
    "clean email list",
    "normalize quotes",
    "remove invisible characters",
    "strip unicode characters",
  ],
};

export default function TextCleanerPage() {
  const tool = getToolBySlug("text-cleaner");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <TextCleaner />
    </ToolShell>
  );
}
