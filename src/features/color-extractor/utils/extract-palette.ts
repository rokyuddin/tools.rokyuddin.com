import { buildColorInfo, type ColorInfo } from "./color-math";

export async function extractDominantPalette(
  imageSource: HTMLImageElement | ImageData,
  maxColors = 8
): Promise<ColorInfo[]> {
  let imgData: ImageData;

  if (imageSource instanceof HTMLImageElement) {
    const canvas = document.createElement("canvas");
    // Downscale for speed
    const maxDim = 200;
    let w = imageSource.naturalWidth || imageSource.width;
    let h = imageSource.naturalHeight || imageSource.height;

    if (w > maxDim || h > maxDim) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    canvas.width = Math.max(1, w);
    canvas.height = Math.max(1, h);

    const ctx = canvas.getContext("2d");
    if (!ctx) return [];

    ctx.drawImage(imageSource, 0, 0, w, h);
    imgData = ctx.getImageData(0, 0, w, h);
  } else {
    imgData = imageSource;
  }

  const data = imgData.data;
  const colorBuckets: Map<string, { r: number; g: number; b: number; count: number }> = new Map();

  // Sample every 4th pixel for speed
  for (let i = 0; i < data.length; i += 16) {
    const a = data[i + 3];
    if (a < 128) continue; // Skip transparent

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Quantize into buckets (step size 24 for clustering similar hues)
    const step = 24;
    const qr = Math.floor(r / step) * step;
    const qg = Math.floor(g / step) * step;
    const qb = Math.floor(b / step) * step;
    const key = `${qr},${qg},${qb}`;

    const existing = colorBuckets.get(key);
    if (existing) {
      existing.count += 1;
      existing.r += r;
      existing.g += g;
      existing.b += b;
    } else {
      colorBuckets.set(key, { r, g, b, count: 1 });
    }
  }

  // Sort by count and pick top distinct colors
  const sorted = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);

  const palette: ColorInfo[] = [];
  for (const bucket of sorted) {
    if (palette.length >= maxColors) break;

    const avgR = Math.round(bucket.r / bucket.count);
    const avgG = Math.round(bucket.g / bucket.count);
    const avgB = Math.round(bucket.b / bucket.count);

    const colorInfo = buildColorInfo(avgR, avgG, avgB);

    // Ensure visual difference from already picked colors
    const isTooClose = palette.some(
      (p) =>
        Math.abs(p.r - avgR) < 25 &&
        Math.abs(p.g - avgG) < 25 &&
        Math.abs(p.b - avgB) < 25
    );

    if (!isTooClose) {
      palette.push(colorInfo);
    }
  }

  return palette;
}
