"use client";

import React, { useRef } from "react";
import { Lock, ArrowLeft, ArrowRight, RotateCw, Globe } from "lucide-react";

interface DeviceFramePreviewProps {
  imageSrc: string;
  viewportWidth: number;
  viewportHeight: number;
  frameStyle: "browser" | "phone" | "shadow" | "borderless";
  bgStyle: "gradient-light" | "gradient-dark" | "slate" | "transparent";
  zoomPercent: number;
}

export function DeviceFramePreview({
  imageSrc,
  viewportWidth,
  viewportHeight,
  frameStyle,
  bgStyle,
  zoomPercent,
}: DeviceFramePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getBackgroundClass = () => {
    switch (bgStyle) {
      case "gradient-light":
        return "bg-gradient-to-tr from-sky-100 via-indigo-50 to-slate-100 border-slate-200";
      case "gradient-dark":
        return "bg-gradient-to-tr from-slate-950 via-indigo-950 to-zinc-900 border-zinc-800";
      case "slate":
        return "bg-slate-900 border-slate-800";
      case "transparent":
        return "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] bg-muted/40 border-border";
    }
  };

  const scale = zoomPercent / 100;

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-[500px] overflow-auto rounded-2xl border p-8 flex items-center justify-center transition-colors shadow-inner ${getBackgroundClass()}`}
    >
      <div
        style={{
          width: `${viewportWidth}px`,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          transition: "width 0.15s ease-out, transform 0.15s ease-out",
        }}
        className="shrink-0 max-w-none"
      >
        {/* Browser Window Frame */}
        {frameStyle === "browser" && (
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl">
            {/* Window Top Bar */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-rose-500 inline-block" />
                <span className="size-3 rounded-full bg-amber-500 inline-block" />
                <span className="size-3 rounded-full bg-emerald-500 inline-block" />
              </div>

              {/* Fake address bar */}
              <div className="mx-auto flex w-7/12 items-center justify-center gap-1.5 rounded-md border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground font-mono">
                <Lock className="size-2.5 text-emerald-500 shrink-0" />
                <span className="truncate">https://preview.app/{viewportWidth}px</span>
              </div>
            </div>

            {/* Screenshot Content */}
            <div className="overflow-hidden bg-background">
              <img
                src={imageSrc}
                alt="Viewport screenshot"
                className="w-full h-auto object-top object-contain block"
              />
            </div>
          </div>
        )}

        {/* Mobile Phone Bezel */}
        {frameStyle === "phone" && (
          <div className="mx-auto overflow-hidden rounded-[40px] border-[10px] border-zinc-900 bg-zinc-900 shadow-2xl ring-1 ring-zinc-700">
            {/* Dynamic Island / Notch */}
            <div className="relative bg-zinc-900 py-1.5 flex justify-center">
              <div className="h-4 w-24 rounded-full bg-black" />
            </div>

            {/* Screenshot */}
            <div className="overflow-hidden rounded-[30px] bg-background">
              <img
                src={imageSrc}
                alt="Mobile screenshot"
                className="w-full h-auto object-top object-contain block"
              />
            </div>
          </div>
        )}

        {/* Clean Shadow */}
        {frameStyle === "shadow" && (
          <div className="overflow-hidden rounded-xl bg-background shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-border/60">
            <img
              src={imageSrc}
              alt="Screenshot preview"
              className="w-full h-auto object-top object-contain block"
            />
          </div>
        )}

        {/* Borderless */}
        {frameStyle === "borderless" && (
          <div className="overflow-hidden bg-background">
            <img
              src={imageSrc}
              alt="Screenshot preview"
              className="w-full h-auto object-top object-contain block"
            />
          </div>
        )}
      </div>
    </div>
  );
}
