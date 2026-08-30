import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { BatchRenamer } from "@/features/batch-renamer/components/BatchRenamer";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Batch File Renamer – Bulk Rename Files Online Client-Side",
  description:
    "Bulk rename multiple files in your browser with sequential zero-padded numbering, prefix/suffix insertion, find-and-replace, case changes, and one-click ZIP download.",
  keywords: [
    "batch file renamer",
    "bulk file renamer",
    "bulk image renamer",
    "photo renamer online",
    "rename multiple files",
    "file rename pattern",
    "sequential file numbering",
  ],
};

export default function BatchFileRenamerPage() {
  const tool = getToolBySlug("batch-file-renamer");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <BatchRenamer />
    </ToolShell>
  );
}
