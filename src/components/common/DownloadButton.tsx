"use client";

import React from "react";
import { Download, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { triggerDownload } from "@/lib/utils";

interface DownloadButtonProps extends Omit<ButtonProps, "onClick"> {
  fileUrl?: string;
  filename?: string;
  label?: string;
  loading?: boolean;
  onDownload?: () => void | Promise<void>;
}

export function DownloadButton({
  fileUrl,
  filename = "download",
  label = "Download",
  loading = false,
  className,
  variant = "default",
  size = "default",
  onDownload,
  ...props
}: DownloadButtonProps) {
  const handleClick = async () => {
    if (loading) return;
    if (onDownload) {
      await onDownload();
    } else if (fileUrl) {
      triggerDownload(fileUrl, filename);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading || (!fileUrl && !onDownload)}
      className={className}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <Download className="size-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
