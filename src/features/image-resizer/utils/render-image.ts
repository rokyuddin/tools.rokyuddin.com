import type { FitMode, TargetDimensions } from "./resize-engine";

export type Rotation = 0 | 90 | 180 | 270;

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const FULL_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 };

export interface RenderOptions {
  target: TargetDimensions;
  fit: FitMode;
  rotation?: Rotation;
  flipH?: boolean;
  flipV?: boolean;
  crop?: CropRect;
  mimeType?: string;
  quality?: number;
}

export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read image: ${file.name}`));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      mimeType,
      quality,
    );
  });
}

export async function renderResizedBlob(
  img: HTMLImageElement,
  options: RenderOptions,
): Promise<{ blob: Blob; width: number; height: number }> {
  const {
    target,
    fit,
    rotation = 0,
    flipH = false,
    flipV = false,
    crop = FULL_CROP,
    mimeType = "image/jpeg",
    quality = 0.9,
  } = options;

  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  // 1. Crop source rect (fractions of original)
  const cx = Math.round(crop.x * srcW);
  const cy = Math.round(crop.y * srcH);
  const cw = Math.max(1, Math.round(crop.w * srcW));
  const ch = Math.max(1, Math.round(crop.h * srcH));

  const cropped = document.createElement("canvas");
  cropped.width = cw;
  cropped.height = ch;
  const cctx = cropped.getContext("2d");
  if (!cctx) throw new Error("Could not create canvas context");
  cctx.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);

  // 2. Rotate / flip onto intermediate canvas
  const sideways = rotation === 90 || rotation === 270;
  const iw = sideways ? ch : cw;
  const ih = sideways ? cw : ch;
  const oriented = document.createElement("canvas");
  oriented.width = iw;
  oriented.height = ih;
  const octx = oriented.getContext("2d");
  if (!octx) throw new Error("Could not create canvas context");
  octx.save();
  octx.translate(iw / 2, ih / 2);
  octx.rotate((rotation * Math.PI) / 180);
  octx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  octx.drawImage(cropped, -cw / 2, -ch / 2, cw, ch);
  octx.restore();

  // 3. Fit into target canvas
  const out = document.createElement("canvas");
  out.width = target.width;
  out.height = target.height;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);
  }

  if (fit === "stretch") {
    ctx.drawImage(oriented, 0, 0, out.width, out.height);
  } else if (fit === "crop-fill") {
    const scale = Math.max(out.width / iw, out.height / ih);
    const w = iw * scale;
    const h = ih * scale;
    ctx.drawImage(oriented, (out.width - w) / 2, (out.height - h) / 2, w, h);
  } else {
    // blur-fill: blurred cover background + crisp contain foreground
    ctx.save();
    try {
      ctx.filter = "blur(24px) brightness(0.75)";
    } catch {
      // older canvas: ignore filter
    }
    const bgScale = Math.max(out.width / iw, out.height / ih);
    const bgW = iw * bgScale;
    const bgH = ih * bgScale;
    ctx.drawImage(oriented, (out.width - bgW) / 2, (out.height - bgH) / 2, bgW, bgH);
    ctx.restore();
    const fgScale = Math.min(out.width / iw, out.height / ih);
    const fgW = iw * fgScale;
    const fgH = ih * fgScale;
    ctx.drawImage(oriented, (out.width - fgW) / 2, (out.height - fgH) / 2, fgW, fgH);
  }

  const q = mimeType === "image/png" ? 1 : Math.min(1, Math.max(0.1, quality));
  const blob = await canvasToBlob(out, mimeType, q);
  return { blob, width: out.width, height: out.height };
}

export async function renderToTargetSize(
  img: HTMLImageElement,
  options: RenderOptions,
  targetKB: number,
): Promise<{ blob: Blob; width: number; height: number; qualityUsed: number; reached: boolean }> {
  const targetBytes = Math.round(targetKB * 1024);
  let lo = 0.1;
  let hi = 0.95;
  let best: { blob: Blob; width: number; height: number; qualityUsed: number } | null = null;

  for (let i = 0; i < 7; i++) {
    const mid = (lo + hi) / 2;
    const res = await renderResizedBlob(img, { ...options, quality: mid });
    if (res.blob.size <= targetBytes) {
      best = { ...res, qualityUsed: mid };
      lo = mid;
      if (targetBytes - res.blob.size < targetBytes * 0.05) break;
    } else {
      hi = mid;
    }
  }

  if (best) return { ...best, reached: true };
  const smallest = await renderResizedBlob(img, { ...options, quality: 0.1 });
  return { ...smallest, qualityUsed: 0.1, reached: false };
}

export function resolveMimeType(format: string, fallback: string): string {
  if (format === "jpeg") return "image/jpeg";
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  if (fallback === "image/gif") return "image/png";
  if (["image/jpeg", "image/png", "image/webp"].includes(fallback)) return fallback;
  return "image/jpeg";
}

export function extensionForMime(mimeType: string): string {
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  return ".jpg";
}
