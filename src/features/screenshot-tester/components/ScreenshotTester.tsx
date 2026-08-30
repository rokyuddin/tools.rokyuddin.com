"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Download,
} from "lucide-react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { VIEWPORT_PRESETS, type ViewportPreset } from "../utils/viewport-presets";
import { ViewportRuler } from "./ViewportRuler";
import { DeviceFramePreview } from "./DeviceFramePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScreenshotTester() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{ width: number; height: number } | null>(null);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [frameStyle, setFrameStyle] = useState<"browser" | "phone" | "shadow" | "borderless">("browser");
  const [bgStyle, setBgStyle] = useState<"gradient-light" | "gradient-dark" | "slate" | "transparent">("gradient-light");
  const [zoomPercent, setZoomPercent] = useState(75);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => {
      setImageDims({ width: img.naturalWidth, height: img.naturalHeight });
      // Sensible initial viewport based on image width
      if (img.naturalWidth <= 500) {
        setViewportWidth(390);
        setFrameStyle("phone");
      } else if (img.naturalWidth <= 1100) {
        setViewportWidth(768);
        setFrameStyle("browser");
      } else {
        setViewportWidth(1280);
        setFrameStyle("browser");
      }
    };
    img.src = url;
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setImageDims(null);
  };

  const handlePresetSelect = (preset: ViewportPreset) => {
    setViewportWidth(preset.width);
    setViewportHeight(preset.height);
    if (preset.category === "mobile") {
      setFrameStyle("phone");
    } else {
      setFrameStyle("browser");
    }
  };

  const loadSampleScreenshot = () => {
    // High quality tech landing page screenshot placeholder
    const sampleUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&auto=format&fit=crop&q=80";
    setImageSrc(sampleUrl);
    setImageDims({ width: 1440, height: 900 });
    setViewportWidth(1280);
    setFrameStyle("browser");
  };

  return (
    <div className="space-y-8">
      {!imageSrc ? (
        <div>
          <UploadDropzone
            onFilesSelected={handleFilesSelected}
            accept="image/*,.png,.jpg,.jpeg,.webp"
            title="Upload web or mobile app screenshot"
            subtitle="Drag and drop your UI design, mock, or webpage screenshot. Test responsive widths instantly."
          />

          {/* Sample Demo Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={loadSampleScreenshot}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium cursor-pointer"
            >
              <Sparkles className="size-3.5" />
              Try with a sample dashboard screenshot (1440 × 900 px)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Control Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                Responsive Viewport Tester
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Original Image: <strong className="text-foreground">{imageDims?.width} × {imageDims?.height} px</strong> &nbsp;•&nbsp; Active Viewport: <strong className="text-primary">{viewportWidth} px</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-border">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomPercent((prev) => Math.max(30, prev - 15))}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <span className="px-2 font-mono font-bold text-foreground">
                  {zoomPercent}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomPercent((prev) => Math.min(150, prev + 15))}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="size-3.5" />
                </button>
              </div>

              {/* Frame Style Switcher */}
              <select
                value={frameStyle}
                onChange={(e) => setFrameStyle(e.target.value as any)}
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary font-medium"
              >
                <option value="browser">Mac Browser Frame</option>
                <option value="phone">Phone Bezel</option>
                <option value="shadow">Clean Drop Shadow</option>
                <option value="borderless">Borderless</option>
              </select>

              {/* Background Color Switcher */}
              <select
                value={bgStyle}
                onChange={(e) => setBgStyle(e.target.value as any)}
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary font-medium"
              >
                <option value="gradient-light">Light Gradient Canvas</option>
                <option value="gradient-dark">Dark Gradient Canvas</option>
                <option value="slate">Dark Slate Canvas</option>
                <option value="transparent">Checkerboard Grid</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Quick Viewport Presets Row */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-semibold mr-1">Presets:</span>
            {VIEWPORT_PRESETS.map((p) => {
              const isSelected = viewportWidth === p.width;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-muted/70 text-foreground hover:bg-muted"
                  }`}
                >
                  {p.category === "mobile" ? (
                    <Smartphone className="size-3" />
                  ) : p.category === "tablet" ? (
                    <Tablet className="size-3" />
                  ) : p.category === "laptop" ? (
                    <Laptop className="size-3" />
                  ) : (
                    <Monitor className="size-3" />
                  )}
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Killer Feature: Interactive Draggable Ruler */}
          <ViewportRuler
            currentWidth={viewportWidth}
            minWidth={320}
            maxWidth={1920}
            onChange={setViewportWidth}
          />

          {/* Device Frame Viewport Container */}
          <DeviceFramePreview
            imageSrc={imageSrc}
            viewportWidth={viewportWidth}
            viewportHeight={viewportHeight}
            frameStyle={frameStyle}
            bgStyle={bgStyle}
            zoomPercent={zoomPercent}
          />
        </div>
      )}
    </div>
  );
}
