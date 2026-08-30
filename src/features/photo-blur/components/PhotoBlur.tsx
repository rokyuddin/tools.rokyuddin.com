"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Grid,
  Droplets,
  Square,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { RedactionMode, RedactionRect } from "../types";
import {
  normalizeRect,
  clampRectToBounds,
  renderCanvasWithRedactions,
} from "../utils/canvas-redactor";
import { cn } from "@/lib/utils";

const MODES: Array<{
  id: RedactionMode;
  label: string;
  icon: React.ElementType;
  description: string;
}> = [
  {
    id: "pixelate",
    label: "Pixelate",
    icon: Grid,
    description: "Mosaic censor pixels",
  },
  {
    id: "blur",
    label: "Blur",
    icon: Droplets,
    description: "Smooth privacy blur",
  },
  {
    id: "blackout",
    label: "Black Box",
    icon: Square,
    description: "Solid dark redaction bar",
  },
  {
    id: "whiteout",
    label: "White Box",
    icon: Square,
    description: "Solid white redaction bar",
  },
];

export function PhotoBlur() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState("redacted-image.png");
  const [currentMode, setCurrentMode] = useState<RedactionMode>("pixelate");
  const [strength, setStrength] = useState(16); // Block size for pixelate, radius for blur
  const [rectangles, setRectangles] = useState<RedactionRect[]>([]);
  const [history, setHistory] = useState<RedactionRect[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Push new state to history
  const pushHistory = useCallback((newRects: RedactionRect[]) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newRects];
    });
    setHistoryIndex((prev) => prev + 1);
    setRectangles(newRects);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setRectangles(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setRectangles(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleClearAll = () => {
    if (rectangles.length === 0) return;
    pushHistory([]);
  };

  // Keyboard shortcut for Undo / Redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Global paste handler
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            loadImageFile(file);
            break;
          }
        }
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const loadImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImageName(file.name ? `redacted-${file.name}` : "redacted-image.png");
        setRectangles([]);
        setHistory([[]]);
        setHistoryIndex(0);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Re-render canvas whenever image or rectangles change
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    renderCanvasWithRedactions(canvasRef.current, image, rectangles);
  }, [image, rectangles]);

  // Coordinate conversion from viewport/client to image canvas pixel space
  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    if (!canvasRef.current || !image) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return {
      x: Math.max(0, Math.min(x, image.width)),
      y: Math.max(0, Math.min(y, image.height)),
    };
  };

  // Mouse & Touch events
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!image) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const coords = getCanvasCoordinates(clientX, clientY);
    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentPoint(coords);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const coords = getCanvasCoordinates(clientX, clientY);
    setCurrentPoint(coords);
  };

  const handlePointerUp = () => {
    if (!isDrawing || !startPoint || !currentPoint || !image) {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoint(null);
      return;
    }

    const norm = normalizeRect(
      startPoint.x,
      startPoint.y,
      currentPoint.x,
      currentPoint.y
    );

    const clamped = clampRectToBounds(norm, image.width, image.height);

    // Ignore accidental microscopic clicks
    if (clamped.width > 4 && clamped.height > 4) {
      const newRect: RedactionRect = {
        id: `rect-${Date.now()}-${Math.random()}`,
        x: clamped.x,
        y: clamped.y,
        width: clamped.width,
        height: clamped.height,
        mode: currentMode,
        strength: currentMode === "pixelate" || currentMode === "blur" ? strength : 0,
      };

      pushHistory([...rectangles, newRect]);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
  };

  const handleDownload = (format: "png" | "jpeg" = "png") => {
    if (!canvasRef.current) return;
    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    const extension = format === "jpeg" ? ".jpg" : ".png";
    const baseName = imageName.replace(/\.[^/.]+$/, "");

    const link = document.createElement("a");
    link.download = `${baseName}${extension}`;
    link.href = canvasRef.current.toDataURL(mimeType, 0.92);
    link.click();
  };

  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }, "image/png");
    } catch (err) {
      console.warn("Failed to copy image to clipboard:", err);
    }
  };

  // Sample image loader for quick instant demonstration
  const handleLoadSample = () => {
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 720;
    sampleCanvas.height = 420;
    const ctx = sampleCanvas.getContext("2d");
    if (!ctx) return;

    // Draw mock document/card
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(0, 0, 720, 420);

    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("Confidential Account Statement", 40, 60);

    ctx.fillStyle = "#64748B";
    ctx.font = "14px sans-serif";
    ctx.fillText("Account Holder: John Doe", 40, 110);
    ctx.fillText("Phone Number: +1 (555) 019-2834", 40, 140);
    ctx.fillText("Credit Card: 4532 •••• •••• 8821", 40, 170);
    ctx.fillText("Email Address: john.doe@secretcompany.com", 40, 200);
    ctx.fillText("Billing Address: 742 Evergreen Terrace, Springfield", 40, 230);
    ctx.fillText("PIN / Passcode: 9482", 40, 260);

    // Accent box
    ctx.fillStyle = "#E2E8F0";
    ctx.roundRect(40, 300, 640, 70, 12);
    ctx.fill();

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("Drag over any sensitive text or numbers to blur or pixelate!", 60, 340);

    const img = new Image();
    img.onload = () => {
      setImage(img);
      setImageName("sample-statement.png");
      setRectangles([]);
      setHistory([[]]);
      setHistoryIndex(0);
    };
    img.src = sampleCanvas.toDataURL("image/png");
  };

  // Calculate live drag box overlay on screen
  let dragBoxStyle: React.CSSProperties | null = null;
  if (isDrawing && startPoint && currentPoint && canvasRef.current) {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = rect.width / canvasRef.current.width;
    const scaleY = rect.height / canvasRef.current.height;

    const norm = normalizeRect(
      startPoint.x,
      startPoint.y,
      currentPoint.x,
      currentPoint.y
    );

    dragBoxStyle = {
      left: `${norm.x * scaleX}px`,
      top: `${norm.y * scaleY}px`,
      width: `${norm.width * scaleX}px`,
      height: `${norm.height * scaleY}px`,
    };
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Upload State */}
      {!image ? (
        <Card className="p-8 sm:p-12 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/60 backdrop-blur-xs hover:border-primary/50 transition-colors">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <ImageIcon className="size-8 stroke-1.5" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground">
                Upload or Paste an Image
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Drag and drop your screenshot, photo, or press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono">
                  Ctrl+V
                </kbd>{" "}
                to paste from clipboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) loadImageFile(file);
                  }}
                  className="hidden"
                />
                <Button size="lg" asChild className="rounded-2xl font-semibold gap-2">
                  <span>
                    <Upload className="size-4" />
                    Browse Photo
                  </span>
                </Button>
              </label>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleLoadSample}
                className="rounded-2xl font-semibold gap-2"
              >
                <Sparkles className="size-4 text-primary" />
                Try Sample Image
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* Active Redaction Editor */
        <div className="space-y-4">
          {/* Top Controls Toolbar */}
          <Card className="p-3 sm:p-4 rounded-3xl border-border/80 bg-card/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Mode Selectors */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border/50">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const isActive = currentMode === m.id;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setCurrentMode(m.id);
                        if (m.id === "pixelate" && strength > 40) setStrength(16);
                        if (m.id === "blur" && strength > 30) setStrength(12);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer select-none",
                        isActive
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-3.5",
                          m.id === "blackout" && "fill-foreground",
                          m.id === "whiteout" && "fill-background stroke-foreground"
                        )}
                      />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* History & Reset Actions */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="size-9 p-0 rounded-xl"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="size-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="size-9 p-0 rounded-xl"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="size-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={rectangles.length === 0}
                  className="size-9 p-0 rounded-xl text-muted-foreground hover:text-destructive"
                  title="Clear all redactions"
                >
                  <Trash2 className="size-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setImage(null)}
                  className="h-9 px-2.5 text-xs text-muted-foreground rounded-xl gap-1"
                  title="Change image"
                >
                  <RotateCcw className="size-3.5" />
                  <span>New</span>
                </Button>
              </div>
            </div>

            {/* Intensity / Strength Slider (for Pixelate & Blur) */}
            {(currentMode === "pixelate" || currentMode === "blur") && (
              <div className="flex items-center gap-4 pt-1 border-t border-border/50 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 font-medium">
                  <Sliders className="size-3.5" />
                  <span>
                    {currentMode === "pixelate" ? "Pixel Block Size:" : "Blur Radius:"}
                  </span>
                  <span className="text-foreground font-bold">{strength}px</span>
                </div>

                <div className="flex-1 max-w-xs">
                  <Slider
                    value={strength}
                    min={currentMode === "pixelate" ? 4 : 2}
                    max={currentMode === "pixelate" ? 40 : 30}
                    step={2}
                    onValueChange={(val) => setStrength(val)}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Interactive Canvas Viewport */}
          <Card className="p-2 sm:p-4 rounded-3xl border-border/80 bg-black/5 dark:bg-black/40 overflow-hidden flex items-center justify-center min-h-[360px]">
            <div
              ref={containerRef}
              className="relative select-none cursor-crosshair max-w-full overflow-hidden rounded-2xl shadow-sm inline-block"
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            >
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl block"
              />

              {/* Real-time selection bounding box indicator */}
              {isDrawing && dragBoxStyle && (
                <div
                  style={dragBoxStyle}
                  className="absolute pointer-events-none border-2 border-dashed border-primary bg-primary/20 rounded-xs shadow-xs"
                />
              )}
            </div>
          </Card>

          {/* Bottom Export Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] font-normal">
                {rectangles.length} area{rectangles.length === 1 ? "" : "s"} redacted
              </Badge>
              <span>100% in-browser privacy</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleCopyToClipboard}
                className="flex-1 sm:flex-none rounded-2xl font-semibold gap-2"
              >
                {copied ? (
                  <>
                    <Check className="size-4 text-emerald-500" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    Copy Image
                  </>
                )}
              </Button>

              <Button
                type="button"
                size="lg"
                onClick={() => handleDownload("png")}
                className="flex-1 sm:flex-none rounded-2xl font-bold gap-2 bg-primary text-primary-foreground shadow-xs hover:opacity-90"
              >
                <Download className="size-4" />
                Download PNG
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
