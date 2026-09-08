export const MIN_DIMENSION = 1;
export const MAX_DIMENSION = 12000;
export const MIN_TARGET_KB = 10;
export const MAX_TARGET_KB = 5000;

export type ExportFormat = "original" | "jpeg" | "png" | "webp";
export type FitMode = "crop-fill" | "blur-fill" | "stretch";
export type ResizeMode = "size" | "percentage" | "social";

export interface TargetDimensions {
  width: number;
  height: number;
}

export function clampDimension(value: number): number {
  if (!Number.isFinite(value)) return MIN_DIMENSION;
  return Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, Math.round(value)));
}

export function resolveBySize(
  origW: number,
  origH: number,
  width: number | undefined,
  height: number | undefined,
  lockAspect: boolean,
  prefer: "width" | "height" = "width",
): TargetDimensions {
  if (lockAspect) {
    const wValid = width !== undefined && Number.isFinite(width);
    const hValid = height !== undefined && Number.isFinite(height);
    if (wValid && hValid) {
      if (prefer === "height") {
        const h = clampDimension(height as number);
        return { width: clampDimension((h * origW) / origH), height: h };
      }
      const w = clampDimension(width as number);
      return { width: w, height: clampDimension((w * origH) / origW) };
    }
    if (wValid) {
      const w = clampDimension(width as number);
      const h = clampDimension((w * origH) / origW);
      return { width: w, height: h };
    }
    if (hValid) {
      const h = clampDimension(height as number);
      const w = clampDimension((h * origW) / origH);
      return { width: w, height: h };
    }
    return { width: clampDimension(origW), height: clampDimension(origH) };
  }
  return {
    width: width !== undefined && Number.isFinite(width) ? clampDimension(width) : clampDimension(origW),
    height: height !== undefined && Number.isFinite(height) ? clampDimension(height) : clampDimension(origH),
  };
}

export function resolveByPercentage(
  origW: number,
  origH: number,
  percent: number,
): TargetDimensions {
  const p = Number.isFinite(percent) ? Math.min(1000, Math.max(1, percent)) : 100;
  return {
    width: clampDimension((origW * p) / 100),
    height: clampDimension((origH * p) / 100),
  };
}

export interface SocialPreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const SOCIAL_PRESETS: SocialPreset[] = [
  { id: "instagram-square", label: "Instagram Square", width: 1080, height: 1080 },
  { id: "instagram-portrait", label: "Instagram Portrait", width: 1080, height: 1350 },
  { id: "instagram-story", label: "Instagram Story", width: 1080, height: 1920 },
  { id: "facebook-cover", label: "Facebook Cover", width: 820, height: 312 },
  { id: "x-post", label: "X Post", width: 1200, height: 675 },
  { id: "youtube-thumbnail", label: "YouTube Thumbnail", width: 1280, height: 720 },
];

export function resolveSocialPreset(presetId: string): TargetDimensions {
  const preset = SOCIAL_PRESETS.find((p) => p.id === presetId);
  if (!preset) return { width: 1080, height: 1080 };
  return { width: preset.width, height: preset.height };
}

export function generateResizedFileName(
  originalName: string,
  width: number,
  height: number,
): string {
  const lastDot = originalName.lastIndexOf(".");
  let base = originalName;
  let ext = "";
  if (lastDot > 0) {
    base = originalName.slice(0, lastDot);
    ext = originalName.slice(lastDot);
  }
  return `${base}-${width}x${height}${ext}`;
}

export function validateTargetFileSizeKB(
  kb: number,
  mimeType: string,
): { isValid: boolean; error?: string } {
  if (mimeType !== "image/jpeg" && mimeType !== "image/webp") {
    return { isValid: false, error: "Target file size only works for JPG and WebP." };
  }
  if (!Number.isFinite(kb) || kb < MIN_TARGET_KB || kb > MAX_TARGET_KB) {
    return {
      isValid: false,
      error: `Enter a target between ${MIN_TARGET_KB} KB and ${MAX_TARGET_KB} KB.`,
    };
  }
  return { isValid: true };
}

export function isUpscale(
  origW: number,
  origH: number,
  targetW: number,
  targetH: number,
): boolean {
  return targetW > origW || targetH > origH;
}
