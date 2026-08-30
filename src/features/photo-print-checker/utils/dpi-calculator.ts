export type QualityTier = "excellent" | "very-good" | "good" | "fair" | "low";

export interface QualityAssessment {
  tier: QualityTier;
  stars: number;
  label: string;
  badgeVariant: "success" | "secondary" | "warning" | "destructive" | "outline";
  description: string;
  viewingDistance: string;
}

export interface PrintSizeEvaluation {
  id: string;
  name: string;
  category: string;
  widthIn: number;
  heightIn: number;
  widthCm: number;
  heightCm: number;
  aspectRatioLabel: string;
  typicalUse: string;
  dpi: number;
  effectiveDpi: number;
  quality: QualityAssessment;
  requiresRotation: boolean;
  aspectRatioMismatch: boolean;
  cropPercent: number; // e.g. 6.25 means 6.25% cropped
  minPixelsFor300Dpi: { width: number; height: number };
}

export interface ImagePrintSummary {
  width: number;
  height: number;
  aspectRatio: number;
  aspectRatioString: string;
  megapixels: number;
  maxSizeAt300DpiInches: { width: number; height: number };
  maxSizeAt300DpiCm: { width: number; height: number };
  maxSizeAt240DpiInches: { width: number; height: number };
  maxSizeAt150DpiInches: { width: number; height: number };
}

export function getQualityAssessment(dpi: number): QualityAssessment {
  if (dpi >= 300) {
    return {
      tier: "excellent",
      stars: 5,
      label: "Excellent",
      badgeVariant: "success",
      description: "Ultra-sharp photo lab & gallery print quality.",
      viewingDistance: "Up close (< 1 foot)",
    };
  }
  if (dpi >= 240) {
    return {
      tier: "very-good",
      stars: 4,
      label: "Very Good",
      badgeVariant: "success",
      description: "Crisp and sharp for desktop frames & photobooks.",
      viewingDistance: "Arm's length (1–2 feet)",
    };
  }
  if (dpi >= 180) {
    return {
      tier: "good",
      stars: 3,
      label: "Good",
      badgeVariant: "secondary",
      description: "Great for framed wall art and canvas prints.",
      viewingDistance: "Wall display (2–4 feet)",
    };
  }
  if (dpi >= 150) {
    return {
      tier: "fair",
      stars: 2,
      label: "Fair Quality",
      badgeVariant: "warning",
      description: "Acceptable for large posters viewed from a distance.",
      viewingDistance: "Poster distance (4+ feet)",
    };
  }
  return {
    tier: "low",
    stars: 1,
    label: "Low Quality",
    badgeVariant: "destructive",
    description: "May appear soft or pixelated. Use a higher resolution photo.",
    viewingDistance: "Far distance only (6+ feet)",
  };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function formatAspectRatio(width: number, height: number): string {
  const divisor = gcd(Math.round(width), Math.round(height));
  const wRatio = Math.round(width) / divisor;
  const hRatio = Math.round(height) / divisor;

  // Check standard ratios
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.02) return "1:1 (Square)";
  if (Math.abs(ratio - 4 / 3) < 0.03 || Math.abs(ratio - 3 / 4) < 0.03) return "4:3 (Standard Phone/M43)";
  if (Math.abs(ratio - 3 / 2) < 0.03 || Math.abs(ratio - 2 / 3) < 0.03) return "3:2 (Standard DSLR)";
  if (Math.abs(ratio - 16 / 9) < 0.03 || Math.abs(ratio - 9 / 16) < 0.03) return "16:9 (Widescreen)";
  if (Math.abs(ratio - 5 / 4) < 0.03 || Math.abs(ratio - 4 / 5) < 0.03) return "5:4 (8x10 Frame)";

  if (wRatio < 20 && hRatio < 20) {
    return `${wRatio}:${hRatio}`;
  }
  return `${ratio.toFixed(2)}:1`;
}

export function evaluatePrintSize(
  imgWidth: number,
  imgHeight: number,
  targetWidthIn: number,
  targetHeightIn: number
): {
  dpi: number;
  effectiveDpi: number;
  requiresRotation: boolean;
  aspectRatioMismatch: boolean;
  cropPercent: number;
  minPixelsFor300Dpi: { width: number; height: number };
} {
  const isImgLandscape = imgWidth >= imgHeight;
  const isPrintLandscape = targetWidthIn >= targetHeightIn;
  const requiresRotation = isImgLandscape !== isPrintLandscape;

  const effectivePrintW = requiresRotation ? targetHeightIn : targetWidthIn;
  const effectivePrintH = requiresRotation ? targetWidthIn : targetHeightIn;

  // DPI along both axes
  const dpiX = imgWidth / effectivePrintW;
  const dpiY = imgHeight / effectivePrintH;
  const effectiveDpi = Math.round(Math.min(dpiX, dpiY));

  // Aspect ratio comparison
  const imgAspect = imgWidth / imgHeight;
  const printAspect = effectivePrintW / effectivePrintH;
  const aspectDiff = Math.abs(imgAspect - printAspect) / imgAspect;
  const aspectRatioMismatch = aspectDiff > 0.03; // >3% difference

  // Calculate crop percentage
  let cropPercent = 0;
  if (aspectRatioMismatch) {
    if (imgAspect > printAspect) {
      // Image is wider than print -> sides get cropped
      cropPercent = Math.round(((imgAspect - printAspect) / imgAspect) * 100);
    } else {
      // Image is taller than print -> top/bottom get cropped
      cropPercent = Math.round(((printAspect - imgAspect) / printAspect) * 100);
    }
  }

  const minPixelsFor300Dpi = {
    width: Math.round(effectivePrintW * 300),
    height: Math.round(effectivePrintH * 300),
  };

  return {
    dpi: effectiveDpi,
    effectiveDpi,
    requiresRotation,
    aspectRatioMismatch,
    cropPercent,
    minPixelsFor300Dpi,
  };
}

export function calculateImagePrintSummary(width: number, height: number): ImagePrintSummary {
  const isLandscape = width >= height;
  const longSide = Math.max(width, height);
  const shortSide = Math.min(width, height);

  const max300Long = parseFloat((longSide / 300).toFixed(1));
  const max300Short = parseFloat((shortSide / 300).toFixed(1));

  const max240Long = parseFloat((longSide / 240).toFixed(1));
  const max240Short = parseFloat((shortSide / 240).toFixed(1));

  const max150Long = parseFloat((longSide / 150).toFixed(1));
  const max150Short = parseFloat((shortSide / 150).toFixed(1));

  return {
    width,
    height,
    aspectRatio: parseFloat((width / height).toFixed(2)),
    aspectRatioString: formatAspectRatio(width, height),
    megapixels: parseFloat(((width * height) / 1_000_000).toFixed(1)),
    maxSizeAt300DpiInches: {
      width: isLandscape ? max300Long : max300Short,
      height: isLandscape ? max300Short : max300Long,
    },
    maxSizeAt300DpiCm: {
      width: parseFloat(((isLandscape ? max300Long : max300Short) * 2.54).toFixed(1)),
      height: parseFloat(((isLandscape ? max300Short : max300Long) * 2.54).toFixed(1)),
    },
    maxSizeAt240DpiInches: {
      width: isLandscape ? max240Long : max240Short,
      height: isLandscape ? max240Short : max240Long,
    },
    maxSizeAt150DpiInches: {
      width: isLandscape ? max150Long : max150Short,
      height: isLandscape ? max150Short : max150Long,
    },
  };
}
