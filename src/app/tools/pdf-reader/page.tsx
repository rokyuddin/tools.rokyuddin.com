import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { getToolBySlug } from "@/config/tools";
import { PdfReader } from "@/features/pdf-reader/components/PdfReader";

export const metadata: Metadata = {
  title: "PDF Book Reader – Read PDFs Online with Dark & Sepia Themes",
  description:
    "Free 100% in-browser PDF reader. Upload any PDF and read it in a beautiful paginated reader with light, sepia, and dark themes. Two-page spread, keyboard shortcuts, and fullscreen mode. Your PDF never leaves your device.",
  keywords: [
    "pdf reader online",
    "pdf viewer",
    "read pdf online",
    "pdf book reader",
    "online pdf viewer",
    "pdf document reader",
    "browser pdf reader",
    "free pdf reader",
  ],
};

export default function PdfReaderPage() {
  const tool = getToolBySlug("pdf-reader");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <PdfReader />
    </ToolShell>
  );
}
