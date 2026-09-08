"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  Crop,
  Download,
  FileArchive,
  FlipHorizontal2,
  FlipVertical2,
  Info,
  RotateCcw,
  RotateCw,
  Sliders,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { formatBytes, triggerDownload } from "@/lib/utils";
import {
  MAX_DIMENSION,
  SOCIAL_PRESETS,
  generateResizedFileName,
  isUpscale,
  resolveByPercentage,
  resolveBySize,
  resolveSocialPreset,
  validateTargetFileSizeKB,
  type FitMode,
  type ResizeMode,
} from "../utils/resize-engine";
import {
  FULL_CROP,
  extensionForMime,
  loadImageFile,
  renderResizedBlob,
  renderToTargetSize,
  resolveMimeType,
  type CropRect,
  type Rotation,
} from "../utils/render-image";

interface QueueItem {
  id: string;
  file: File;
  img: HTMLImageElement;
  origW: number;
  origH: number;
}

interface Transform {
  rotation: Rotation;
  flipH: boolean;
  flipV: boolean;
  crop: CropRect;
}

interface Output {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  reached: boolean;
}

const DEFAULT_TRANSFORM: Transform = {
  rotation: 0,
  flipH: false,
  flipV: false,
  crop: FULL_CROP,
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif";
const MAX_FILES = 10;

function revokeOutputs(outputs: Record<string, Output>) {
  Object.values(outputs).forEach((o) => URL.revokeObjectURL(o.url));
}

export function ImageResizer() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [transforms, setTransforms] = useState<Record<string, Transform>>({});
  const [outputs, setOutputs] = useState<Record<string, Output>>({});
  const [mode, setMode] = useState<ResizeMode>("size");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [lastDim, setLastDim] = useState<"width" | "height">("width");
  const [lockAspect, setLockAspect] = useState(true);
  const [percent, setPercent] = useState(100);
  const [presetId, setPresetId] = useState(SOCIAL_PRESETS[0].id);
  const [fit, setFit] = useState<FitMode>("crop-fill");
  const [format, setFormat] = useState("original");
  const [quality, setQuality] = useState(90);
  const [targetKB, setTargetKB] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const renderSeq = useRef(0);

  const targetOf = useCallback(
    (item: QueueItem) => {
      if (mode === "percentage") return resolveByPercentage(item.origW, item.origH, percent);
      if (mode === "social") return resolveSocialPreset(presetId);
      return resolveBySize(
        item.origW,
        item.origH,
        width ? Number(width) : undefined,
        height ? Number(height) : undefined,
        lockAspect,
        lastDim,
      );
    },
    [mode, percent, presetId, width, height, lockAspect, lastDim],
  );

  // Fit modes only apply to Social presets; exact modes render without cropping
  const activeFit: FitMode = mode === "social" ? fit : "stretch";

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setError(null);
    const capped = files.slice(0, MAX_FILES);
    const loaded: QueueItem[] = [];
    for (const file of capped) {
      if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
        setError(`SVG is not supported: ${file.name}`);
        continue;
      }
      try {
        const img = await loadImageFile(file);
        if (img.naturalWidth > MAX_DIMENSION || img.naturalHeight > MAX_DIMENSION) {
          setError(`Image exceeds ${MAX_DIMENSION}px on a side: ${file.name}`);
          continue;
        }
        loaded.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          img,
          origW: img.naturalWidth || img.width,
          origH: img.naturalHeight || img.height,
        });
      } catch {
        setError(`Could not read image: ${file.name}`);
      }
    }
    if (loaded.length > 0) {
      setItems((prev) => {
        const next = [...prev, ...loaded].slice(0, MAX_FILES);
        if (!width && !height && next.length > 0) {
          setWidth(String(next[0].origW));
          setHeight(String(next[0].origH));
        }
        return next;
      });
    }
  }, [width, height]);

  const updateTransform = useCallback((id: string, patch: Partial<Transform>) => {
    setTransforms((prev) => ({ ...prev, [id]: { ...(prev[id] ?? DEFAULT_TRANSFORM), ...patch } }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setTransforms((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setOutputs((prev) => {
      const out = prev[id];
      if (out) URL.revokeObjectURL(out.url);
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setOutputs((prev) => {
      revokeOutputs(prev);
      return {};
    });
    setItems([]);
    setTransforms({});
    setError(null);
  }, []);

  // Re-render all outputs when inputs change
  useEffect(() => {
    if (items.length === 0) return;
    const seq = ++renderSeq.current;
    setIsProcessing(true);
    const timer = setTimeout(async () => {
      const next: Record<string, Output> = {};
      const targetKBNum = targetKB ? Number(targetKB) : NaN;
      for (const item of items) {
        const t = transforms[item.id] ?? DEFAULT_TRANSFORM;
        const target = targetOf(item);
        const mime = resolveMimeType(format, item.file.type);
        const useTargetSize =
          Number.isFinite(targetKBNum) && validateTargetFileSizeKB(targetKBNum, mime).isValid;
        try {
          const res = useTargetSize
            ? await renderToTargetSize(
                item.img,
                { target, fit: activeFit, rotation: t.rotation, flipH: t.flipH, flipV: t.flipV, crop: t.crop, mimeType: mime },
                targetKBNum,
              )
            : await renderResizedBlob(item.img, {
                target,
                fit: activeFit,
                rotation: t.rotation,
                flipH: t.flipH,
                flipV: t.flipV,
                crop: t.crop,
                mimeType: mime,
                quality: quality / 100,
              });
          if (seq !== renderSeq.current) return;
          next[item.id] = {
            blob: res.blob,
            url: URL.createObjectURL(res.blob),
            width: res.width,
            height: res.height,
            size: res.blob.size,
            reached: useTargetSize ? (res as unknown as { reached: boolean }).reached !== false : true,
          };
        } catch {
          // keep previous output on failure
        }
      }
      if (seq !== renderSeq.current) return;
      setOutputs((prev) => {
        revokeOutputs(prev);
        return next;
      });
      setIsProcessing(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [items, transforms, targetOf, activeFit, format, quality, targetKB]);

  useEffect(() => {
    return () => {
      setOutputs((prev) => {
        revokeOutputs(prev);
        return prev;
      });
    };
  }, []);

  const outputFileName = useCallback(
    (item: QueueItem, out: Output) => {
      const mime = resolveMimeType(format, item.file.type);
      const base = item.file.name.replace(/\.[^.]+$/, "") || item.file.name;
      return generateResizedFileName(`${base}${extensionForMime(mime)}`, out.width, out.height);
    },
    [format],
  );

  const downloadOne = useCallback(
    (item: QueueItem) => {
      const out = outputs[item.id];
      if (!out) return;
      triggerDownload(out.url, outputFileName(item, out));
    },
    [outputs, outputFileName],
  );

  const downloadAllZip = useCallback(async () => {
    const zip = new JSZip();
    for (const item of items) {
      const out = outputs[item.id];
      if (!out) continue;
      zip.file(outputFileName(item, out), out.blob);
    }
    const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    const url = URL.createObjectURL(content);
    triggerDownload(url, "resized-images.zip");
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [items, outputs, outputFileName]);

  const totalOut = useMemo(
    () => Object.values(outputs).reduce((a, o) => a + o.size, 0),
    [outputs],
  );

  if (items.length === 0) {
    return (
      <div className="space-y-8">
        <UploadDropzone
          multiple
          accept={ACCEPT}
          maxSizeMB={50}
          title="Drop your images here, or browse"
          subtitle="Supports JPG, PNG, WebP, AVIF, GIF, BMP up to 50MB. Processed 100% locally in your browser."
          onFilesSelected={handleFilesSelected}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12 items-start">
      {/* Settings sidebar */}
      <Card className="lg:col-span-4 border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sliders className="size-4 text-primary" />
              Resize Settings
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAll}
              className="text-xs text-muted-foreground hover:text-foreground h-8"
            >
              <RotateCcw className="size-3 mr-1" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as ResizeMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="size">By Size</TabsTrigger>
              <TabsTrigger value="percentage">As %</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
          </Tabs>

          {mode === "size" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs">Width (px)</FieldLabel>
                  <Input
                    value={width}
                    onChange={(e) => { setWidth(e.target.value.replace(/[^0-9]/g, "")); setLastDim("width"); }}
                    placeholder="Enter Width"
                    inputMode="numeric"
                  />
                </Field>
                <Field>
                  <FieldLabel className="text-xs">Height (px)</FieldLabel>
                  <Input
                    value={height}
                    onChange={(e) => { setHeight(e.target.value.replace(/[^0-9]/g, "")); setLastDim("height"); }}
                    placeholder="Enter Height"
                    inputMode="numeric"
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="size-3.5 accent-primary"
                />
                Lock Aspect Ratio
              </label>
            </div>
          )}

          {mode === "percentage" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">Scale:</span>
                <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                  {percent}%
                </span>
              </div>
              <Slider value={percent} onValueChange={setPercent} min={1} max={300} step={1} />
              <div className="grid grid-cols-4 gap-1.5">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPercent(p)}
                    className={`text-xs py-1.5 rounded-md font-semibold border transition-colors cursor-pointer ${
                      percent === p
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "social" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-1.5">
                {SOCIAL_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPresetId(p.id)}
                    className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      presetId === p.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="font-mono">{p.width}×{p.height}</span>
                  </button>
                ))}
              </div>
              <Field>
                <FieldLabel className="text-xs">Fit</FieldLabel>
                <select
                  aria-label="Social preset fit mode"
                  value={fit}
                  onChange={(e) => setFit(e.target.value as FitMode)}
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  <option value="crop-fill">Crop fill</option>
                  <option value="blur-fill">Blur fill</option>
                  <option value="stretch">Stretch</option>
                </select>
              </Field>
            </div>
          )}

          <div className="space-y-6 pt-2 border-t border-border/60">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-foreground block pt-2">
                Export Settings
              </span>
              <Field>
                <FieldLabel className="text-xs">Target File Size (optional, JPG/WebP)</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    value={targetKB}
                    onChange={(e) => setTargetKB(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="e.g. 200"
                    inputMode="numeric"
                  />
                  <span className="rounded-xl border border-border bg-muted px-3 py-2 text-xs font-mono shrink-0 flex items-center">KB</span>
                </div>
              </Field>
              <Field>
                <FieldLabel className="text-xs">Save Image As</FieldLabel>
                <select
                  aria-label="Export format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  <option value="original">Original</option>
                  <option value="jpeg">JPG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </Field>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">Quality Level:</span>
                  <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {quality}%
                  </span>
                </div>
                <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={1} />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Smaller File</span>
                  <span>Balanced (90%)</span>
                  <span>High Quality</span>
                </div>
              </div>
            </div>
            {totalOut > 0 && (
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total output:</span>
                  <span className="font-mono font-medium text-foreground">{formatBytes(totalOut)}</span>
                </div>
              </div>
            )}
            <Button type="button" onClick={downloadAllZip} disabled={items.length === 0} className="w-full">
              <Download className="size-4 mr-2" /> Export {isProcessing ? "(…)" : `(${items.length})`}
            </Button>
            <div className="pt-2">
              <UploadDropzone
                multiple
                accept={ACCEPT}
                maxSizeMB={50}
                title="Add more images"
                subtitle="Drop, browse, or press Ctrl+V to paste"
                onFilesSelected={handleFilesSelected}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <FileArchive className="size-5 text-primary" />
            <span>Resized Images ({items.length})</span>
            {isProcessing && (
              <span className="text-xs font-normal text-muted-foreground animate-pulse">
                (Processing...)
              </span>
            )}
          </h3>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => {
            const target = targetOf(item);
            const out = outputs[item.id];
            const t = transforms[item.id] ?? DEFAULT_TRANSFORM;
            const upscale = isUpscale(item.origW, item.origH, target.width, target.height);
            return (
              <Card key={item.id} className="border-border shadow-xs overflow-hidden flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground truncate" title={item.file.name}>
                      {item.file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      title="Remove file"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-xs font-semibold text-muted-foreground font-mono">
                    {item.origW}×{item.origH} → <span className="text-primary">{target.width}×{target.height}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-muted/40 border border-border flex items-center justify-center p-2">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                      <Button type="button" variant="ghost" size="icon-sm" title="Crop" onClick={() => setExpandedCrop(expandedCrop === item.id ? null : item.id)} className="bg-background/90 border border-border h-7 w-7" data-active={expandedCrop === item.id}>
                        <Crop className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="Rotate 90°"
                        onClick={() => updateTransform(item.id, { rotation: ((t.rotation + 90) % 360) as Rotation })}
                        className="bg-background/90 border border-border h-7 w-7"
                      >
                        <RotateCw className="size-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" title="Flip horizontal" onClick={() => updateTransform(item.id, { flipH: !t.flipH })} className="bg-background/90 border border-border h-7 w-7" data-active={t.flipH}>
                        <FlipHorizontal2 className="size-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" title="Flip vertical" onClick={() => updateTransform(item.id, { flipV: !t.flipV })} className="bg-background/90 border border-border h-7 w-7" data-active={t.flipV}>
                        <FlipVertical2 className="size-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" title="Info" onClick={() => setShowInfo(showInfo === item.id ? null : item.id)} className="bg-background/90 border border-border h-7 w-7" data-active={showInfo === item.id}>
                        <Info className="size-3.5" />
                      </Button>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={out?.url ?? item.img.src}
                      alt={item.file.name}
                      className="max-h-full max-w-full object-contain rounded-md"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {out && (
                      <span>
                        <strong className="text-foreground font-mono">{formatBytes(out.size)}</strong>
                      </span>
                    )}
                    {out && !out.reached && (
                      <Badge variant="destructive" className="text-[10px] py-0">
                        target size unreachable
                      </Badge>
                    )}
                    {upscale && (
                      <Badge variant="warning" className="text-[10px] py-0">
                        larger than original
                      </Badge>
                    )}
                  </div>
                  {showInfo === item.id && (
                    <p className="text-[11px] text-muted-foreground/80">
                      {item.file.type || "unknown type"} · {formatBytes(item.file.size)} · {item.origW}×{item.origH}px
                    </p>
                  )}
                  {expandedCrop === item.id && (
                    <div className="grid grid-cols-4 gap-2 rounded-xl border border-border bg-muted/30 p-3">
                      {(["x", "y", "w", "h"] as const).map((k) => (
                        <Field key={k}>
                          <FieldLabel className="text-[10px] uppercase">{k} %</FieldLabel>
                          <Input
                            inputSize="sm"
                            value={Math.round(t.crop[k] * 100)}
                            onChange={(e) => {
                              const v = Math.min(100, Math.max(0, Number(e.target.value) || 0)) / 100;
                              updateTransform(item.id, { crop: { ...t.crop, [k]: v } });
                            }}
                            inputMode="numeric"
                          />
                        </Field>
                      ))}
                      <button type="button" onClick={() => updateTransform(item.id, { crop: FULL_CROP })} className="col-span-4 text-[11px] font-medium text-primary hover:underline cursor-pointer">Reset crop</button>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => downloadOne(item)}
                    disabled={!out}
                    className="w-full text-xs"
                  >
                    <Download className="size-3.5 mr-1" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
