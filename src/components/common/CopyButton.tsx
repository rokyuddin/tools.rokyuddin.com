"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  textToCopy: string;
  label?: string;
  successLabel?: string;
  onCopied?: () => void;
}

export function CopyButton({
  textToCopy,
  label = "Copy",
  successLabel = "Copied!",
  className,
  variant = "outline",
  size = "default",
  onCopied,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!textToCopy) return;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      type="button"
      variant={copied ? "default" : variant}
      size={size}
      onClick={handleCopy}
      className={className}
      disabled={!textToCopy}
      aria-label={copied ? successLabel : label}
      {...props}
    >
      {copied ? (
        <>
          <Check className="size-4 text-emerald-300 animate-in zoom-in-50 duration-150" />
          <span>{successLabel}</span>
        </>
      ) : (
        <>
          <Copy className="size-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
