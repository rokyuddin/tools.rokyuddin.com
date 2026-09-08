"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { ModalShell } from "@/features/image-resizer/components/EditModals";
import type { ConvertOptions } from "./ImageConverter";

const FORMAT_LABELS: Record<ConvertOptions["format"], string> = {
  jpeg: "JPG",
  png: "PNG",
  webp: "WebP",
};

export function ConvertOptionsModal({
  fileName,
  origW,
  origH,
  options,
  onChange,
  onClose,
}: {
  fileName: string;
  origW: number;
  origH: number;
  options: ConvertOptions;
  onChange: (patch: Partial<ConvertOptions>) => void;
  onClose: () => void;
}) {
  const isLossy = options.format !== "png";

  return (
    <ModalShell title="Convert Options" onClose={onClose}>
      <div className="p-5 sm:p-6 space-y-6">
        <p className="text-xs text-muted-foreground truncate" title={fileName}>
          {fileName} · {origW}×{origH}px
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel className="text-xs">Output Format</FieldLabel>
            <select
              aria-label="Output format"
              value={options.format}
              onChange={(e) => onChange({ format: e.target.value as ConvertOptions["format"] })}
              className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              {(Object.keys(FORMAT_LABELS) as ConvertOptions["format"][]).map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABELS[f]}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <FieldLabel className="text-xs">Target File Size (optional, KB)</FieldLabel>
            <Input
              value={options.targetKB}
              onChange={(e) => onChange({ targetKB: e.target.value.replace(/[^0-9]/g, "") })}
              placeholder="e.g. 500"
              inputMode="numeric"
              disabled={!isLossy}
            />
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">
              Quality Level {!isLossy && <span className="font-normal text-muted-foreground">(PNG is lossless)</span>}
            </span>
            <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
              {options.quality}%
            </span>
          </div>
          <Slider
            value={options.quality}
            onValueChange={(v) => onChange({ quality: Array.isArray(v) ? v[0] : v })}
            min={10}
            max={100}
            step={1}
            disabled={!isLossy}
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Smaller File</span>
            <span>Balanced (85%)</span>
            <span>High Quality</span>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border/60">
          <span className="text-xs font-semibold text-foreground block pt-2">Resolution</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange({ resizeMode: "original" })}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                options.resizeMode === "original"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Original ({origW}×{origH})
            </button>
            <button
              type="button"
              onClick={() => onChange({ resizeMode: "custom" })}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                options.resizeMode === "custom"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Custom size
            </button>
          </div>
          {options.resizeMode === "custom" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs">Width (px)</FieldLabel>
                  <Input
                    value={options.width}
                    onChange={(e) =>
                      onChange({ width: e.target.value.replace(/[^0-9]/g, ""), lastDim: "width" })
                    }
                    placeholder="Width"
                    inputMode="numeric"
                  />
                </Field>
                <Field>
                  <FieldLabel className="text-xs">Height (px)</FieldLabel>
                  <Input
                    value={options.height}
                    onChange={(e) =>
                      onChange({ height: e.target.value.replace(/[^0-9]/g, ""), lastDim: "height" })
                    }
                    placeholder="Height"
                    inputMode="numeric"
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.lockAspect}
                  onChange={(e) => onChange({ lockAspect: e.target.checked })}
                  className="size-3.5 accent-primary"
                />
                Lock Aspect Ratio
              </label>
            </div>
          )}
        </div>

        {options.format === "jpeg" && (
          <div className="space-y-3 pt-2 border-t border-border/60">
            <span className="text-xs font-semibold text-foreground block pt-2">
              Background (fills transparency)
            </span>
            <div className="flex items-center gap-2">
              {["#ffffff", "#000000", "#f1f5f9", "#dc2626"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ background: c })}
                  aria-label={`Background ${c}`}
                  className={`size-8 rounded-lg border-2 cursor-pointer transition-colors ${
                    options.background.toLowerCase() === c ? "border-primary" : "border-border"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={options.background}
                onChange={(e) => onChange({ background: e.target.value })}
                aria-label="Custom background color"
                className="size-8 rounded-lg border border-border bg-background p-0.5 cursor-pointer"
              />
              <span className="font-mono text-xs text-muted-foreground uppercase">{options.background}</span>
            </div>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground/80">
          EXIF metadata is stripped on export — converted files carry no camera or location data.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-border">
        <Button variant="default" onClick={onClose} className="min-w-28">
          Done
        </Button>
      </div>
    </ModalShell>
  );
}
