"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileArchive,
  Download,
  Trash2,
  Sliders,
  Sparkles,
  Layers,
  Eye,
  X,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import {
  compressImage,
  type CompressedImageResult,
} from "../utils/compress-image";
import { formatBytes, triggerDownload } from "@/lib/utils";

export function ImageCompressor() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [scale, setScale] = useState<number>(100);
  const [results, setResults] = useState<CompressedImageResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewModalItem, setPreviewModalItem] = useState<CompressedImageResult | null>(null);

  const processFiles = useCallback(
    async (filesToProcess: File[], qVal: number, scaleVal: number) => {
      if (filesToProcess.length === 0) return;
      setIsProcessing(true);

      const qualityFloat = qVal / 100;
      const maxDim = Math.round((3840 * scaleVal) / 100);

      try {
        const compressedList: CompressedImageResult[] = [];
        for (const file of filesToProcess) {
          const res = await compressImage(file, {
            quality: qualityFloat,
            maxWidth: maxDim,
            maxHeight: maxDim,
          });
          compressedList.push(res);
        }
        setResults(compressedList);
      } catch (err) {
        console.error("Compression error:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const handleFilesSelected = (newFiles: File[]) => {
    const combined = [...selectedFiles, ...newFiles];
    setSelectedFiles(combined);
    processFiles(combined, quality, scale);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    if (updatedFiles.length === 0) {
      setResults([]);
    } else {
      processFiles(updatedFiles, quality, scale);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setResults([]);
    setQuality(80);
    setScale(100);
  };

  // Re-run compression when quality or scale slider changes
  const handleQualityChange = (newQ: number) => {
    setQuality(newQ);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles, newQ, scale);
    }
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles, quality, newScale);
    }
  };

  // Calculate total stats
  const totalOriginalSize = results.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalCompressedSize = results.reduce((acc, curr) => acc + curr.compressedSize, 0);
  const overallPercentageSaved =
    totalOriginalSize > 0
      ? Math.max(0, Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100))
      : 0;

  const handleDownloadAll = () => {
    results.forEach((item, index) => {
      setTimeout(() => {
        const extension = item.name.split(".").pop() || "jpg";
        const base = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
        triggerDownload(item.compressedUrl, `${base}-compressed.${extension}`);
      }, index * 200);
    });
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      results.forEach((r) => {
        URL.revokeObjectURL(r.compressedUrl);
        URL.revokeObjectURL(r.previewUrl);
      });
    };
  }, [results]);

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      {selectedFiles.length === 0 && (
        <UploadDropzone
          multiple={true}
          title="Drop your images here, or browse"
          subtitle="Supports JPG, PNG, WebP up to 50MB. Processed 100% locally in your browser."
          onFilesSelected={handleFilesSelected}
        />
      )}

      {selectedFiles.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Settings Sidebar */}
          <Card className="lg:col-span-4 border-border shadow-sm space-y-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sliders className="size-4 text-primary" />
                  Compression Settings
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground h-8"
                >
                  <RotateCcw className="size-3 mr-1" />
                  Reset
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Quality Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">Quality Level:</span>
                  <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {quality}%
                  </span>
                </div>
                <Slider
                  value={quality}
                  onValueChange={handleQualityChange}
                  min={10}
                  max={100}
                  step={5}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Smaller File</span>
                  <span>Balanced (80%)</span>
                  <span>High Quality</span>
                </div>
              </div>

              {/* Dimension Scaling */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">Image Scaling:</span>
                  <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {scale}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => handleScaleChange(sc)}
                      className={`text-xs py-1.5 rounded-md font-semibold border transition-colors cursor-pointer ${
                        scale === sc
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {sc === 100 ? "100% (Original)" : `${sc}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Stats Summary Box */}
              {results.length > 0 && (
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <span className="text-xs font-semibold text-foreground block">
                    Overall Savings:
                  </span>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Original total:</span>
                    <span className="font-mono font-medium text-foreground">{formatBytes(totalOriginalSize)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Compressed total:</span>
                    <span className="font-mono font-medium text-foreground">{formatBytes(totalCompressedSize)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60 font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Saved space:</span>
                    <Badge variant="success">-{overallPercentageSaved}%</Badge>
                  </div>
                </div>
              )}

              {/* Download All CTA */}
              {results.length > 1 && (
                <Button
                  type="button"
                  variant="default"
                  onClick={handleDownloadAll}
                  className="w-full"
                >
                  <Download className="size-4 mr-2" />
                  Download All ({results.length} files)
                </Button>
              )}

              {/* Add more files button */}
              <div className="pt-2">
                <UploadDropzone
                  multiple={true}
                  title="Add more images"
                  subtitle="Drop or browse"
                  enableClipboardPaste={false}
                  onFilesSelected={handleFilesSelected}
                  className="p-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <FileArchive className="size-5 text-primary" />
                <span>Compressed Images ({results.length})</span>
                {isProcessing && (
                  <span className="text-xs font-normal text-muted-foreground animate-pulse">
                    (Processing...)
                  </span>
                )}
              </h3>

              {results.length > 0 && (
                <Badge variant="success" className="text-xs">
                  Saved {overallPercentageSaved}% Total
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {results.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 transition-colors"
                >
                  {/* Thumbnail & File Details */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      onClick={() => setPreviewModalItem(item)}
                      className="relative size-14 shrink-0 rounded-lg overflow-hidden border border-border bg-muted/50 cursor-pointer group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.compressedUrl}
                        alt={item.name}
                        className="size-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="size-4 text-white" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-foreground truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="line-through">{formatBytes(item.originalSize)}</span>
                        <span>→</span>
                        <strong className="text-foreground font-mono">{formatBytes(item.compressedSize)}</strong>
                        <Badge variant="success" className="text-[10px] py-0">
                          -{item.percentageSaved}%
                        </Badge>
                        <span className="text-[11px] text-muted-foreground/80">
                          ({item.compressedWidth}x{item.compressedHeight})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewModalItem(item)}
                      className="text-xs"
                      title="Compare Before/After"
                    >
                      <Eye className="size-3.5 mr-1" />
                      Compare
                    </Button>

                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => {
                        const extension = item.name.split(".").pop() || "jpg";
                        const base = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
                        triggerDownload(item.compressedUrl, `${base}-compressed.${extension}`);
                      }}
                      className="text-xs"
                    >
                      <Download className="size-3.5 mr-1" />
                      Download
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveFile(index)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Remove file"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {previewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <h3 className="font-heading text-lg font-bold text-foreground truncate max-w-md">
                  {previewModalItem.name} — Comparison
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalItem(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 py-6">
              {/* Original */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Original Image</span>
                  <span className="font-mono">{formatBytes(previewModalItem.originalSize)} ({previewModalItem.originalWidth}x{previewModalItem.originalHeight})</span>
                </div>
                <div className="h-64 rounded-xl border border-border overflow-hidden bg-muted/40 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewModalItem.previewUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Compressed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Compressed Image (-{previewModalItem.percentageSaved}%)</span>
                  <span className="font-mono text-foreground font-bold">{formatBytes(previewModalItem.compressedSize)} ({previewModalItem.compressedWidth}x{previewModalItem.compressedHeight})</span>
                </div>
                <div className="h-64 rounded-xl border border-primary/30 overflow-hidden bg-muted/40 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewModalItem.compressedUrl}
                    alt="Compressed"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewModalItem(null)}
              >
                Close
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const ext = previewModalItem.name.split(".").pop() || "jpg";
                  const base = previewModalItem.name.substring(0, previewModalItem.name.lastIndexOf(".")) || previewModalItem.name;
                  triggerDownload(previewModalItem.compressedUrl, `${base}-compressed.${ext}`);
                }}
              >
                <Download className="size-4 mr-1.5" />
                Download Compressed File
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
