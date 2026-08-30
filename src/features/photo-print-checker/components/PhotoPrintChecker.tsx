"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  UploadCloud,
  ImageIcon,
  Sparkles,
  Info,
  Maximize2,
  Filter,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { STANDARD_PRINT_SIZES, type PrintSizeDefinition } from "../utils/print-sizes";
import {
  calculateImagePrintSummary,
  evaluatePrintSize,
  getQualityAssessment,
  type PrintSizeEvaluation,
  type ImagePrintSummary,
} from "../utils/dpi-calculator";
import { PrintSizeCard } from "./PrintSizeCard";
import { TargetSizeCalculator } from "./TargetSizeCalculator";
import { CropPreviewModal } from "./CropPreviewModal";
import { Button } from "@/components/ui/button";

export function PhotoPrintChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [filterCategory, setFilterCategory] = useState<"all" | "photo" | "poster" | "document" | "passport">("all");

  // Crop modal state
  const [cropModalData, setCropModalData] = useState<{
    isOpen: boolean;
    name: string;
    widthIn: number;
    heightIn: number;
    dpi: number;
    cropPercent: number;
    aspectRatioMismatch: boolean;
  }>({
    isOpen: false,
    name: "",
    widthIn: 8,
    heightIn: 10,
    dpi: 300,
    cropPercent: 0,
    aspectRatioMismatch: false,
  });

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);

    const url = URL.createObjectURL(selected);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setFile(null);
    setImageSrc(null);
    setDimensions(null);
  };

  const summary: ImagePrintSummary | null = useMemo(() => {
    if (!dimensions) return null;
    return calculateImagePrintSummary(dimensions.width, dimensions.height);
  }, [dimensions]);

  const evaluations: PrintSizeEvaluation[] = useMemo(() => {
    if (!dimensions) return [];
    return STANDARD_PRINT_SIZES.map((sizeDef) => {
      const res = evaluatePrintSize(
        dimensions.width,
        dimensions.height,
        sizeDef.widthIn,
        sizeDef.heightIn
      );
      const quality = getQualityAssessment(res.effectiveDpi);
      return {
        ...sizeDef,
        ...res,
        quality,
      };
    });
  }, [dimensions]);

  const filteredEvaluations = useMemo(() => {
    if (filterCategory === "all") return evaluations;
    return evaluations.filter((e) => e.category === filterCategory);
  }, [evaluations, filterCategory]);

  const handleOpenCropModal = (evalItem: PrintSizeEvaluation) => {
    setCropModalData({
      isOpen: true,
      name: evalItem.name,
      widthIn: evalItem.widthIn,
      heightIn: evalItem.heightIn,
      dpi: evalItem.effectiveDpi,
      cropPercent: evalItem.cropPercent,
      aspectRatioMismatch: evalItem.aspectRatioMismatch,
    });
  };

  const handleOpenTargetCropModal = (targetW: number, targetH: number, name: string) => {
    if (!dimensions) return;
    const res = evaluatePrintSize(dimensions.width, dimensions.height, targetW, targetH);
    setCropModalData({
      isOpen: true,
      name,
      widthIn: targetW,
      heightIn: targetH,
      dpi: res.effectiveDpi,
      cropPercent: res.cropPercent,
      aspectRatioMismatch: res.aspectRatioMismatch,
    });
  };

  return (
    <div className="space-y-8">
      {!imageSrc || !dimensions ? (
        <div>
          <UploadDropzone
            onFilesSelected={handleFilesSelected}
            accept="image/*,.jpg,.jpeg,.png,.webp,.tif,.tiff,.bmp,.heic"
            title="Upload any photo to check print sizes"
            subtitle="Drag & drop your photograph here or click to browse. Reads pixel dimensions instantly."
          />

          {/* Quick Demo Example Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                // Mock a 4032x3024 12MP photo
                setDimensions({ width: 4032, height: 3024 });
                setImageSrc("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80");
              }}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium cursor-pointer"
            >
              <Sparkles className="size-3.5" />
              Try with a sample 12MP camera photo (4032 × 3024 px)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Summary Banner */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="relative size-20 rounded-xl overflow-hidden border border-border bg-muted shrink-0 shadow-inner">
                <img
                  src={imageSrc}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Photo Resolution Analysis
                  </h3>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {summary?.megapixels} Megapixels
                  </span>
                </div>
                <p className="font-mono text-sm text-foreground/90 mt-0.5">
                  {dimensions.width} × {dimensions.height} px &nbsp;•&nbsp; Ratio: {summary?.aspectRatioString}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum size for pristine 300 DPI:{" "}
                  <strong className="text-foreground">
                    {unit === "in"
                      ? `${summary?.maxSizeAt300DpiInches.width} × ${summary?.maxSizeAt300DpiInches.height} in`
                      : `${summary?.maxSizeAt300DpiCm.width} × ${summary?.maxSizeAt300DpiCm.height} cm`}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-border">
              {/* Unit switcher */}
              <div className="flex rounded-lg border border-border bg-muted p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setUnit("in")}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    unit === "in" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("cm")}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    unit === "cm" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Metric (cm)
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                Change Photo
              </Button>
            </div>
          </div>

          {/* Killer Feature: "Can I print this?" Interactive Target Calculator */}
          <TargetSizeCalculator
            imageWidth={dimensions.width}
            imageHeight={dimensions.height}
            onOpenCrop={handleOpenTargetCropModal}
          />

          {/* Standard Print Sizes Gallery */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  Standard Print Size Ratings
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Calculated DPI and star rating for all standard picture frames and document formats.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { id: "all", label: "All Sizes" },
                  { id: "photo", label: "Photo Frames" },
                  { id: "poster", label: "Large Posters" },
                  { id: "document", label: "A4 / Documents" },
                  { id: "passport", label: "Passport / ID" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterCategory(tab.id as any)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      filterCategory === tab.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvaluations.map((evalItem) => (
                <PrintSizeCard
                  key={evalItem.id}
                  evaluation={evalItem}
                  unit={unit}
                  onOpenCrop={handleOpenCropModal}
                />
              ))}
            </div>
          </div>

          {/* Quality Guide Reference Table */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2 mb-3">
              <Info className="size-4 text-primary" />
              DPI Print Quality Cheat Sheet
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">300+ DPI</span>
                <p className="font-semibold text-foreground mt-0.5">★★★★★ Lab Quality</p>
                <p className="text-muted-foreground mt-1">
                  Ultra sharp. Ideal for photo albums, framed gifts, and fine art prints viewed up close.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-muted/40 p-3.5">
                <span className="font-bold text-foreground">240 – 299 DPI</span>
                <p className="font-semibold text-foreground mt-0.5">★★★★☆ Very Good</p>
                <p className="text-muted-foreground mt-1">
                  Crisp to the human eye at normal reading distance. Great for desktop frames.
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5">
                <span className="font-bold text-amber-600 dark:text-amber-400">180 – 239 DPI</span>
                <p className="font-semibold text-foreground mt-0.5">★★★☆☆ Good for Walls</p>
                <p className="text-muted-foreground mt-1">
                  Looks great on wall canvas and framed posters viewed from 2–3 feet away.
                </p>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5">
                <span className="font-bold text-rose-600 dark:text-rose-400">&lt; 150 DPI</span>
                <p className="font-semibold text-foreground mt-0.5">★☆☆☆☆ Pixelation Risk</p>
                <p className="text-muted-foreground mt-1">
                  Pixels and blur will be noticeable up close. Best reserved only for large billboards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {imageSrc && dimensions && (
        <CropPreviewModal
          isOpen={cropModalData.isOpen}
          onClose={() => setCropModalData((prev) => ({ ...prev, isOpen: false }))}
          imageSrc={imageSrc}
          imageWidth={dimensions.width}
          imageHeight={dimensions.height}
          targetName={cropModalData.name}
          targetWidthIn={cropModalData.widthIn}
          targetHeightIn={cropModalData.heightIn}
          dpi={cropModalData.dpi}
          cropPercent={cropModalData.cropPercent}
          aspectRatioMismatch={cropModalData.aspectRatioMismatch}
        />
      )}
    </div>
  );
}
