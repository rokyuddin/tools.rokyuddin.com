import type { RedactionRect } from "../types";

export interface NormalizedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Normalizes two diagonal points (x1,y1) and (x2,y2) into a standard positive width/height bounding box.
 */
export function normalizeRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): NormalizedRect {
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  return { x, y, width, height };
}

/**
 * Clamps a normalized rectangle within maximum canvas dimensions.
 */
export function clampRectToBounds(
  rect: NormalizedRect,
  maxWidth: number,
  maxHeight: number
): NormalizedRect {
  const x = Math.max(0, Math.min(rect.x, maxWidth));
  const y = Math.max(0, Math.min(rect.y, maxHeight));
  const width = Math.max(0, Math.min(rect.width, maxWidth - x));
  const height = Math.max(0, Math.min(rect.height, maxHeight - y));
  return { x, y, width, height };
}

/**
 * Applies pixelation mosaic effect to a specific region on the canvas.
 */
export function applyPixelate(
  ctx: CanvasRenderingContext2D,
  rect: NormalizedRect,
  blockSize: number
) {
  if (rect.width <= 0 || rect.height <= 0) return;

  const validBlock = Math.max(2, Math.min(100, Math.round(blockSize)));
  const sx = Math.floor(rect.x);
  const sy = Math.floor(rect.y);
  const sw = Math.ceil(rect.width);
  const sh = Math.ceil(rect.height);

  const scaledW = Math.max(1, Math.ceil(sw / validBlock));
  const scaledH = Math.max(1, Math.ceil(sh / validBlock));

  // Create temporary offscreen canvas for downscaling
  const offscreen = document.createElement("canvas");
  offscreen.width = scaledW;
  offscreen.height = scaledH;
  const offCtx = offscreen.getContext("2d");
  if (!offCtx) return;

  // 1. Draw source region downscaled
  offCtx.drawImage(ctx.canvas, sx, sy, sw, sh, 0, 0, scaledW, scaledH);

  // 2. Draw back upscaled with pixelated nearest-neighbor interpolation
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.beginPath();
  ctx.rect(sx, sy, sw, sh);
  ctx.clip();
  ctx.drawImage(offscreen, 0, 0, scaledW, scaledH, sx, sy, sw, sh);
  ctx.restore();
}

/**
 * Applies smooth privacy blur to a specific region on the canvas.
 */
export function applyBlur(
  ctx: CanvasRenderingContext2D,
  rect: NormalizedRect,
  blurRadius: number
) {
  if (rect.width <= 0 || rect.height <= 0) return;

  const validRadius = Math.max(1, Math.min(50, Math.round(blurRadius)));
  const sx = Math.floor(rect.x);
  const sy = Math.floor(rect.y);
  const sw = Math.ceil(rect.width);
  const sh = Math.ceil(rect.height);

  // Extract region to offscreen canvas
  const offscreen = document.createElement("canvas");
  offscreen.width = sw;
  offscreen.height = sh;
  const offCtx = offscreen.getContext("2d");
  if (!offCtx) return;

  offCtx.drawImage(ctx.canvas, sx, sy, sw, sh, 0, 0, sw, sh);

  ctx.save();
  ctx.beginPath();
  ctx.rect(sx, sy, sw, sh);
  ctx.clip();
  ctx.filter = `blur(${validRadius}px)`;
  ctx.drawImage(offscreen, sx, sy);
  ctx.restore();
}

/**
 * Applies solid black or white privacy censor box.
 */
export function applySolidBox(
  ctx: CanvasRenderingContext2D,
  rect: NormalizedRect,
  color: string
) {
  if (rect.width <= 0 || rect.height <= 0) return;

  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.floor(rect.x),
    Math.floor(rect.y),
    Math.ceil(rect.width),
    Math.ceil(rect.height)
  );
  ctx.restore();
}

/**
 * Renders base image and all active redaction regions onto a canvas.
 */
export function renderCanvasWithRedactions(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | ImageBitmap,
  redactions: RedactionRect[]
) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  canvas.width = image.width;
  canvas.height = image.height;

  // Clear and draw original pristine image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);

  // Apply each redaction in order
  for (const r of redactions) {
    const rect = clampRectToBounds(
      { x: r.x, y: r.y, width: r.width, height: r.height },
      canvas.width,
      canvas.height
    );

    if (r.mode === "pixelate") {
      applyPixelate(ctx, rect, r.strength || 16);
    } else if (r.mode === "blur") {
      applyBlur(ctx, rect, r.strength || 12);
    } else if (r.mode === "blackout") {
      applySolidBox(ctx, rect, "#000000");
    } else if (r.mode === "whiteout") {
      applySolidBox(ctx, rect, "#FFFFFF");
    }
  }
}
