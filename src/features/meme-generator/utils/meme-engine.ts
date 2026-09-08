export type MemeExportFormat = "png" | "jpeg" | "webp";

export type MemeFontId = "impact" | "arial" | "serif" | "mono";

export type MemeTextAlign = "left" | "center" | "right";

export interface MemeTemplate {
  id: string;
  name: string;
  file: string;
  defaultTexts: string[];
}

export interface TextOverlayState {
  id: string;
  text: string;
  /** Horizontal anchor as a fraction of Base Image width (0–1). */
  x: number;
  /** Vertical anchor as a fraction of Base Image height (0–1). */
  y: number;
  /** Font size as a fraction of Base Image width. */
  size: number;
  font: MemeFontId;
  color: string;
  strokeColor: string;
  /** Stroke width as a fraction of font size. */
  strokeWidth: number;
  align: MemeTextAlign;
  bold: boolean;
  italic: boolean;
}

export interface IconOverlayState {
  id: string;
  emoji: string;
  /** Position as fractions of Base Image dimensions (0–1). */
  x: number;
  y: number;
  /** Size as a fraction of Base Image width. */
  size: number;
}

export interface CanvasPaddingState {
  /** Top bar height as a fraction of Base Image height (0–0.5). */
  top: number;
  /** Bottom bar height as a fraction of Base Image height (0–0.5). */
  bottom: number;
  color: string;
}

export const MIN_OVERLAY_SIZE = 0.02;
export const MAX_OVERLAY_SIZE = 0.5;
export const DEFAULT_TEXT_SIZE = 0.09;
export const DEFAULT_ICON_SIZE = 0.15;
export const MAX_PADDING_FRACTION = 0.5;

export const MEME_FONTS: Record<MemeFontId, string> = {
  impact: "Impact, 'Arial Black', sans-serif",
  arial: "Arial, Helvetica, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
};

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function clampOverlayPosition(
  x: number,
  y: number,
): { x: number; y: number } {
  return { x: clamp01(x), y: clamp01(y) };
}

export function clampOverlaySize(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TEXT_SIZE;
  return Math.min(MAX_OVERLAY_SIZE, Math.max(MIN_OVERLAY_SIZE, value));
}

export function clampPaddingFraction(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_PADDING_FRACTION, Math.max(0, value));
}

export function resolveExportDimensions(
  baseW: number,
  baseH: number,
  padding: CanvasPaddingState,
): { width: number; height: number; padTopPx: number; padBottomPx: number } {
  const width = Math.max(1, Math.round(baseW));
  const height = Math.max(1, Math.round(baseH));
  const padTopPx = Math.round(height * clampPaddingFraction(padding.top));
  const padBottomPx = Math.round(height * clampPaddingFraction(padding.bottom));
  return { width, height, padTopPx, padBottomPx };
}

let overlaySeq = 0;

export function createOverlayId(prefix: string): string {
  overlaySeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${overlaySeq}`;
}

export function createDefaultTextOverlay(
  index: number,
  total: number,
): TextOverlayState {
  const y =
    total <= 1 ? 0.5 : index === 0 ? 0.08 : index === total - 1 ? 0.9 : 0.5;
  return {
    id: createOverlayId("text"),
    text: "TEXT HERE",
    x: 0.5,
    y,
    size: DEFAULT_TEXT_SIZE,
    font: "impact",
    color: "#ffffff",
    strokeColor: "#000000",
    strokeWidth: 0.08,
    align: "center",
    bold: false,
    italic: false,
  };
}

export function createDefaultIconOverlay(emoji: string): IconOverlayState {
  return {
    id: createOverlayId("icon"),
    emoji,
    x: 0.5,
    y: 0.5,
    size: DEFAULT_ICON_SIZE,
  };
}

export function buildCanvasFont(
  overlay: TextOverlayState,
  baseWidthPx: number,
): string {
  const px = Math.max(1, overlay.size * baseWidthPx);
  const style = overlay.italic ? "italic " : "";
  const weight = overlay.bold ? "bold " : "";
  return `${style}${weight}${px}px ${MEME_FONTS[overlay.font]}`;
}

const MEME_FORMAT_META: Record<MemeExportFormat, { mime: string; ext: string }> = {
  png: { mime: "image/png", ext: ".png" },
  jpeg: { mime: "image/jpeg", ext: ".jpg" },
  webp: { mime: "image/webp", ext: ".webp" },
};

export function resolveMemeMimeType(format: MemeExportFormat): string {
  return MEME_FORMAT_META[format].mime;
}

export function extensionForMemeFormat(format: MemeExportFormat): string {
  return MEME_FORMAT_META[format].ext;
}

export function sanitizeMemeSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "custom";
}

export function generateMemeFileName(
  baseName: string,
  format: MemeExportFormat,
): string {
  return `meme-${sanitizeMemeSlug(baseName)}${extensionForMemeFormat(format)}`;
}

export function filterTemplates(
  templates: MemeTemplate[],
  query: string,
): MemeTemplate[] {
  const q = query.trim().toLowerCase();
  if (!q) return templates;
  return templates.filter((t) => t.name.toLowerCase().includes(q));
}

export function parseTemplatesManifest(json: unknown): MemeTemplate[] {
  if (!Array.isArray(json)) return [];
  const out: MemeTemplate[] = [];
  for (const entry of json) {
    if (typeof entry !== "object" || entry === null) continue;
    const rec = entry as Record<string, unknown>;
    if (
      typeof rec.id !== "string" ||
      typeof rec.name !== "string" ||
      typeof rec.file !== "string"
    ) {
      continue;
    }
    if (!rec.id || !rec.name || !rec.file) continue;
    out.push({
      id: rec.id,
      name: rec.name,
      file: rec.file,
      defaultTexts: Array.isArray(rec.defaultTexts)
        ? rec.defaultTexts
            .filter((t): t is string => typeof t === "string")
            .slice(0, 4)
        : [],
    });
  }
  return out;
}
