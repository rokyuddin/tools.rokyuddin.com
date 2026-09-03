"use client";

import {
  AlertCircle,
  Check,
  Download,
  File,
  FileArchive,
  FileCode,
  FileText,
  ImageIcon,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import {
  BYTES_PER_KB,
  BYTES_PER_MB,
  formatFileSize,
  generatePaddedBlob,
  generatePaddedFileName,
  parseUnitToBytes,
  type SizeUnit,
  validateTargetSize,
} from "../lib/pad-engine";
import { QUICK_PRESETS, TargetSizeModal } from "./TargetSizeModal";

export function FileSizeIncreaser() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Sizing states for workbench
  const [amount, setAmount] = useState<string>("1");
  const [unit, setUnit] = useState<SizeUnit>("MB");
  const [targetBytes, setTargetBytes] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle file drop/browse
  const handleFilesSelected = useCallback((files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setDownloadSuccess(false);

    // Create preview if it's an image
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    // Automatically trigger initial popup modal
    setIsModalOpen(true);
  }, []);

  // Handle modal confirm
  const handleModalConfirm = (confirmedTargetBytes: number) => {
    setTargetBytes(confirmedTargetBytes);

    // Sync inline inputs with confirmed size
    if (confirmedTargetBytes >= BYTES_PER_MB) {
      const mbVal = (confirmedTargetBytes / BYTES_PER_MB).toFixed(2);
      setAmount(parseFloat(mbVal).toString());
      setUnit("MB");
    } else {
      const kbVal = (confirmedTargetBytes / BYTES_PER_KB).toFixed(1);
      setAmount(parseFloat(kbVal).toString());
      setUnit("KB");
    }

    setIsModalOpen(false);
  };

  // Sync inline input changes to targetBytes
  const handleInlineAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    setDownloadSuccess(false);
    const parsed = parseFloat(newAmount);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setTargetBytes(parseUnitToBytes(parsed, unit));
    }
  };

  const handleInlineUnitChange = (newUnit: SizeUnit) => {
    setUnit(newUnit);
    setDownloadSuccess(false);
    const parsed = parseFloat(amount);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setTargetBytes(parseUnitToBytes(parsed, newUnit));
    }
  };

  const handlePresetSelect = (preset: { amount: number; unit: SizeUnit }) => {
    setAmount(preset.amount.toString());
    setUnit(preset.unit);
    setDownloadSuccess(false);
    setTargetBytes(parseUnitToBytes(preset.amount, preset.unit));
  };

  const currentFileBytes = selectedFile?.size || 0;
  const validation = useMemo(() => {
    if (!selectedFile || targetBytes === 0) return { isValid: true };
    return validateTargetSize(currentFileBytes, targetBytes);
  }, [selectedFile, currentFileBytes, targetBytes]);

  const paddingNeededBytes = useMemo(() => {
    if (targetBytes <= currentFileBytes) return 0;
    return targetBytes - currentFileBytes;
  }, [targetBytes, currentFileBytes]);

  // Execute download
  const handleDownload = async () => {
    if (!selectedFile || !validation.isValid || targetBytes <= currentFileBytes)
      return;

    try {
      setIsProcessing(true);
      // Read original file as ArrayBuffer
      const buffer = await selectedFile.arrayBuffer();
      // Generate byte-accurate padded Blob
      const paddedBlob = generatePaddedBlob(
        buffer,
        targetBytes,
        selectedFile.type || "application/octet-stream",
      );

      const downloadName = generatePaddedFileName(
        selectedFile.name,
        targetBytes,
      );

      const blobUrl = URL.createObjectURL(paddedBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      setDownloadSuccess(true);
    } catch (err) {
      console.error("Failed to generate padded file", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setTargetBytes(0);
    setAmount("1");
    setUnit("MB");
    setIsModalOpen(false);
    setDownloadSuccess(false);
  };

  // Helper for generic file icon
  const renderFileIcon = () => {
    if (!selectedFile) return null;
    const type = selectedFile.type;
    const name = selectedFile.name.toLowerCase();

    if (type.startsWith("image/")) {
      return <ImageIcon className="size-10 text-primary" />;
    }
    if (type.includes("pdf") || name.endsWith(".pdf")) {
      return <FileText className="size-10 text-rose-500" />;
    }
    if (
      name.endsWith(".zip") ||
      name.endsWith(".rar") ||
      name.endsWith(".tar.gz")
    ) {
      return <FileArchive className="size-10 text-amber-500" />;
    }
    if (
      name.endsWith(".js") ||
      name.endsWith(".ts") ||
      name.endsWith(".html") ||
      name.endsWith(".json")
    ) {
      return <FileCode className="size-10 text-emerald-500" />;
    }
    return <File className="size-10 text-muted-foreground" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Dropzone (When no file selected) */}
      {!selectedFile && (
        <UploadDropzone
          accept="*"
          multiple={false}
          maxSizeMB={100}
          title="Drop any image or file here to increase size"
          subtitle="Supports JPG, PNG, WebP, PDF, DOCX, TXT and any file. 100% private in-browser padding."
          onFilesSelected={handleFilesSelected}
          className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-all rounded-2xl p-8"
        />
      )}

      {/* Active Workbench */}
      {selectedFile && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Top Bar: File Summary & Reset */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              {previewUrl ? (
                <div className="size-14 rounded-xl border border-border overflow-hidden bg-muted/30 shrink-0 flex items-center justify-center">
                  {/* biome-ignore lint/performance/noImgElement: Blob object URL cannot be statically analyzed by next/image */}
                  <img
                    src={previewUrl}
                    alt={selectedFile.name}
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-14 items-center justify-center rounded-xl border border-border bg-muted/30 shrink-0">
                  {renderFileIcon()}
                </div>
              )}

              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono">
                    Original: {formatFileSize(currentFileBytes)}
                  </span>
                  <span>•</span>
                  <span>{selectedFile.type || "binary file"}</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="shrink-0 gap-1.5 cursor-pointer text-xs"
            >
              <RefreshCw className="size-3.5" />
              <span>Choose Another File</span>
            </Button>
          </div>

          {/* Stats Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Original Card */}
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Original File Size
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
                {formatFileSize(currentFileBytes)}
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                {currentFileBytes.toLocaleString()} bytes
              </p>
            </div>

            {/* Added Padding Card */}
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Added Padding
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-primary">
                +{formatFileSize(paddingNeededBytes)}
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                +{paddingNeededBytes.toLocaleString()} bytes (null padding)
              </p>
            </div>

            {/* Final Target Card */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1">
              <span className="text-xs font-medium text-primary">
                Output File Size
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
                {targetBytes > 0 ? formatFileSize(targetBytes) : "--"}
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                {targetBytes > 0
                  ? `${targetBytes.toLocaleString()} bytes`
                  : "--"}
              </p>
            </div>
          </div>

          {/* Inline Target Size Customizer */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                <h4 className="font-semibold text-sm sm:text-base text-foreground">
                  Adjust Target File Size
                </h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Live updates without needing to re-open popups
              </p>
            </div>

            {/* Quick Presets row */}
            <div>
              <span className="text-xs font-medium text-muted-foreground block mb-2">
                Quick Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_PRESETS.map((p) => {
                  const pBytes = parseUnitToBytes(p.amount, p.unit);
                  const isSelected =
                    amount === p.amount.toString() && unit === p.unit;
                  const isTooSmall = pBytes <= currentFileBytes;

                  return (
                    <button
                      type="button"
                      key={p.label}
                      disabled={isTooSmall}
                      onClick={() => handlePresetSelect(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : isTooSmall
                            ? "opacity-30 border-dashed border-border cursor-not-allowed line-through"
                            : "bg-muted/40 hover:bg-muted border-border text-foreground cursor-pointer"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Numeric input + unit switch */}
            <div className="pt-2">
              <label
                htmlFor="workbench-amount"
                className="text-xs font-medium text-muted-foreground block mb-1.5"
              >
                Exact Target Size
              </label>
              <div className="flex gap-3">
                <Input
                  id="workbench-amount"
                  type="number"
                  step="any"
                  min="0.1"
                  value={amount}
                  onChange={(e) => handleInlineAmountChange(e.target.value)}
                  className="flex-1 font-mono text-base"
                  placeholder="e.g. 1"
                />
                <div className="flex rounded-xl border border-input bg-muted/30 p-1">
                  <button
                    type="button"
                    onClick={() => handleInlineUnitChange("KB")}
                    className={`px-4 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      unit === "KB"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    KB
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInlineUnitChange("MB")}
                    className={`px-4 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      unit === "MB"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    MB
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {!validation.isValid && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <AlertCircle className="size-4 shrink-0" />
                <span>{validation.error}</span>
              </div>
            )}

            {/* Download & Actions Bar */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground truncate">
                Download will be named:{" "}
                <span className="font-mono text-foreground font-medium">
                  {selectedFile
                    ? generatePaddedFileName(selectedFile.name, targetBytes)
                    : ""}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="lg"
                  disabled={
                    !validation.isValid ||
                    targetBytes <= currentFileBytes ||
                    isProcessing
                  }
                  onClick={handleDownload}
                  className="gap-2 px-6 cursor-pointer shadow-md"
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="size-4 text-emerald-300" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="size-4" />
                      <span>
                        {isProcessing
                          ? "Processing..."
                          : "Download Padded File"}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initial Target Size Modal */}
      {selectedFile && (
        <TargetSizeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            // Default to 1 MB or 2x current size if dismissed
            if (targetBytes === 0) {
              const fallbackTarget = Math.max(
                1 * BYTES_PER_MB,
                Math.ceil(currentFileBytes * 1.5),
              );
              setTargetBytes(fallbackTarget);
              setAmount(
                (fallbackTarget / BYTES_PER_MB).toFixed(1).replace(/\.0$/, ""),
              );
              setUnit("MB");
            }
          }}
          fileName={selectedFile.name}
          fileSizeBytes={currentFileBytes}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
}
