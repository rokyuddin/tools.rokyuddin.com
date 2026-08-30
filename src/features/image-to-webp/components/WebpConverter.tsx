"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileType,
  Download,
  Trash2,
  Sliders,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import {
  convertToWebp,
  type WebpConversionResult,
} from "../utils/convert-to-webp";
import { formatBytes, triggerDownload } from "@/lib/utils";

export function WebpConverter() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<number>(85);
  const [results, setResults] = useState<WebpConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const processFiles = useCallback(
    async (filesToConvert: File[], qVal: number) => {
      if (filesToConvert.length === 0) return;
      setIsConverting(true);

      const qualityFloat = qVal / 100;
      try {
        const list: WebpConversionResult[] = [];
        for (const file of filesToConvert) {
          const res = await convertToWebp(file, qualityFloat);
          list.push(res);
        }
        setResults(list);
      } catch (err) {
        console.error("WebP conversion error:", err);
      } finally {
        setIsConverting(false);
      }
    },
    []
  );

  const handleFilesSelected = (newFiles: File[]) => {
    const combined = [...selectedFiles, ...newFiles];
    setSelectedFiles(combined);
    processFiles(combined, quality);
  };

  const handleRemoveFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    if (updated.length === 0) {
      setResults([]);
    } else {
      processFiles(updated, quality);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setResults([]);
    setQuality(85);
  };

  const handleQualityChange = (newQ: number) => {
    setQuality(newQ);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles, newQ);
    }
  };

  const totalOriginal = results.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalWebp = results.reduce((acc, curr) => acc + curr.webpSize, 0);
  const overallSaved =
    totalOriginal > 0
      ? Math.max(0, Math.round(((totalOriginal - totalWebp) / totalOriginal) * 100))
      : 0;

  const handleDownloadAll = () => {
    results.forEach((item, index) => {
      setTimeout(() => {
        triggerDownload(item.webpUrl, item.webpName);
      }, index * 200);
    });
  };

  useEffect(() => {
    return () => {
      results.forEach((r) => {
        URL.revokeObjectURL(r.webpUrl);
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
          accept="image/jpeg,image/png,image/gif,image/bmp,image/svg+xml"
          title="Drop JPG, PNG, GIF, or BMP images here"
          subtitle="Convert to high-performance WebP format. 100% in-browser with zero uploads."
          onFilesSelected={handleFilesSelected}
        />
      )}

      {selectedFiles.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Settings Card */}
          <Card className="lg:col-span-4 border-border shadow-sm space-y-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sliders className="size-4 text-primary" />
                  WebP Quality
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
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">WebP Quality:</span>
                  <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {quality}%
                  </span>
                </div>
                <Slider
                  value={quality}
                  onValueChange={handleQualityChange}
                  min={20}
                  max={100}
                  step={5}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Small Size</span>
                  <span>Balanced (85%)</span>
                  <span>Max Quality</span>
                </div>
              </div>

              {/* Total Stats Summary */}
              {results.length > 0 && (
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <span className="text-xs font-semibold text-foreground block">
                    Conversion Summary:
                  </span>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Original size:</span>
                    <span className="font-mono font-medium text-foreground">{formatBytes(totalOriginal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>WebP total:</span>
                    <span className="font-mono font-medium text-foreground">{formatBytes(totalWebp)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60 font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Space saved:</span>
                    <Badge variant="success">-{overallSaved}%</Badge>
                  </div>
                </div>
              )}

              {/* Download All */}
              {results.length > 1 && (
                <Button
                  type="button"
                  variant="default"
                  onClick={handleDownloadAll}
                  className="w-full"
                >
                  <Download className="size-4 mr-2" />
                  Download All WebP Files ({results.length})
                </Button>
              )}

              {/* Add more files */}
              <div className="pt-2">
                <UploadDropzone
                  multiple={true}
                  accept="image/jpeg,image/png,image/gif,image/bmp,image/svg+xml"
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
                <FileType className="size-5 text-primary" />
                <span>Ready to Download ({results.length})</span>
                {isConverting && (
                  <span className="text-xs font-normal text-muted-foreground animate-pulse">
                    (Converting...)
                  </span>
                )}
              </h3>

              {results.length > 0 && (
                <Badge variant="success" className="text-xs">
                  -{overallSaved}% Smaller
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {results.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative size-14 shrink-0 rounded-lg overflow-hidden border border-border bg-muted/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.webpUrl}
                        alt={item.webpName}
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-foreground truncate" title={item.webpName}>
                        {item.webpName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="line-through">{formatBytes(item.originalSize)}</span>
                        <span>→</span>
                        <strong className="text-foreground font-mono">{formatBytes(item.webpSize)}</strong>
                        <Badge variant="success" className="text-[10px] py-0">
                          -{item.percentageSaved}%
                        </Badge>
                        <span className="text-[11px] text-muted-foreground/80">
                          ({item.width}x{item.height})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => triggerDownload(item.webpUrl, item.webpName)}
                      className="text-xs"
                    >
                      <Download className="size-3.5 mr-1" />
                      Download WebP
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveFile(index)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Remove"
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
    </div>
  );
}
