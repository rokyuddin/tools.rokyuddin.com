"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  enableClipboardPaste?: boolean;
  sampleAction?: {
    label: string;
    onClick: () => void;
  };
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export function UploadDropzone({
  accept = "image/jpeg,image/png,image/webp,image/gif,image/bmp",
  multiple = false,
  maxSizeMB = 50,
  title = "Drop your images here, or browse",
  subtitle = "Supports JPG, PNG, WebP, GIF, BMP. Up to 50MB.",
  enableClipboardPaste = true,
  sampleAction,
  onFilesSelected,
  className,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndEmitFiles = useCallback(
    (fileList: FileList | File[]) => {
      setError(null);
      const filesArray = Array.from(fileList);
      if (filesArray.length === 0) return;

      const validFiles: File[] = [];
      const acceptedTypes = accept
        .split(",")
        .map((t) => t.trim().toLowerCase());

      for (const file of filesArray) {
        const fileType = file.type.toLowerCase();
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

        const isTypeMatch =
          accept === "*" ||
          acceptedTypes.some(
            (t) =>
              t === fileType ||
              t === fileExtension ||
              (t.endsWith("/*") && fileType.startsWith(t.slice(0, -2)))
          );

        if (!isTypeMatch) {
          setError(`File format not supported: ${file.name}`);
          continue;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File exceeds max size (${maxSizeMB}MB): ${file.name}`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        if (!multiple) {
          onFilesSelected([validFiles[0]]);
        } else {
          onFilesSelected(validFiles);
        }
      }
    },
    [accept, maxSizeMB, multiple, onFilesSelected]
  );

  // Global paste handler when enabled
  useEffect(() => {
    if (!enableClipboardPaste) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        validateAndEmitFiles(pastedFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [enableClipboardPaste, validateAndEmitFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateAndEmitFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 md:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.005]"
            : "border-border hover:border-primary/50 hover:bg-muted/30 bg-card"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files) {
              validateAndEmitFiles(e.target.files);
              e.target.value = "";
            }
          }}
          className="hidden"
        />

        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 ring-8 ring-primary/5">
          <UploadCloud className="size-7" />
        </div>

        <h4 className="font-heading text-lg font-semibold text-foreground">
          {title}
        </h4>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {subtitle}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" size="sm" variant="default" className="pointer-events-none">
            <ImageIcon className="size-4 mr-1.5" />
            Browse Files
          </Button>
          {enableClipboardPaste && (
            <span className="hidden sm:inline-flex items-center text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border">
              or press <kbd className="font-mono font-semibold mx-1">Ctrl+V</kbd> to paste
            </span>
          )}
          {sampleAction && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                sampleAction.onClick();
              }}
              className="text-xs cursor-pointer z-10 hover:bg-background"
            >
              <Sparkles className="size-3.5 mr-1.5 text-primary" />
              {sampleAction.label}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in fade-in">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
