"use client";

import React from "react";
import { Layers, Sparkles } from "lucide-react";
import type { UtmParams } from "../utils/utm-generator";

interface CampaignHierarchyPreviewProps {
  params: UtmParams;
}

export function CampaignHierarchyPreview({ params }: CampaignHierarchyPreviewProps) {
  const source = params.source.trim() || "(source)";
  const medium = params.medium.trim() || "(medium)";
  const campaign = params.campaign.trim() || "(campaign)";
  const content = params.content.trim();

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="size-4 text-primary" />
        <h4 className="font-heading text-sm font-bold text-foreground">
          Analytics Hierarchy &amp; Campaign Key
        </h4>
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-primary font-bold border border-primary/20">
          <span className="text-[10px] uppercase font-sans text-muted-foreground block">Source</span>
          {source}
        </div>

        <span className="text-muted-foreground font-bold">/</span>

        <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-primary font-bold border border-primary/20">
          <span className="text-[10px] uppercase font-sans text-muted-foreground block">Medium</span>
          {medium}
        </div>

        <span className="text-muted-foreground font-bold">/</span>

        <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-primary font-bold border border-primary/20">
          <span className="text-[10px] uppercase font-sans text-muted-foreground block">Campaign</span>
          {campaign}
        </div>

        {content && (
          <>
            <span className="text-muted-foreground font-bold">/</span>
            <div className="rounded-lg bg-muted px-3 py-1.5 text-foreground font-medium border border-border">
              <span className="text-[10px] uppercase font-sans text-muted-foreground block">Content</span>
              {content}
            </div>
          </>
        )}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        This composite key shows how Google Analytics 4 (GA4) and attribution dashboards will group and report this link&apos;s traffic.
      </p>
    </div>
  );
}
