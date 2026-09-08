import {
  buildCanvasFont,
  type CanvasPaddingState,
  type IconOverlayState,
  resolveExportDimensions,
  type TextOverlayState,
} from "./meme-engine";

export function loadMemeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image: ${src}`));
    img.src = src;
  });
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  for (const raw of text.split("\n")) {
    if (ctx.measureText(raw).width <= maxWidth || raw === "") {
      lines.push(raw);
      continue;
    }
    let current = "";
    for (const word of raw.split(" ")) {
      const trial = current ? `${current} ${word}` : word;
      if (ctx.measureText(trial).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = trial;
      }
    }
    lines.push(current);
  }
  return lines;
}

function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: TextOverlayState,
  baseW: number,
  baseH: number,
  yOffsetPx: number,
): void {
  const fontPx = Math.max(1, overlay.size * baseW);
  ctx.font = buildCanvasFont(overlay, baseW);
  ctx.textAlign = overlay.align;
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(0, fontPx * overlay.strokeWidth);
  const maxWidth = baseW * 0.94;
  const lineHeight = fontPx * 1.15;
  const lines = wrapLines(ctx, overlay.text || " ", maxWidth);
  const blockH = lines.length * lineHeight;
  const cx = overlay.x * baseW;
  const cy = yOffsetPx + overlay.y * baseH;
  const startY = cy - blockH / 2 + lineHeight / 2;
  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;
    if (ctx.lineWidth > 0) {
      ctx.strokeStyle = overlay.strokeColor;
      ctx.strokeText(line, cx, y, maxWidth);
    }
    ctx.fillStyle = overlay.color;
    ctx.fillText(line, cx, y, maxWidth);
  });
}

function drawIconOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: IconOverlayState,
  baseW: number,
  baseH: number,
  yOffsetPx: number,
): void {
  const sizePx = Math.max(1, overlay.size * baseW);
  ctx.font = `${sizePx}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(overlay.emoji, overlay.x * baseW, yOffsetPx + overlay.y * baseH);
}

/**
 * Composites the Meme Output (Base Image + Canvas Padding + overlays)
 * onto the canvas at full base resolution. Browser-only.
 */
export function renderMemeCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  texts: TextOverlayState[],
  icons: IconOverlayState[],
  padding: CanvasPaddingState,
): { width: number; height: number } {
  const baseW = image.naturalWidth || image.width;
  const baseH = image.naturalHeight || image.height;
  const { width, padTopPx, padBottomPx } = resolveExportDimensions(
    baseW,
    baseH,
    padding,
  );
  canvas.width = width;
  canvas.height = baseH + padTopPx + padBottomPx;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { width: canvas.width, height: canvas.height };
  ctx.fillStyle = padding.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, padTopPx, baseW, baseH);
  for (const overlay of texts)
    drawTextOverlay(ctx, overlay, baseW, baseH, padTopPx);
  for (const overlay of icons)
    drawIconOverlay(ctx, overlay, baseW, baseH, padTopPx);
  return { width: canvas.width, height: canvas.height };
}

export function renderMemeToBlob(
  image: HTMLImageElement,
  texts: TextOverlayState[],
  icons: IconOverlayState[],
  padding: CanvasPaddingState,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  renderMemeCanvas(canvas, image, texts, icons, padding);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}
