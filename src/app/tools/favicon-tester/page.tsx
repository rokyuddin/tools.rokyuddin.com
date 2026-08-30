import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { FaviconTester } from "@/features/favicon-tester/components/FaviconTester";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Favicon & App Icon Test Lab – Multi-Context Previews & Warnings",
  description:
    "Test your website favicon and mobile app icon across browser tabs, bookmarks, search results, iOS/Android home screens, and dark mode. Export multi-size icons in one click.",
  keywords: [
    "favicon tester",
    "favicon preview",
    "favicon size checker",
    "app icon tester",
    "browser tab favicon preview",
    "favicon generator preview",
    "website icon checker",
  ],
};

export default function FaviconTesterPage() {
  const tool = getToolBySlug("favicon-tester");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <FaviconTester />
    </ToolShell>
  );
}
