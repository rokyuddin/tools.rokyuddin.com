"use client";

import React from "react";
import { MoveHorizontal } from "lucide-react";

interface ViewportRulerProps {
  currentWidth: number;
  minWidth?: number;
  maxWidth?: number;
  onChange: (width: number) => void;
}

const BREAKPOINTS = [
  { width: 375, label: "375 (Mobile)" },
  { width: 768, label: "768 (Tablet)" },
  { width: 1024, label: "1024 (iPad Pro)" },
  { width: 1280, label: "1280 (Laptop)" },
  { width: 1440, label: "1440 (Desktop)" },
  { width: 1920, label: "1920 (FHD)" },
];

export function ViewportRuler({
  currentWidth,
  minWidth = 320,
  maxWidth = 1920,
  onChange,
}: ViewportRulerProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <MoveHorizontal className="size-3.5 text-primary" />
          <span>Interactive Viewport Ruler</span>
        </div>
        <span className="font-mono text-sm font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
          {currentWidth}px
        </span>
      </div>

      {/* Interactive Slider Bar */}
      <div className="relative pt-2 pb-6">
        <input
          type="range"
          min={minWidth}
          max={maxWidth}
          step={5}
          value={currentWidth}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />

        {/* Ruler Tick Marks */}
        <div className="absolute top-7 left-0 right-0 flex justify-between text-[10px] font-mono text-muted-foreground select-none">
          {BREAKPOINTS.map((bp) => {
            const percent = ((bp.width - minWidth) / (maxWidth - minWidth)) * 100;
            const isNear = Math.abs(currentWidth - bp.width) < 30;
            return (
              <button
                key={bp.width}
                type="button"
                onClick={() => onChange(bp.width)}
                style={{ left: `${percent}%` }}
                className={`absolute -translate-x-1/2 flex flex-col items-center group transition-colors cursor-pointer ${
                  isNear ? "text-primary font-bold" : "text-muted-foreground/60 hover:text-foreground"
                }`}
              >
                <div className={`w-0.5 h-1.5 mb-0.5 rounded-full ${isNear ? "bg-primary" : "bg-border group-hover:bg-foreground"}`} />
                <span className="hidden sm:inline">{bp.label}</span>
                <span className="sm:hidden">{bp.width}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
