export interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
  r: number;
  g: number;
  b: number;
  contrastOnWhite: number;
  contrastOnBlack: number;
  isLight: boolean;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function buildColorInfo(r: number, g: number, b: number): ColorInfo {
  const hex = rgbToHex(r, g, b);
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const hsl = rgbToHsl(r, g, b);

  const lum = getLuminance(r, g, b);
  const contrastOnWhite = getContrastRatio(1.0, lum);
  const contrastOnBlack = getContrastRatio(lum, 0.0);
  const isLight = lum > 0.5;

  // Approximate OKLCH representation for CSS
  const oklch = `oklch(${(lum * 0.8 + 0.2).toFixed(3)} 0.15 ${Math.round(
    parseInt(hsl.replace(/[^\d,]/g, "").split(",")[0] || "0", 10)
  )})`;

  return {
    hex,
    rgb,
    hsl,
    oklch,
    r,
    g,
    b,
    contrastOnWhite,
    contrastOnBlack,
    isLight,
  };
}
