"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Maximize2,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { socialPresets, type SocialPreset } from "../utils/presets";
import {
  renderSocialImage,
  type FitMode,
  type ResizedSocialResult,
} from "../utils/resize-engine";
import { triggerDownload } from "@/lib/utils";

export function SocialResizer() {
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [fitMode, setFitMode] = useState<FitMode>("blur");
  const [results, setResults] = useState<ResizedSocialResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");

  const processAllPresets = useCallback(
    async (img: HTMLImageElement, mode: FitMode) => {
      setIsProcessing(true);
      try {
        const rendered: ResizedSocialResult[] = [];
        for (const preset of socialPresets) {
          const res = await renderSocialImage(img, preset, mode);
          rendered.push(res);
        }
        setResults(rendered);
      } catch (err) {
        console.error("Social resize error:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setOriginalFile(file);

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setSelectedImage(img);
      processAllPresets(img, fitMode);
    };
  };

  const handleFitModeChange = (mode: FitMode) => {
    setFitMode(mode);
    if (selectedImage) {
      processAllPresets(selectedImage, mode);
    }
  };

  const handleReset = () => {
    results.forEach((r) => URL.revokeObjectURL(r.dataUrl));
    setSelectedImage(null);
    setOriginalFile(null);
    setResults([]);
    setFitMode("blur");
  };

  const handleDownloadAll = () => {
    const baseName = originalFile?.name.substring(0, originalFile.name.lastIndexOf(".")) || "image";
    results.forEach((item, index) => {
      setTimeout(() => {
        triggerDownload(
          item.dataUrl,
          `${baseName}-${item.preset.id}-${item.preset.width}x${item.preset.height}.jpg`
        );
      }, index * 200);
    });
  };

  useEffect(() => {
    return () => {
      results.forEach((r) => URL.revokeObjectURL(r.dataUrl));
    };
  }, [results]);

  const filteredResults =
    selectedPlatform === "All"
      ? results
      : results.filter((r) => r.preset.platform === selectedPlatform);

  return (
    <div className="space-y-8">
      {/* Upload Dropzone */}
      {!selectedImage && (
        <UploadDropzone
          title="Upload image to resize for all social networks"
          subtitle="Auto-generates dimensions for Instagram, Facebook, LinkedIn, X, and YouTube."
          onFilesSelected={handleFilesSelected}
        />
      )}

      {selectedImage && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Fit Mode Selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground block">
                  Background / Scaling Mode:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleFitModeChange("blur")}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      fitMode === "blur"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    ✨ Smart Blur Background
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFitModeChange("fill")}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      fitMode === "fill"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    ✂️ Smart Crop / Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFitModeChange("white")}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      fitMode === "white"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    ⬜ White Background
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFitModeChange("black")}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      fitMode === "black"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    ⬛ Black Background
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs"
                >
                  <RotateCcw className="size-3.5 mr-1" />
                  New Image
                </Button>

                {results.length > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDownloadAll}
                    className="text-xs font-semibold"
                  >
                    <Download className="size-3.5 mr-1.5" />
                    Download All ({results.length} sizes)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platform Filter Tabs */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5">
              {["All", "Instagram", "Facebook", "LinkedIn", "Twitter", "YouTube"].map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setSelectedPlatform(plat)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                    selectedPlatform === plat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            {isProcessing && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Rendering canvases...
              </span>
            )}
          </div>

          {/* Presets Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResults.map((item) => {
              const baseName =
                originalFile?.name.substring(0, originalFile.name.lastIndexOf(".")) || "image";
              const downloadName = `${baseName}-${item.preset.id}-${item.preset.width}x${item.preset.height}.jpg`;

              return (
                <Card key={item.preset.id} className="border-border shadow-xs overflow-hidden flex flex-col justify-between">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {item.preset.platform}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {item.preset.aspectRatio}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                      {item.preset.name} ({item.preset.width}x{item.preset.height})
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3">
                    {/* Canvas Preview Container */}
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-muted/40 border border-border flex items-center justify-center p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.dataUrl}
                        alt={item.preset.name}
                        className="max-h-full max-w-full object-contain rounded-md"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => triggerDownload(item.dataUrl, downloadName)}
                      className="w-full text-xs"
                    >
                      <Download className="size-3.5 mr-1" />
                      Download {item.preset.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
