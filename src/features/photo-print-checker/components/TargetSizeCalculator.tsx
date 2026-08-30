"use client";

import React, { useState, useMemo } from "react";
import { HelpCircle, Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  evaluatePrintSize,
  getQualityAssessment,
} from "../utils/dpi-calculator";

interface TargetSizeCalculatorProps {
  imageWidth: number;
  imageHeight: number;
  onOpenCrop: (targetW: number, targetH: number, name: string) => void;
}

export function TargetSizeCalculator({
  imageWidth,
  imageHeight,
  onOpenCrop,
}: TargetSizeCalculatorProps) {
  const [targetWidth, setTargetWidth] = useState("8");
  const [targetHeight, setTargetHeight] = useState("10");
  const [unit, setUnit] = useState<"in" | "cm">("in");

  const wNum = parseFloat(targetWidth) || 0;
  const hNum = parseFloat(targetHeight) || 0;

  const wInches = unit === "in" ? wNum : wNum / 2.54;
  const hInches = unit === "in" ? hNum : hNum / 2.54;

  const evaluation = useMemo(() => {
    if (wInches <= 0 || hInches <= 0) return null;
    const res = evaluatePrintSize(imageWidth, imageHeight, wInches, hInches);
    const quality = getQualityAssessment(res.effectiveDpi);
    return { ...res, quality };
  }, [imageWidth, imageHeight, wInches, hInches]);

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary mb-1">
            <Sparkles className="size-3.5" />
            Killer Feature
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground">
            &ldquo;Can I print this?&rdquo; Target Size Checker
          </h3>
          <p className="text-xs text-muted-foreground">
            Enter the exact physical dimensions of your picture frame or canvas.
          </p>
        </div>

        {/* Unit Selector */}
        <div className="flex rounded-lg border border-border bg-muted p-0.5 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setUnit("in")}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              unit === "in" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Inches (&quot;)
          </button>
          <button
            type="button"
            onClick={() => setUnit("cm")}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              unit === "cm" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Centimeters (cm)
          </button>
        </div>
      </div>

      {/* Input row */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="target-w" className="text-xs font-semibold">
            Width ({unit === "in" ? "inches" : "cm"})
          </Label>
          <Input
            id="target-w"
            type="number"
            min="1"
            max="200"
            step="0.5"
            value={targetWidth}
            onChange={(e) => setTargetWidth(e.target.value)}
            className="mt-1.5"
            placeholder="e.g. 8"
          />
        </div>

        <div>
          <Label htmlFor="target-h" className="text-xs font-semibold">
            Height ({unit === "in" ? "inches" : "cm"})
          </Label>
          <Input
            id="target-h"
            type="number"
            min="1"
            max="200"
            step="0.5"
            value={targetHeight}
            onChange={(e) => setTargetHeight(e.target.value)}
            className="mt-1.5"
            placeholder="e.g. 10"
          />
        </div>
      </div>

      {/* Quick Preset Buttons */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted-foreground font-medium mr-1">Popular:</span>
        {[
          { label: "4 × 6 in", w: "4", h: "6", u: "in" },
          { label: "5 × 7 in", w: "5", h: "7", u: "in" },
          { label: "8 × 10 in", w: "8", h: "10", u: "in" },
          { label: "11 × 14 in", w: "11", h: "14", u: "in" },
          { label: "16 × 20 in", w: "16", h: "20", u: "in" },
          { label: "A4", w: "21", h: "29.7", u: "cm" },
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setUnit(preset.u as "in" | "cm");
              setTargetWidth(preset.w);
              setTargetHeight(preset.h);
            }}
            className="rounded-md border border-border/80 bg-muted/70 px-2 py-0.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Result Verdict Box */}
      {evaluation && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              {evaluation.quality.tier === "excellent" || evaluation.quality.tier === "very-good" ? (
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="size-6" />
                </div>
              ) : evaluation.quality.tier === "good" || evaluation.quality.tier === "fair" ? (
                <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="size-6" />
                </div>
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                  <XCircle className="size-6" />
                </div>
              )}

              <div>
                <h4 className="font-heading text-lg font-bold text-foreground">
                  {evaluation.effectiveDpi >= 240
                    ? `Yes! Crisp and sharp at ${wNum} × ${hNum} ${unit}`
                    : evaluation.effectiveDpi >= 150
                      ? `Yes, with good poster quality at ${wNum} × ${hNum} ${unit}`
                      : `Warning: Image may look blurry or pixelated at ${wNum} × ${hNum} ${unit}`}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Calculated Output: <strong className="text-foreground">{evaluation.effectiveDpi} DPI</strong> — {evaluation.quality.description}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenCrop(wInches, hInches, `${wNum} × ${hNum} ${unit}`)}
              className="gap-1.5 text-xs self-start sm:self-auto cursor-pointer"
            >
              Crop & Frame Preview
              <ArrowRight className="size-3.5" />
            </Button>
          </div>

          {/* Technical breakdown */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-muted/50 p-3">
              <span className="text-muted-foreground font-medium">Original Resolution</span>
              <p className="font-mono font-bold text-foreground mt-1">
                {imageWidth} × {imageHeight} px
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <span className="text-muted-foreground font-medium">Recommended for 300 DPI</span>
              <p className="font-mono font-bold text-foreground mt-1">
                {evaluation.minPixelsFor300Dpi.width} × {evaluation.minPixelsFor300Dpi.height} px
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <span className="text-muted-foreground font-medium">Aspect Ratio & Cropping</span>
              <p className="font-medium text-foreground mt-1">
                {evaluation.aspectRatioMismatch
                  ? `Mismatch (~${evaluation.cropPercent}% trimmed)`
                  : "Exact match (No trim)"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
