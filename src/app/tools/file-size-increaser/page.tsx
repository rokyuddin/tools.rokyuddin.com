import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { getToolBySlug } from "@/config/tools";
import { FileSizeIncreaser } from "@/features/file-size-increaser/components/FileSizeIncreaser";

export const metadata: Metadata = {
  title: "Free File Size Increaser & Image Padder – Make Files Bigger Online",
  description:
    "Increase image and file size to any exact target size (e.g. 10KB to 1MB, 2MB, 5MB) for visa, job, and university portals. 100% private in-browser safe padding.",
  keywords: [
    "increase image size",
    "increase file size",
    "make file size bigger",
    "image padder",
    "pad file to 1mb",
    "make 10kb image 1mb",
    "client-side file padder",
    "inflate image size free",
  ],
};

export default function FileSizeIncreaserPage() {
  const tool = getToolBySlug("file-size-increaser");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <FileSizeIncreaser />
    </ToolShell>
  );
}
