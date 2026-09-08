"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  Crop,
  Download,
  FlipHorizontal2,
  FlipVertical2,
  Info,
  Plus,
  RotateCw,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="space-y-3">
        <div className="rounded-2xl bg-blue-500/90 p-2 sm:p-3">
          <div className="rounded-xl border-2 border-dashed border-white/50 bg-blue-500 px-4 py-10 text-center">
            <UploadDropzone
              multiple
              accept={ACCEPT}
              maxSizeMB={50}
              title="Select Images"
              subtitle="or, drag and drop images here — JPG, PNG, WebP, AVIF, GIF, BMP up to 50MB"
              onFilesSelected={handleFilesSelected}
              className="[&>div:first-child]:border-0 [&>div:first-child]:bg-transparent [&>div:first-child]:shadow-none"
            />
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* Settings sidebar */}
      <Card className="lg:col-span-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Resize Settings
            <Button variant="ghost" size="sm" onClick={resetAll} className="text-xs">
              <Trash2 className="size-3 mr-1" /> Clear
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1 text-xs font-semibold">
            {(["size", "percentage", "social"] as ResizeMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md py-1.5 cursor-pointer ${mode === m ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
              >
                {m === "size" ? "By Size" : m === "percentage" ? "As %" : "Social"}
              </button>
            ))}
          </div>

          {mode === "size" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs space-y-1">
                  <span className="font-semibold">Width (px)</span>
                  <input
                    value={width}
                    onChange={(e) => { setWidth(e.target.value.replace(/[^0-9]/g, "")); setLastDim("width"); }}
                    placeholder="Enter Width"
                    inputMode="numeric"
                    className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
                  />
                </label>
                <label className="text-xs space-y-1">
                  <span className="font-semibold">Height (px)</span>
                  <input
                    value={height}
                    onChange={(e) => { setHeight(e.target.value.replace(/[^0-9]/g, "")); setLastDim("height"); }}
                    placeholder="Enter Height"
                    inputMode="numeric"
                    className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="size-3.5 accent-blue-500"
                />
                Lock Aspect Ratio
              </label>
            </div>
          )}

          {mode === "percentage" && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Scale</span>
                <span className="font-mono text-primary">{percent}%</span>
              </div>
              <Slider value={percent} onValueChange={setPercent} min={1} max={300} step={1} />
              <div className="grid grid-cols-4 gap-1.5">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPercent(p)}
                    className={`text-xs py-1.5 rounded-md font-semibold border cursor-pointer ${percent === p ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "social" && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-1.5">
                {SOCIAL_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPresetId(p.id)}
                    className={`flex justify-between rounded-md border px-2.5 py-2 text-xs font-medium cursor-pointer ${presetId === p.id ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"}`}
                  >
                    <span>{p.label}</span>
                    <span className="font-mono">{p.width}×{p.height}</span>
                  </button>
                ))}
              </div>
              <label className="text-xs space-y-1 block">
                <span className="font-semibold">Fit</span>
                <select
                  value={fit}
                  onChange={(e) => setFit(e.target.value as FitMode)}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
                >
                  <option value="crop-fill">Crop fill</option>
                  <option value="blur-fill">Blur fill</option>
                  <option value="stretch">Stretch</option>
                </select>
              </label>
            </div>
          )}

          <div className="space-y-3 border-t border-border/60 pt-4">
            <h4 className="text-sm font-bold">Export Settings</h4>
            <label className="text-xs space-y-1 block">
              <span className="font-semibold">Target File Size (optional, JPG/WebP)</span>
              <div className="flex gap-2">
                <input
                  value={targetKB}
                  onChange={(e) => setTargetKB(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="e.g. 200"
                  inputMode="numeric"
                  className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
                />
                <span className="rounded-md border border-border bg-muted px-3 py-2 text-xs font-mono">KB</span>
              </div>
            </label>
            <label className="text-xs space-y-1 block">
              <span className="font-semibold">Save Image As</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm"
              >
                <option value="original">Original</option>
                <option value="jpeg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </label>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span>Quality</span>
                <span className="font-mono text-primary">{quality}%</span>
              </div>
              <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={1} />
            </div>
            {totalOut > 0 && (
              <p className="text-xs text-muted-foreground">Total output: {formatBytes(totalOut)}</p>
            )}
            <Button type="button" onClick={downloadAllZip} disabled={items.length === 0} className="w-full">
              <Download className="size-4 mr-2" /> Export {isProcessing ? "(…)" : `(${items.length})`}
            </Button>
            <UploadDropzone
              multiple
              accept={ACCEPT}
              maxSizeMB={50}
              title="Add more"
              subtitle="Drop, browse, or Ctrl+V paste"
              onFilesSelected={handleFilesSelected}
              className="[&>div:first-child]:p-4"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <div className="lg:col-span-8 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="font-bold flex items-center gap-2">
            <Plus className="size-4 text-primary" /> Images ({items.length})
            {isProcessing && <span className="text-xs font-normal text-muted-foreground animate-pulse">(Processing…)</span>}
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const target = targetOf(item);
            const out = outputs[item.id];
            const t = transforms[item.id] ?? DEFAULT_TRANSFORM;
            const upscale = isUpscale(item.origW, item.origH, target.width, target.height);
            return (
              <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="relative bg-muted/40 flex items-center justify-center min-h-40 p-2">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    <button type="button" title="Crop" onClick={() => setExpandedCrop(expandedCrop === item.id ? null : item.id)} className="rounded-full bg-background/90 p-1.5 border border-border hover:text-primary cursor-pointer"><Crop className="size-3.5" /></button>
                    <button
                      type="button"
                      title="Rotate 90°"
                      onClick={() => updateTransform(item.id, { rotation: ((t.rotation + 90) % 360) as Rotation })}
                      className="rounded-full bg-background/90 p-1.5 border border-border hover:text-primary cursor-pointer"
                    >
                      <RotateCw className="size-3.5" />
                    </button>
                    <button type="button" title="Flip H" onClick={() => updateTransform(item.id, { flipH: !t.flipH })} className="rounded-full bg-background/90 p-1.5 border border-border hover:text-primary cursor-pointer"><FlipHorizontal2 className="size-3.5" /></button>
                    <button type="button" title="Flip V" onClick={() => updateTransform(item.id, { flipV: !t.flipV })} className="rounded-full bg-background/90 p-1.5 border border-border hover:text-primary cursor-pointer"><FlipVertical2 className="size-3.5" /></button>
                    <button type="button" title="Info" onClick={() => setShowInfo(showInfo === item.id ? null : item.id)} className="rounded-full bg-background/90 p-1.5 border border-border hover:text-primary cursor-pointer"><Info className="size-3.5" /></button>
                    <button type="button" title="Remove" onClick={() => removeItem(item.id)} className="rounded-full bg-background/90 p-1.5 border border-border hover:text-destructive cursor-pointer"><X className="size-3.5" /></button>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={out?.url ?? item.img.src} alt={item.file.name} className="max-h-56 object-contain" />
                </div>
                <div className="p-3 space-y-2">
                  <h4 className="text-sm font-semibold truncate" title={item.file.name}>{item.file.name}</h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{item.origW}×{item.origH}</span>
                    <span>→</span>
                    <span className="rounded bg-blue-500/15 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 font-mono font-bold">{target.width}×{target.height}</span>
                    {out && <Badge variant="secondary" className="text-[10px]">{formatBytes(out.size)}</Badge>}
                    {upscale && <span className="text-[10px] text-amber-600">larger than original</span>}
                    {out && !out.reached && <span className="text-[10px] text-destructive">target size unreachable</span>}
                  </div>
                  {showInfo === item.id && (
                    <p className="text-[11px] text-muted-foreground">
                      {item.file.type || "unknown type"} · {formatBytes(item.file.size)} · {item.origW}×{item.origH}px
                    </p>
                  )}
                  {expandedCrop === item.id && (
                    <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-border p-2">
                      {(["x", "y", "w", "h"] as const).map((k) => (
                        <label key={k} className="text-[10px] space-y-0.5">
                          <span className="font-semibold uppercase">{k}</span>
                          <input
                            value={Math.round(t.crop[k] * 100)}
                            onChange={(e) => {
                              const v = Math.min(100, Math.max(0, Number(e.target.value) || 0)) / 100;
                              updateTransform(item.id, { crop: { ...t.crop, [k]: v } });
                            }}
                            inputMode="numeric"
                            className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs"
                          />
                        </label>
                      ))}
                      <button type="button" onClick={() => updateTransform(item.id, { crop: FULL_CROP })} className="col-span-4 text-[11px] text-primary hover:underline cursor-pointer">Reset crop</button>
                    </div>
                  )}
                  <Button type="button" size="sm" onClick={() => downloadOne(item)} disabled={!out} className="w-full text-xs">
                    <Download className="size-3.5 mr-1" /> Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
