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
  RotateCcw,
  Sliders,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
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
    description: "Solid dark redaction",
  },
  {
    id: "whiteout",
    label: "White Box",
    icon: Square,
    description: "Solid white redaction",
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

  const handleReset = () => {
    setImage(null);
    setRectangles([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
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

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    loadImageFile(files[0]);
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
    <div className="space-y-8">
      {/* Upload Zone */}
      {!image && (
        <UploadDropzone
          title="Paste screenshot or upload image"
          subtitle="Press Ctrl+V to paste a screenshot directly from your clipboard, or browse."
          onFilesSelected={handleFilesSelected}
          sampleAction={{
            label: "Try Sample Image",
            onClick: handleLoadSample,
          }}
        />
      )}

      {image && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Main Canvas Workspace */}
          <Card className="lg:col-span-8 border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Droplets className="size-5 text-primary" />
                  Redaction Canvas
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="size-3.5 mr-1" />
                    Undo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo2 className="size-3.5 mr-1" />
                    Redo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={rectangles.length === 0}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                    title="Clear all redactions"
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    Clear
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    title="Upload new image"
                  >
                    <RotateCcw className="size-3 mr-1" />
                    Upload New
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status and instruction bar */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Crosshair className="size-3.5 text-primary" />
                  Click and drag to redact sensitive areas (names, cards, faces, emails)
                </span>
                <Badge variant="outline" className="text-[11px] font-normal shrink-0">
                  {rectangles.length} area{rectangles.length === 1 ? "" : "s"} redacted
                </Badge>
              </div>

              {/* Canvas viewport container */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30 flex items-center justify-center min-h-[320px] max-h-[560px] p-2">
                <div
                  ref={containerRef}
                  className="relative select-none cursor-crosshair max-w-full inline-block"
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                >
                  <canvas
                    ref={canvasRef}
                    className="max-h-[520px] max-w-full object-contain block rounded-lg shadow-xs"
                  />

                  {/* Real-time selection bounding box indicator */}
                  {isDrawing && dragBoxStyle && (
                    <div
                      style={dragBoxStyle}
                      className="absolute pointer-events-none border-2 border-dashed border-primary bg-primary/20 rounded-xs shadow-xs"
                    />
                  )}
                </div>
              </div>

              {/* Helpful footer hints */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
                <span>
                  Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono font-semibold">Ctrl+Z</kbd> Undo, <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono font-semibold">Ctrl+Y</kbd> Redo
                </span>
                <span>100% In-Browser Privacy</span>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Settings & Export Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* Redaction Mode / Effect Card */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="size-4 text-primary" />
                  Redaction Effect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
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
                          "group relative flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer",
                          isActive
                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                            : "border-border hover:border-primary/50 hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            className={cn(
                              "size-4",
                              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                              m.id === "blackout" && "fill-current",
                              m.id === "whiteout" && "fill-background stroke-current"
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              isActive ? "text-primary" : "text-foreground"
                            )}
                          >
                            {m.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground leading-tight">
                          {m.description}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Intensity Slider */}
                {(currentMode === "pixelate" || currentMode === "blur") && (
                  <div className="space-y-2.5 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {currentMode === "pixelate" ? "Pixel Block Size:" : "Blur Radius:"}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                        {strength}px
                      </span>
                    </div>
                    <Slider
                      value={strength}
                      min={currentMode === "pixelate" ? 4 : 2}
                      max={currentMode === "pixelate" ? 40 : 30}
                      step={2}
                      onValueChange={(val) => setStrength(val)}
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Light</span>
                      <span>Default ({currentMode === "pixelate" ? "16px" : "12px"})</span>
                      <span>Heavy</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export & Save Card */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="size-4 text-primary" />
                  Export & Share
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyToClipboard}
                  className="w-full justify-center gap-2 font-semibold h-10"
                >
                  {copied ? (
                    <>
                      <Check className="size-4 text-emerald-500" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4 text-muted-foreground" />
                      Copy Image to Clipboard
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={() => handleDownload("png")}
                  className="w-full justify-center gap-2 font-semibold h-10"
                >
                  <Download className="size-4" />
                  Download PNG
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleDownload("jpeg")}
                  className="w-full justify-center gap-2 font-medium text-xs h-9 text-muted-foreground hover:text-foreground"
                >
                  Download JPG
                </Button>

                <div className="pt-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground leading-normal">
                    <Check className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Redactions permanently replace pixel data before export.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
