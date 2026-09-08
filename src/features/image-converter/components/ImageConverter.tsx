"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { ArrowRight, Download, FileArchive, SlidersHorizontal, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { formatBytes, triggerDownload } from "@/lib/utils";
import {
  MAX_DIMENSION,
  resolveBySize,
  validateTargetFileSizeKB,
} from "@/features/image-resizer/utils/resize-engine";
import {
  convertedFileName,
  loadImageFile,
  renderResizedBlob,
  renderToTargetSize,
} from "@/features/image-resizer/utils/render-image";
import { ConvertOptionsModal } from "./ConvertOptionsModal";

export interface ConvertOptions {
  format: "jpeg" | "png" | "webp";
  quality: number;
  resizeMode: "original" | "custom";
  width: string;
  height: string;
  lastDim: "width" | "height";
  lockAspect: boolean;
  background: string;
  targetKB: string;
}

interface QueueItem {
  id: string;
  file: File;
  img: HTMLImageElement;
  previewUrl: string;
  origW: number;
  origH: number;
  inputLabel: string;
}

interface Output {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  reached: boolean;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif";
const MAX_FILES = 10;

const MIME_OF: Record<ConvertOptions["format"], string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const FORMAT_LABELS: Record<ConvertOptions["format"], string> = {
  jpeg: "JPG",
  png: "PNG",
  webp: "WebP",
};

function defaultOptionsFor(fileName: string, origW: number, origH: number): ConvertOptions {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const format: ConvertOptions["format"] =
    ext === "png" ? "png" : ext === "webp" ? "webp" : "jpeg";
  return {
    format,
    quality: 85,
    resizeMode: "original",
    width: String(origW),
    height: String(origH),
    lastDim: "width",
    lockAspect: true,
    background: "#ffffff",
    targetKB: "",
  };
}

function inputLabelFor(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "JPG",
    jpeg: "JPG",
    png: "PNG",
    webp: "WEBP",
    gif: "GIF",
    bmp: "BMP",
    avif: "AVIF",
  };
  return map[ext] ?? (file.type.split("/")[1]?.toUpperCase() || "IMG");
}

