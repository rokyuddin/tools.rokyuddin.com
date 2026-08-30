"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Download,
  Trash2,
  Plus,
  Layers,
  CheckCircle2,
  FolderArchive,
  RefreshCw,
} from "lucide-react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { RenameControls } from "./RenameControls";
import { RenameDiffTable } from "./RenameDiffTable";
import {
  processBatchRenaming,
  DEFAULT_RENAME_OPTIONS,
  type RenameOptions,
  type RenamedFileItem,
} from "../utils/rename-engine";
import { downloadAllRenamedFilesAsZip } from "../utils/zip-downloader";
import { Button } from "@/components/ui/button";

export function BatchRenamer() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<RenameOptions>(DEFAULT_RENAME_OPTIONS);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFiles([]);
    setOptions(DEFAULT_RENAME_OPTIONS);
  };

  const renamedItems: RenamedFileItem[] = useMemo(() => {
    return processBatchRenaming(files, options);
  }, [files, options]);

  const handleDownloadZip = async () => {
    if (renamedItems.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);
    try {
      await downloadAllRenamedFilesAsZip(
        renamedItems,
        "renamed-batch.zip",
        (p) => setZipProgress(p)
      );
    } catch (err) {
      console.error("ZIP Error:", err);
    } finally {
      setIsZipping(false);
    }
  };

  // Quick preset helper
  const applyPreset = (partial: Partial<RenameOptions>) => {
    setOptions({ ...DEFAULT_RENAME_OPTIONS, ...partial });
  };

  const loadSampleFiles = () => {
    const dummyFiles = [
      new File(["content"], "IMG_4021.JPG", { type: "image/jpeg" }),
      new File(["content"], "IMG_4022.JPG", { type: "image/jpeg" }),
      new File(["content"], "IMG_4023.JPG", { type: "image/jpeg" }),
      new File(["content"], "My Project Presentation (Final).pdf", { type: "application/pdf" }),
      new File(["content"], "Screen Shot 2026-08-30 at 12.00.00 PM.png", { type: "image/png" }),
    ];
    setFiles(dummyFiles);
    setOptions({
      ...DEFAULT_RENAME_OPTIONS,
      prefix: "holiday-",
      numberingMode: "suffix",
      numberStart: 1,
      numberPadding: 3,
      extensionTransform: "lowercase",
    });
  };

  return (
    <div className="space-y-8">
      {files.length === 0 ? (
        <div>
          <UploadDropzone
            onFilesSelected={handleFilesSelected}
            multiple={true}
            accept="*/*"
            title="Select or drop multiple files to batch rename"
            subtitle="Supports any file format (photos, documents, audios, videos). 100% private in-browser renaming."
          />

          {/* Sample Demo Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={loadSampleFiles}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium cursor-pointer"
            >
              <Sparkles className="size-3.5" />
              Try with 5 sample photo &amp; document files
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Bar with Presets & Batch Actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <FolderArchive className="size-5 text-primary" />
                Batch File Renamer ({files.length} files selected)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure your rules below. Changes reflect in real-time before you download.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-border">
              <Button
                size="sm"
                onClick={handleDownloadZip}
                disabled={isZipping || renamedItems.length === 0}
                className="gap-1.5 text-xs cursor-pointer"
              >
                <Download className="size-3.5" />
                {isZipping ? `Archiving (${zipProgress}%)...` : "Download All as ZIP"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                Clear Files
              </Button>
            </div>
          </div>

          {/* Quick Presets Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground font-semibold">Quick Presets:</span>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  prefix: "photo-",
                  numberingMode: "suffix",
                  numberStart: 1,
                  numberPadding: 3,
                  extensionTransform: "lowercase",
                })
              }
              className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              📷 Photo Sequencer (photo-001.jpg)
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  findText: "IMG_",
                  replaceText: "vacation-",
                  extensionTransform: "lowercase",
                })
              }
              className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              🔄 Replace IMG_ with vacation-
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  spaceHandling: "dash",
                  caseTransform: "kebabcase",
                  extensionTransform: "lowercase",
                })
              }
              className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              🏷️ Clean Web Friendly (kebab-case)
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  caseTransform: "titlecase",
                  spaceHandling: "keep",
                })
              }
              className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              ✍️ Title Case Formatting
            </button>
          </div>

          {/* Renaming Options Form Controls */}
          <RenameControls options={options} onChange={setOptions} />

          {/* Live Side-by-Side Diff Table */}
          <RenameDiffTable items={renamedItems} onRemoveFile={handleRemoveFile} />
        </div>
      )}
    </div>
  );
}
