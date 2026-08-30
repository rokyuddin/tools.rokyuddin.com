import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { WhatsAppGenerator } from "@/features/whatsapp-link/components/WhatsAppGenerator";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Free WhatsApp Link Generator with QR Code & Pre-filled Message",
  description:
    "Generate instant WhatsApp click-to-chat links with custom pre-filled messages, country codes, QR codes, and website HTML buttons. 100% free with no signup.",
  keywords: [
    "whatsapp link generator",
    "wa me link",
    "whatsapp chat link",
    "create whatsapp link",
    "whatsapp qr code generator",
    "direct whatsapp link",
  ],
};

export default function WhatsAppLinkPage() {
  const tool = getToolBySlug("whatsapp-link");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <WhatsAppGenerator />
    </ToolShell>
  );
}
