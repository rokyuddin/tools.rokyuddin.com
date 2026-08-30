import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { BdtConverter } from "@/features/bdt-to-words/components/BdtConverter";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "BDT Amount to Words Converter – English & Bangla (টাকা কথায় রূপান্তর)",
  description:
    "Convert numeric Bangladeshi Taka (BDT ৳) amounts into written English and Bangla words for bank cheques, tax invoices, receipts, and legal documents. Free and instant.",
  keywords: [
    "bdt to words",
    "taka to words",
    "bangla number to words",
    "cheque amount in words bangladesh",
    "taka kothay lekha",
    "টাকা কথায় রূপান্তর",
    "bdt crore lakh converter",
  ],
};

export default function BdtToWordsPage() {
  const tool = getToolBySlug("bdt-to-words");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <BdtConverter />
    </ToolShell>
  );
}
