"use client";

import React from "react";
import { Sparkles, CheckCircle2, FileText, Hash, ArrowRight } from "lucide-react";
import type { CleanerMetrics } from "../utils/cleaner-engine";

interface CleanupStatsCardProps {
  metrics: CleanerMetrics;
}

export function CleanupStatsCard({ metrics }: CleanupStatsCardProps) {
  const hasChanges = metrics.totalChanges > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h4 className="font-heading text-sm font-bold text-foreground">
            Cleaning Summary &amp; Metrics
          </h4>
        </div>
        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
          {metrics.totalChanges} modifications applied
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="rounded-lg bg-muted/50 p-2.5">
          <span className="text-muted-foreground block text-[11px]">Extra Spaces</span>
          <span className="font-mono font-bold text-foreground mt-0.5 block">
            {metrics.spacesRemoved} removed
          </span>
        </div>

        <div className="rounded-lg bg-muted/50 p-2.5">
          <span className="text-muted-foreground block text-[11px]">Blank Lines</span>
          <span className="font-mono font-bold text-foreground mt-0.5 block">
            {metrics.blankLinesRemoved} collapsed
          </span>
        </div>

        <div className="rounded-lg bg-muted/50 p-2.5">
          <span className="text-muted-foreground block text-[11px]">Duplicate Lines</span>
          <span className="font-mono font-bold text-foreground mt-0.5 block">
            {metrics.duplicateLinesRemoved} deleted
          </span>
        </div>

        <div className="rounded-lg bg-muted/50 p-2.5">
          <span className="text-muted-foreground block text-[11px]">Quotes &amp; Unicode</span>
          <span className="font-mono font-bold text-foreground mt-0.5 block">
            {metrics.quotesNormalized + metrics.invisibleCharsRemoved} cleaned
          </span>
        </div>
      </div>
    </div>
  );
}
