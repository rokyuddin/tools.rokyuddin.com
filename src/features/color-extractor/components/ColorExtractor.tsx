"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Pipette,
  Sparkles,
  RotateCcw,
  Check,
  Eye,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { CopyButton } from "@/components/common/CopyButton";
import {
  buildColorInfo,
  type ColorInfo,
} from "../utils/color-math";
import { extractDominantPalette } from "../utils/extract-palette";

export function ColorExtractor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dominantPalette, setDominantPalette] = useState<ColorInfo[]>([]);
  const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null);
  const [pickedColors, setPickedColors] = useState<ColorInfo[]>([]);

  // Hover state for loupe
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverColor, setHoverColor] = useState<ColorInfo | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setImageFile(file);

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = async () => {
      imgRef.current = img;
      renderCanvas(img);
      const palette = await extractDominantPalette(img, 8);
      setDominantPalette(palette);
      if (palette.length > 0) {
        setSelectedColor(palette[0]);
      }
    };
  };

  const renderCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

    setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color = buildColorInfo(pixel[0], pixel[1], pixel[2]);
    setHoverColor(color);
  };

  const handleCanvasMouseLeave = () => {
    setHoverPos(null);
    setHoverColor(null);
  };

  const handleCanvasClick = () => {
    if (hoverColor) {
      setSelectedColor(hoverColor);
      setPickedColors((prev) => {
        if (prev.some((c) => c.hex === hoverColor.hex)) return prev;
        return [hoverColor, ...prev.slice(0, 15)];
      });
    }
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(null);
    setImageUrl(null);
    setDominantPalette([]);
    setSelectedColor(null);
    setPickedColors([]);
    setHoverPos(null);
    setHoverColor(null);
  };

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      {!imageUrl && (
        <UploadDropzone
          title="Paste screenshot or upload image"
          subtitle="Press Ctrl+V to paste a screenshot directly from your clipboard, or browse."
          onFilesSelected={handleFilesSelected}
        />
      )}

      {imageUrl && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Canvas & Eyedropper Workspace */}
          <Card className="lg:col-span-7 border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Pipette className="size-5 text-primary" />
                  Interactive Eyedropper
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground h-8"
                >
                  <RotateCcw className="size-3 mr-1" />
                  Upload New
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Crosshair className="size-3.5 text-primary" />
                  Hover over image and click any pixel to pick its exact color
                </span>
                {hoverColor && (
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3.5 rounded-full border border-border"
                      style={{ backgroundColor: hoverColor.hex }}
                    />
                    <strong className="font-mono text-foreground">{hoverColor.hex}</strong>
                  </div>
                )}
              </div>

              {/* Canvas viewport container */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30 flex items-center justify-center min-h-[300px] max-h-[500px]">
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={handleCanvasMouseLeave}
                  onClick={handleCanvasClick}
                  className="max-h-[500px] max-w-full object-contain cursor-crosshair"
                />

                {/* Floating Eyedropper Magnifier Preview */}
                {hoverPos && hoverColor && (
                  <div
                    style={{
                      left: `${hoverPos.x + 15}px`,
                      top: `${hoverPos.y + 15}px`,
                    }}
                    className="pointer-events-none absolute z-20 flex flex-col items-center rounded-xl bg-card/95 backdrop-blur-sm border border-border p-2 shadow-xl animate-in zoom-in-90 duration-75"
                  >
                    <div
                      className="size-8 rounded-lg border-2 border-white shadow-xs mb-1"
                      style={{ backgroundColor: hoverColor.hex }}
                    />
                    <span className="font-mono text-[11px] font-bold text-foreground">
                      {hoverColor.hex}
                    </span>
                  </div>
                )}
              </div>

              {/* Dominant Palette Swatches */}
              {dominantPalette.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    Auto-Detected Dominant Palette:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {dominantPalette.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`group relative flex flex-col items-center p-1 rounded-xl border transition-all cursor-pointer ${
                          selectedColor?.hex === color.hex
                            ? "ring-2 ring-primary border-transparent scale-105"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div
                          className="size-10 rounded-lg shadow-xs"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-mono text-[10px] text-muted-foreground mt-1">
                          {color.hex}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* User Picked History */}
              {pickedColors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Eye className="size-3.5 text-primary" />
                    Your Picked Colors:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {pickedColors.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`group relative flex flex-col items-center p-1 rounded-xl border transition-all cursor-pointer ${
                          selectedColor?.hex === color.hex
                            ? "ring-2 ring-primary border-transparent scale-105"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div
                          className="size-9 rounded-lg shadow-xs"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-mono text-[10px] text-muted-foreground mt-1">
                          {color.hex}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Color Details & Copy Formats Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            {selectedColor ? (
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>Selected Color Details</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Large Swatch Preview */}
                  <div
                    className="h-28 rounded-2xl flex flex-col items-center justify-center p-4 shadow-inner border border-black/10 transition-colors"
                    style={{ backgroundColor: selectedColor.hex }}
                  >
                    <span
                      className="font-mono text-2xl font-bold tracking-wider drop-shadow-xs"
                      style={{
                        color: selectedColor.isLight ? "#000000" : "#ffffff",
                      }}
                    >
                      {selectedColor.hex}
                    </span>
                  </div>

                  {/* Copy Format Rows */}
                  <div className="space-y-2.5">
                    {/* HEX */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                          HEX
                        </span>
                        <span className="font-mono text-sm font-bold text-foreground">
                          {selectedColor.hex}
                        </span>
                      </div>
                      <CopyButton textToCopy={selectedColor.hex} size="sm" />
                    </div>

                    {/* RGB */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                          RGB
                        </span>
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {selectedColor.rgb}
                        </span>
                      </div>
                      <CopyButton textToCopy={selectedColor.rgb} size="sm" />
                    </div>

                    {/* HSL */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                          HSL
                        </span>
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {selectedColor.hsl}
                        </span>
                      </div>
                      <CopyButton textToCopy={selectedColor.hsl} size="sm" />
                    </div>

                    {/* CSS OKLCH */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                          CSS OKLCH
                        </span>
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {selectedColor.oklch}
                        </span>
                      </div>
                      <CopyButton textToCopy={selectedColor.oklch} size="sm" />
                    </div>
                  </div>

                  {/* Accessibility & Contrast Scores */}
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-2">
                    <span className="text-xs font-bold text-foreground block">
                      WCAG Text Contrast Readability:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-background border border-border">
                        <span className="text-muted-foreground text-[10px] block">On White text</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono font-bold">{selectedColor.contrastOnWhite}:1</span>
                          {selectedColor.contrastOnWhite >= 4.5 ? (
                            <Badge variant="success" className="text-[10px] py-0">
                              <Check className="size-3 mr-0.5" /> Pass AA
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] py-0">
                              Fail AA
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-background border border-border">
                        <span className="text-muted-foreground text-[10px] block">On Black text</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono font-bold">{selectedColor.contrastOnBlack}:1</span>
                          {selectedColor.contrastOnBlack >= 4.5 ? (
                            <Badge variant="success" className="text-[10px] py-0">
                              <Check className="size-3 mr-0.5" /> Pass AA
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] py-0">
                              Fail AA
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border text-muted-foreground">
                <Pipette className="size-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No color selected</p>
                <p className="text-xs mt-1">Click any pixel on the screenshot to inspect.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
