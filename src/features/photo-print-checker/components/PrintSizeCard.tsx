"use client";

import React from "react";
import { Star, Crop, AlertTriangle, Check, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PrintSizeEvaluation } from "../utils/dpi-calculator";

interface PrintSizeCardProps {
  evaluation: PrintSizeEvaluation;
  onOpenCrop: (evaluation: PrintSizeEvaluation) => void;
  unit: "in" | "cm";
}

export function PrintSizeCard({ evaluation, onOpenCrop, unit }: PrintSizeCardProps) {
  const { quality } = evaluation;

  const starArray = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xs">
      <div>
        {/* Header with Name & Quality Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="font-heading text-base font-bold text-foreground">
              {evaluation.name}
            </h4>
            <p className="text-xs text-muted-foreground">
              {unit === "in"
                ? `${evaluation.widthIn} × ${evaluation.heightIn} in`
                : `${evaluation.widthCm} × ${evaluation.heightCm} cm`}{" "}
              <span className="opacity-70 font-mono">({evaluation.aspectRatioLabel})</span>
            </p>
          </div>

          <Badge
            variant={
              quality.tier === "excellent" || quality.tier === "very-good"
                ? "success"
                : quality.tier === "good"
                  ? "secondary"
                  : quality.tier === "fair"
                    ? "warning"
                    : "destructive"
            }
            className="text-[11px] font-semibold shrink-0"
          >
            {quality.label}
          </Badge>
        </div>

        {/* DPI & Star Rating */}
        <div className="my-3 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-base font-extrabold text-foreground">
              {evaluation.effectiveDpi}
            </span>
            <span className="text-xs text-muted-foreground font-medium">DPI</span>
          </div>

          <div className="flex items-center gap-0.5 text-amber-500">
            {starArray.map((s) => (
              <Star
                key={s}
                className={`size-3.5 ${
                  s <= quality.stars
                    ? "fill-amber-500 text-amber-500"
                    : "text-muted-foreground/30 fill-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Description & Use */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {evaluation.typicalUse}
        </p>
      </div>

      {/* Footer Alerts & Crop Action */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
        {evaluation.aspectRatioMismatch ? (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>~{evaluation.cropPercent}% crop</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <Check className="size-3.5 shrink-0" />
            <span>No crop</span>
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenCrop(evaluation)}
          className="h-7 px-2.5 text-xs gap-1 cursor-pointer"
        >
          <Crop className="size-3" />
          Preview
        </Button>
      </div>
    </div>
  );
}
