"use client";

import React, { useEffect, useState } from "react";
import { FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import type { CropRect, Rotation } from "../utils/render-image";
import { FULL_CROP } from "../utils/render-image";

export interface CropAspect {
  id: string;
  label: string;
  ratio: number | null;
}

export const CROP_ASPECTS: CropAspect[] = [
  { id: "free", label: "FreeForm", ratio: null },
  { id: "original", label: "Original", ratio: -1 },
  { id: "1:1", label: "Square (1:1)", ratio: 1 },
  { id: "4:3", label: "Landscape (4:3)", ratio: 4 / 3 },
  { id: "3:4", label: "Portrait (3:4)", ratio: 3 / 4 },
  { id: "16:9", label: "Widescreen (16:9)", ratio: 16 / 9 },
  { id: "9:16", label: "Story (9:16)", ratio: 9 / 16 },
];

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="font-heading text-lg font-bold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CropModal({
  src,
  alt,
  origW,
  origH,
  initial,
  onApply,
  onClose,
}: {
  src: string;
  alt: string;
  origW: number;
  origH: number;
  initial: CropRect;
  onApply: (crop: CropRect) => void;
  onClose: () => void;
}) {
  const [w, setW] = useState(Math.round(initial.w * origW));
  const [h, setH] = useState(Math.round(initial.h * origH));
  const [x, setX] = useState(Math.round(initial.x * origW));
  const [y, setY] = useState(Math.round(initial.y * origH));
  const [aspectId, setAspectId] = useState("free");

  const aspectRatio =
    aspectId === "original" ? origW / origH : (CROP_ASPECTS.find((a) => a.id === aspectId)?.ratio ?? null);

  const clampW = (v: number) => Math.min(origW, Math.max(1, Math.round(v)));
  const clampH = (v: number) => Math.min(origH, Math.max(1, Math.round(v)));

  const handleW = (v: number) => {
    const nw = clampW(v);
    setW(nw);
    if (aspectRatio && aspectRatio > 0) setH(clampH(nw / aspectRatio));
    setX((px) => Math.min(px, origW - nw));
  };

  const handleH = (v: number) => {
    const nh = clampH(v);
    setH(nh);
    if (aspectRatio && aspectRatio > 0) setW(clampW(nh * aspectRatio));
    setY((py) => Math.min(py, origH - nh));
  };

  const handleAspect = (id: string) => {
    setAspectId(id);
    const ratio = id === "original" ? origW / origH : (CROP_ASPECTS.find((a) => a.id === id)?.ratio ?? null);
    if (ratio && ratio > 0) {
      const nh = clampH(w / ratio);
      setH(nh);
      setY((py) => Math.min(py, origH - nh));
    }
  };

  const handleReset = () => {
    setW(origW);
    setH(origH);
    setX(0);
    setY(0);
    setAspectId("free");
  };

  const handleCrop = () => {
    onApply({
      x: Math.min(x, origW - w) / origW,
      y: Math.min(y, origH - h) / origH,
      w: w / origW,
      h: h / origH,
    });
    onClose();
  };

  const rx = (Math.min(x, Math.max(0, origW - w)) / origW) * 100;
  const ry = (Math.min(y, Math.max(0, origH - h)) / origH) * 100;
  const rw = (w / origW) * 100;
  const rh = (h / origH) * 100;

  return (
    <ModalShell title="Crop Image" onClose={onClose}>
      <div className="grid gap-6 md:grid-cols-5 p-5 sm:p-6">
        {/* Large preview with crop overlay */}
        <div className="md:col-span-3 rounded-xl border border-border bg-muted/40 flex items-center justify-center p-4 min-h-72">
          <div className="relative w-fit max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="max-h-[55vh] w-auto max-w-full rounded-md block" />
            <div className="absolute inset-0 overflow-hidden rounded-md">
              <div
                className="absolute border border-dashed border-white"
                style={{
                  left: `${rx}%`,
                  top: `${ry}%`,
                  width: `${rw}%`,
                  height: `${rh}%`,
                  boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.55)",
                }}
              >
                {["-top-1 -left-1", "-top-1 left-1/2 -translate-x-1/2", "-top-1 -right-1", "top-1/2 -translate-y-1/2 -left-1", "top-1/2 -translate-y-1/2 -right-1", "-bottom-1 -left-1", "-bottom-1 left-1/2 -translate-x-1/2", "-bottom-1 -right-1"].map(
                  (pos) => (
                    <span key={pos} className={`absolute ${pos} size-2.5 rounded-full bg-white shadow`} />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="md:col-span-2 space-y-5">
          <div className="space-y-3">
            <span className="font-heading text-base font-bold text-foreground block">Crop Rectangle</span>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs">Width</FieldLabel>
                <Input value={w} onChange={(e) => handleW(Number(e.target.value) || 0)} inputMode="numeric" />
              </Field>
              <Field>
                <FieldLabel className="text-xs">Height</FieldLabel>
                <Input value={h} onChange={(e) => handleH(Number(e.target.value) || 0)} inputMode="numeric" />
              </Field>
            </div>
            <Field>
              <FieldLabel className="text-xs">Aspect Ratio</FieldLabel>
              <select
                aria-label="Crop aspect ratio"
                value={aspectId}
                onChange={(e) => handleAspect(e.target.value)}
                className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                {CROP_ASPECTS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="space-y-3">
            <span className="font-heading text-base font-bold text-foreground block">Crop Position</span>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs">Position (X)</FieldLabel>
                <Input
                  value={x}
                  onChange={(e) => setX(Math.min(Math.max(0, Number(e.target.value) || 0), Math.max(0, origW - w)))}
                  inputMode="numeric"
                />
              </Field>
              <Field>
                <FieldLabel className="text-xs">Position (Y)</FieldLabel>
                <Input
                  value={y}
                  onChange={(e) => setY(Math.min(Math.max(0, Number(e.target.value) || 0), Math.max(0, origH - h)))}
                  inputMode="numeric"
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-border">
        <Button variant="default" onClick={handleCrop} className="min-w-28">
          Crop
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            handleReset();
            onApply(FULL_CROP);
          }}
        >
          Reset
        </Button>
      </div>
    </ModalShell>
  );
}

export function RotateModal({
  src,
  alt,
  rotation,
  flipH,
  flipV,
  onRotate,
  onFlipH,
  onFlipV,
  onClose,
}: {
  src: string;
  alt: string;
  rotation: Rotation;
  flipH: boolean;
  flipV: boolean;
  onRotate: (dir: 1 | -1) => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title="Rotate and Flip Image" onClose={onClose}>
      <div className="grid gap-6 md:grid-cols-5 p-5 sm:p-6">
        {/* Large preview with live transform */}
        <div className="md:col-span-3 rounded-xl border border-border bg-muted/40 flex items-center justify-center p-4 min-h-72 overflow-hidden">
          <div className="relative w-fit max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[55vh] w-auto max-w-full rounded-md block transition-transform duration-200"
              style={{
                transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-3">
            <span className="text-sm font-semibold text-foreground block">Rotate Image</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onRotate(1)}
                  className="w-full aspect-square rounded-xl border border-border bg-muted/40 flex items-center justify-center text-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
                  aria-label="Rotate clockwise"
                >
                  <RotateCw className="size-8" strokeWidth={1.5} />
                </button>
                <p className="text-xs text-center text-muted-foreground">Clock-Wise</p>
              </div>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onRotate(-1)}
                  className="w-full aspect-square rounded-xl border border-border bg-muted/40 flex items-center justify-center text-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
                  aria-label="Rotate counter-clockwise"
                >
                  <RotateCcw className="size-8" strokeWidth={1.5} />
                </button>
                <p className="text-xs text-center text-muted-foreground">Counter-Clock-Wise</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-semibold text-foreground block">Flip Image</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={onFlipH}
                  aria-pressed={flipH}
                  className={`w-full aspect-square rounded-xl border flex items-center justify-center text-2xl font-bold transition-colors cursor-pointer ${
                    flipH
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-muted/40 text-foreground hover:border-primary hover:text-primary"
                  }`}
                  aria-label="Flip horizontally"
                >
                  <FlipHorizontal2 className="size-8" strokeWidth={1.5} />
                </button>
                <p className="text-xs text-center text-muted-foreground">Horizontally</p>
              </div>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={onFlipV}
                  aria-pressed={flipV}
                  className={`w-full aspect-square rounded-xl border flex items-center justify-center text-2xl font-bold transition-colors cursor-pointer ${
                    flipV
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-muted/40 text-foreground hover:border-primary hover:text-primary"
                  }`}
                  aria-label="Flip vertically"
                >
                  <FlipVertical2 className="size-8" strokeWidth={1.5} />
                </button>
                <p className="text-xs text-center text-muted-foreground">Vertically</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-border">
        <Button variant="default" onClick={onClose} className="min-w-28">
          Done
        </Button>
      </div>
    </ModalShell>
  );
}
