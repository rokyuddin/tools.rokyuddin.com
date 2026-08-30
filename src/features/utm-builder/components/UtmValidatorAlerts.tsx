"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Info, Wand2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UtmIssue } from "../utils/utm-validator";

interface UtmValidatorAlertsProps {
  issues: UtmIssue[];
  onAutoFix: () => void;
  hasFixableIssues: boolean;
}

export function UtmValidatorAlerts({
  issues,
  onAutoFix,
  hasFixableIssues,
}: UtmValidatorAlertsProps) {
  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-900 dark:text-emerald-200">
        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
        <span className="font-semibold">
          All clean! URL syntax is valid and follows best practices for Google Analytics.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Validation &amp; Consistency Alerts ({issues.length})
        </h4>

        {hasFixableIssues && (
          <Button
            size="sm"
            onClick={onAutoFix}
            className="h-7 px-2.5 text-xs gap-1.5 font-bold cursor-pointer"
          >
            <Wand2 className="size-3" />
            1-Click Auto-Fix (Lowercase &amp; Underscores)
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs ${
              issue.type === "error"
                ? "border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200"
                : issue.type === "warning"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                  : "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200"
            }`}
          >
            {issue.type === "error" ? (
              <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
            ) : issue.type === "warning" ? (
              <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{issue.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
