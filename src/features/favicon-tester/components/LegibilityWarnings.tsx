"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Info, AlertCircle, Sparkles } from "lucide-react";
import type { IconAnalysis } from "../utils/icon-analyzer";

interface LegibilityWarningsProps {
  analysis: IconAnalysis;
}

export function LegibilityWarnings({ analysis }: LegibilityWarningsProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="size-4 text-primary" />
        <h3 className="font-heading text-base font-bold text-foreground">
          Smart Icon Analysis &amp; Warnings
        </h3>
      </div>

      <div className="space-y-3">
        {analysis.warnings.map((w) => (
          <div
            key={w.id}
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-xs ${
              w.type === "error"
                ? "border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200"
                : w.type === "warning"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                  : w.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200"
            }`}
          >
            {w.type === "error" ? (
              <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
            ) : w.type === "warning" ? (
              <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
            ) : w.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
            )}

            <div>
              <p className="font-bold">{w.title}</p>
              <p className="mt-0.5 opacity-90 leading-relaxed">{w.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