export function ImageConverter() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [options, setOptions] = useState<Record<string, ConvertOptions>>({});
  const [outputs, setOutputs] = useState<Record<string, Output>>({});
  const [optionsFor, setOptionsFor] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderSeq = useRef(0);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setError(null);
    const loaded: QueueItem[] = [];
    const newOptions: Record<string, ConvertOptions> = {};
    for (const file of files.slice(0, MAX_FILES)) {
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".svg") || file.type === "image/svg+xml") {
        setError(`SVG is not supported: ${file.name}`);
        continue;
      }
      if (lower.endsWith(".heic") || lower.endsWith(".heif") || file.type === "image/heic" || file.type === "image/heif") {
        setError(`HEIC/HEIF cannot be decoded in browsers: ${file.name}`);
        continue;
      }
      try {
        const img = await loadImageFile(file);
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;
        if (origW > MAX_DIMENSION || origH > MAX_DIMENSION) {
          setError(`Image exceeds ${MAX_DIMENSION}px on a side: ${file.name}`);
          continue;
        }
        const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        loaded.push({
          id,
          file,
          img,
          previewUrl: URL.createObjectURL(file),
          origW,
          origH,
          inputLabel: inputLabelFor(file),
        });
        newOptions[id] = defaultOptionsFor(file.name, origW, origH);
      } catch {
        setError(`Could not read image: ${file.name}`);
      }
    }
    if (loaded.length > 0) {
      setOptions((prev) => ({ ...prev, ...newOptions }));
      setItems((prev) => [...prev, ...loaded].slice(0, MAX_FILES));
    }
  }, []);

  const patchOptions = useCallback((id: string, patch: Partial<ConvertOptions>) => {
    setOptions((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    setOptions((prev) => {
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
    setOptionsFor((cur) => (cur === id ? null : cur));
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const seq = ++renderSeq.current;
    setIsProcessing(true);
    const timer = setTimeout(async () => {
      const next: Record<string, Output> = {};
      for (const item of items) {
        const o = options[item.id];
        if (!o) continue;
        const mime = MIME_OF[o.format];
        const target =
          o.resizeMode === "custom"
            ? resolveBySize(
                item.origW,
                item.origH,
                o.width ? Number(o.width) : undefined,
                o.height ? Number(o.height) : undefined,
                o.lockAspect,
                o.lastDim,
              )
            : { width: item.origW, height: item.origH };
        const targetKBNum = o.targetKB ? Number(o.targetKB) : NaN;
        const useTargetSize =
          o.format !== "png" &&
          Number.isFinite(targetKBNum) &&
          validateTargetFileSizeKB(targetKBNum, mime).isValid;
        try {
          const res = useTargetSize
            ? await renderToTargetSize(
                item.img,
                { target, fit: "stretch", mimeType: mime, background: o.background },
                targetKBNum,
              )
            : await renderResizedBlob(item.img, {
                target,
                fit: "stretch",
                mimeType: mime,
                quality: o.quality / 100,
                background: o.background,
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
        Object.values(prev).forEach((o) => URL.revokeObjectURL(o.url));
        return next;
      });
      setIsProcessing(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [items, options]);

  useEffect(() => {
    return () => {
      setOutputs((prev) => {
        Object.values(prev).forEach((o) => URL.revokeObjectURL(o.url));
        return prev;
      });
    };
  }, []);

  const downloadOne = useCallback(
    (item: QueueItem) => {
      const out = outputs[item.id];
      const o = options[item.id];
      if (!out || !o) return;
      triggerDownload(out.url, convertedFileName(item.file.name, MIME_OF[o.format]));
    },
    [outputs, options],
  );

  const downloadAllZip = useCallback(async () => {
    const zip = new JSZip();
    for (const item of items) {
      const out = outputs[item.id];
      const o = options[item.id];
      if (!out || !o) continue;
      zip.file(convertedFileName(item.file.name, MIME_OF[o.format]), out.blob);
    }
    const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    const url = URL.createObjectURL(content);
    triggerDownload(url, "converted-images.zip");
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [items, outputs, options]);

  if (items.length === 0) {
    return (
      <div className="space-y-8">
        <UploadDropzone
          multiple
          accept={ACCEPT}
          maxSizeMB={50}
          title="Select your files to convert"
          subtitle="Supports JPG, PNG, WebP, GIF, BMP, AVIF up to 50MB. Processed 100% locally in your browser."
          onFilesSelected={handleFilesSelected}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        {items.map((item) => {
          const o = options[item.id];
          const out = outputs[item.id];
          if (!o) return null;
          return (
            <div
              key={item.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 transition-colors"
            >
              {/* Thumbnail & file details */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative size-14 shrink-0 rounded-lg overflow-hidden border border-border bg-muted/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt={item.file.name} className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-foreground truncate" title={item.file.name}>
                    {item.file.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>
                      {formatBytes(item.file.size)} · {item.inputLabel} Image
                    </span>
                    {out && (
                      <>
                        <span>→</span>
                        <strong className="text-foreground font-mono">{formatBytes(out.size)}</strong>
                        <span className="text-[11px] text-muted-foreground/80">
                          ({out.width}×{out.height})
                        </span>
                        {!out.reached && (
                          <Badge variant="destructive" className="text-[10px] py-0">
                            target size unreachable
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Convert controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:inline">Convert</span>
                <Badge variant="secondary" className="font-mono text-[11px]">
                  {item.inputLabel}
                </Badge>
                <ArrowRight className="size-3.5 text-muted-foreground" />
                <select
                  aria-label={`Output format for ${item.file.name}`}
                  value={o.format}
                  onChange={(e) => patchOptions(item.id, { format: e.target.value as ConvertOptions["format"] })}
                  className="h-9 rounded-lg border border-input bg-background px-2 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  <option value="jpeg">JPG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOptionsFor(item.id)}
                  className="text-xs"
                >
                  <SlidersHorizontal className="size-3.5 mr-1" />
                  Options
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => downloadOne(item)}
                  disabled={!out}
                  className="text-xs"
                >
                  <Download className="size-3.5 mr-1" />
                  Download
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive"
                  title="Remove file"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom action bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <FileArchive className="size-4 text-primary" />
            {items.length} file{items.length === 1 ? "" : "s"} ready
            {isProcessing && <span className="text-xs animate-pulse">(Converting...)</span>}
          </span>
          <Button type="button" variant="default" onClick={downloadAllZip} disabled={items.length === 0}>
            <Download className="size-4 mr-2" />
            Download All ZIP
          </Button>
        </CardContent>
      </Card>

      <UploadDropzone
        multiple
        accept={ACCEPT}
        maxSizeMB={50}
        title="Add more files"
        subtitle="Drop or browse"
        enableClipboardPaste={false}
        onFilesSelected={handleFilesSelected}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Per-file options modal */}
      {optionsFor &&
        (() => {
          const item = items.find((i) => i.id === optionsFor);
          const o = options[optionsFor];
          if (!item || !o) return null;
          return (
            <ConvertOptionsModal
              fileName={item.file.name}
              origW={item.origW}
              origH={item.origH}
              options={o}
              onChange={(patch) => patchOptions(item.id, patch)}
              onClose={() => setOptionsFor(null)}
            />
          );
        })()}
    </div>
  );
}
