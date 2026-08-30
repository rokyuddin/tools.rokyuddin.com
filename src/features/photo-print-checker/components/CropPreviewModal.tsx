"use client";

import React, { useState } from "react";
import { X, Crop, RotateCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CropPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  targetName: string;
  targetWidthIn: number;
  targetHeightIn: number;
  dpi: number;
  cropPercent: number;
  aspectRatioMismatch: boolean;
}

export function CropPreviewModal({
  isOpen,
  onClose,
  imageSrc,
  imageWidth,
  imageHeight,
  targetName,
  targetWidthIn,
  targetHeightIn,
  dpi,
  cropPercent,
  aspectRatioMismatch,
}: CropPreviewModalProps) {
  const [alignment, setAlignment] = useState<"center" | "start" | "end">("center");
  const [rotateFrame, setRotateFrame] = useState(false);

  if (!isOpen) return null;

  const currentTargetW = rotateFrame ? targetHeightIn : targetWidthIn;
  const currentTargetH = rotateFrame ? targetWidthIn : targetHeightIn;

  const targetRatio = currentTargetW / currentTargetH;
  const imageRatio = imageWidth / imageHeight;

  // Is image wider than the target frame?
  const isImageWider = imageRatio > targetRatio;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Crop className="size-5 text-primary" />
              Print Frame & Crop Preview: {targetName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Target Dimensions: {currentTargetW} × {currentTargetH} in ({dpi} DPI)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="mt-4">
          {aspectRatioMismatch ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold">Aspect Ratio Mismatch (~{cropPercent}% Trimming)</p>
                <p className="mt-0.5 opacity-90">
                  Your photo aspect ratio ({imageRatio.toFixed(2)}:1) does not match the {targetName} frame ratio ({targetRatio.toFixed(2)}:1). Shaded areas will be trimmed when filling the frame.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              <span>Perfect match! This frame matches your image aspect ratio with minimal to no cropping required.</span>
            </div>
          )}
        </div>

        {/* Visual Frame Simulation */}
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-border/80 bg-muted/40 p-6">
          <div
            className="relative overflow-hidden rounded-md border-4 border-foreground/80 shadow-lg bg-black flex items-center justify-center"
            style={{
              aspectRatio: `${currentTargetW} / ${currentTargetH}`,
              maxHeight: "340px",
              width: targetRatio >= 1 ? "100%" : "auto",
              height: targetRatio < 1 ? "320px" : "auto",
            }}
          >
            {/* Background uncropped image with opacity */}
            {/* The actual cropped content inside the frame container */}
            <div
              className="relative w-full h-full overflow-hidden flex"
              style={{
                justifyContent: alignment === "start" ? "flex-start" : alignment === "end" ? "flex-end" : "center",
                alignItems: alignment === "start" ? "flex-start" : alignment === "end" ? "flex-end" : "center",
              }}
            >
              <img
                src={imageSrc}
                alt="Crop preview"
                className="max-w-none transition-all duration-200"
                style={{
                  width: isImageWider ? "auto" : "100%",
                  height: isImageWider ? "100%" : "auto",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Frame Corner Accents */}
            <div className="absolute top-2 left-2 text-[10px] font-mono font-bold bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
              {currentTargetW}″ × {currentTargetH}″
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Crop Anchor:</span>
            <div className="flex rounded-lg border border-border bg-muted p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setAlignment("start")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  alignment === "start" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isImageWider ? "Left" : "Top"}
              </button>
              <button
                type="button"
                onClick={() => setAlignment("center")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  alignment === "center" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => setAlignment("end")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  alignment === "end" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isImageWider ? "Right" : "Bottom"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotateFrame(!rotateFrame)}
              className="gap-1.5 text-xs"
            >
              <RotateCw className="size-3.5" />
              Rotate Frame ({rotateFrame ? "Portrait" : "Landscape"})
            </Button>
            <Button size="sm" onClick={onClose} className="text-xs">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
