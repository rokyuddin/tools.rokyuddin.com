"use client";

import React from "react";
import { ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SizeGridPreviewProps {
  imageSrc: string;
  bgMode: "light" | "dark" | "slate" | "transparent";
}

const PREVIEW_SIZES = [
  { size: 16, label: "16 × 16", use: "Standard Browser Tab" },
  { size: 32, label: "32 × 32", use: "Retina Browser Tab / Taskbar" },
  { size: 48, label: "48 × 48", use: "Bookmarks & Windows Icon" },
  { size: 64, label: "64 × 64", use: "Desktop Shortcut" },
  { size: 128, label: "128 × 128", use: "macOS Dock / Chrome Web Store" },
  { size: 192, label: "192 × 192", use: "Android Home Screen / PWA" },
  { size: 512, label: "512 × 512", use: "App Store / Splash Screen" },
];

export function SizeGridPreview({ imageSrc, bgMode }: SizeGridPreviewProps) {
  const getBgClass = () => {
    switch (bgMode) {
      case "light":
        return "bg-white border-slate-200";
      case "dark":
        return "bg-zinc-950 border-zinc-800 text-white";
      case "slate":
        return "bg-slate-800 border-slate-700 text-white";
      case "transparent":
        return "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:8px_8px] bg-muted/50 border-border";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {PREVIEW_SIZES.map((item) => (
          <div
            key={item.size}
            className="flex flex-col items-center justify-between rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-primary/40 hover:shadow-xs"
          >
            <div className="w-full flex items-center justify-between gap-1 mb-3">
              <span className="font-mono text-xs font-bold text-foreground">
                {item.label}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {item.size}px
              </span>
            </div>

            {/* Icon Render Area */}
            <div
              className={`relative my-auto flex size-28 items-center justify-center rounded-xl border shadow-inner transition-colors ${getBgClass()}`}
            >
              <img
                src={imageSrc}
                alt={`Preview ${item.size}px`}
                style={{
                  width: `${item.size}px`,
                  height: `${item.size}px`,
                  maxWidth: "100%",
                  maxHeight: "100%",
                  imageRendering: item.size <= 32 ? "pixelated" : "auto",
                }}
                className="object-contain"
              />

              {/* Magnifier zoom indicator for small 16px/32px icons */}
              {item.size <= 32 && (
                <div className="absolute bottom-1 right-1 text-[9px] font-mono text-muted-foreground/60">
                  1:1 real
                </div>
              )}
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground font-medium line-clamp-1">
              {item.use}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
