"use client";

import { AlertCircle, ArrowRight, Sparkles, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BYTES_PER_KB,
  BYTES_PER_MB,
  formatFileSize,
  parseUnitToBytes,
  type SizeUnit,
  validateTargetSize,
} from "../lib/pad-engine";

interface TargetSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileSizeBytes: number;
  onConfirm: (targetBytes: number) => void;
}

export const QUICK_PRESETS: {
  label: string;
  amount: number;
  unit: SizeUnit;
}[] = [
  { label: "100 KB", amount: 100, unit: "KB" },
  { label: "500 KB", amount: 500, unit: "KB" },
  { label: "1 MB", amount: 1, unit: "MB" },
  { label: "2 MB", amount: 2, unit: "MB" },
  { label: "5 MB", amount: 5, unit: "MB" },
];

export function TargetSizeModal({
  isOpen,
  onClose,
  fileName,
  fileSizeBytes,
  onConfirm,
}: TargetSizeModalProps) {
  const defaultTargetMB = Math.max(1, Math.ceil(fileSizeBytes / BYTES_PER_MB));
  const [amount, setAmount] = useState<string>(defaultTargetMB.toString());
  const [unit, setUnit] = useState<SizeUnit>("MB");
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input & setup Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    if (fileSizeBytes < 500 * BYTES_PER_KB) {
      setAmount("1");
      setUnit("MB");
    } else {
      const nextMB = Math.ceil((fileSizeBytes * 1.5) / BYTES_PER_MB);
      setAmount(nextMB.toString());
      setUnit("MB");
    }
    setTimeout(() => inputRef.current?.select(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, fileSizeBytes, onClose]);

  if (!isOpen) return null;

  const currentTargetBytes = parseUnitToBytes(parseFloat(amount) || 0, unit);
  const validation = validateTargetSize(fileSizeBytes, currentTargetBytes);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validation.isValid) {
      setError(validation.error || "Please specify a valid size.");
      return;
    }
    setError(null);
    onConfirm(currentTargetBytes);
  };

  const handleSelectPreset = (preset: { amount: number; unit: SizeUnit }) => {
    setAmount(preset.amount.toString());
    setUnit(preset.unit);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="target-size-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2
              id="target-size-modal-title"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Set Target File Size
            </h2>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {fileName} ({formatFileSize(fileSizeBytes)})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Presets */}
          <div>
            <span className="text-xs font-medium text-muted-foreground block mb-2">
              Popular Presets
            </span>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_PRESETS.map((p) => {
                const presetBytes = parseUnitToBytes(p.amount, p.unit);
                const isSelected =
                  amount === p.amount.toString() && unit === p.unit;
                const isTooSmall = presetBytes <= fileSizeBytes;

                return (
                  <button
                    type="button"
                    key={p.label}
                    disabled={isTooSmall}
                    onClick={() => handleSelectPreset(p)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : isTooSmall
                          ? "opacity-30 border-dashed border-border cursor-not-allowed line-through"
                          : "bg-muted/40 hover:bg-muted border-border text-foreground cursor-pointer"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Size Input */}
          <div>
            <label
              htmlFor="target-amount"
              className="text-xs font-medium text-muted-foreground block mb-1.5"
            >
              Exact Target File Size
            </label>
            <div className="flex gap-2">
              <Input
                id="target-amount"
                ref={inputRef}
                type="number"
                step="any"
                min="0.1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                className="flex-1 font-mono text-base"
                placeholder="e.g. 1"
              />
              <div className="flex rounded-xl border border-input bg-muted/30 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setUnit("KB");
                    setError(null);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    unit === "KB"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  KB
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUnit("MB");
                    setError(null);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    unit === "MB"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  MB
                </button>
              </div>
            </div>
          </div>

          {/* Sizing Preview Pill */}
          <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground border border-border/50 flex justify-between items-center">
            <span>Calculated Output:</span>
            <span className="font-mono font-medium text-foreground">
              {currentTargetBytes > 0
                ? `${formatFileSize(currentTargetBytes)} (${currentTargetBytes.toLocaleString()} bytes)`
                : "--"}
            </span>
          </div>

          {/* Error Message */}
          {(error || (!validation.isValid && amount)) && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error || validation.error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!validation.isValid}
              className="flex-1 gap-2"
            >
              <span>Apply Size</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
