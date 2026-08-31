import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { getToolBySlug } from "@/config/tools";
import { BanglaDateConverter } from "@/features/bangla-date-converter/components/BanglaDateConverter";

export const metadata: Metadata = {
  title: "Bangla Date & Season Converter – বঙ্গাব্দ ক্যালেন্ডার ও ষড়ঋতু",
  description:
    "Convert Gregorian English dates to accurate Bangladeshi Bengali calendar dates (Bangla Academy 2019 standard) and vice versa. View current Bangla date, Bongabdo year, and six seasons (ষড়ঋতু).",
  keywords: [
    "bangla date converter",
    "today bangla date",
    "ajker bangla tarikh",
    "আজকের বাংলা তারিখ",
    "বঙ্গাব্দ ক্যালেন্ডার",
    "bangla calendar converter",
    "gregorian to bangla date",
    "bangla to english date converter",
    "bangla six seasons",
    "ষড়ঋতু ক্যালেন্ডার",
    "pohela boishakh date converter",
  ],
};

export default function BanglaDateConverterPage() {
  const tool = getToolBySlug("bangla-date-converter");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <BanglaDateConverter />
    </ToolShell>
  );
}
