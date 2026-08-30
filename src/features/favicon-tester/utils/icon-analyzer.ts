export interface IconWarning {
  id: string;
  type: "warning" | "error" | "info" | "success";
  title: string;
  message: string;
}

export interface IconAnalysis {
  width: number;
  height: number;
  isSquare: boolean;
  aspectRatio: number;
  warnings: IconWarning[];
}

export function analyzeIconDimensions(width: number, height: number): IconAnalysis {
  const warnings: IconWarning[] = [];
  const aspectRatio = width / height;
  const isSquare = Math.abs(aspectRatio - 1) < 0.01;

  if (!isSquare) {
    warnings.push({
      id: "non-square",
      type: "warning",
      title: "Non-Square Icon (Ratio: " + aspectRatio.toFixed(2) + ":1)",
      message:
        "Favicons and app icons are always displayed as 1:1 squares. Non-square images will be scaled or letterboxed in browser tabs.",
    });
  }

  if (width < 32 || height < 32) {
    warnings.push({
      id: "low-res",
      type: "error",
      title: "Very Low Master Resolution (" + width + "×" + height + "px)",
      message:
        "Upload a master icon of at least 512×512 px (or SVG) so high-density Retina displays and mobile home screens remain crisp.",
    });
  } else if (width < 512 || height < 512) {
    warnings.push({
      id: "medium-res",
      type: "info",
      title: "Good Resolution (" + width + "×" + height + "px)",
      message: "For best mobile PWA and App Store icons, 512×512 px or SVG is recommended.",
    });
  } else {
    warnings.push({
      id: "high-res",
      type: "success",
      title: "High Master Resolution (" + width + "×" + height + "px)",
      message: "Great! Master image contains ample pixel density for all standard device icons.",
    });
  }

  // 16px size detail warning
  warnings.push({
    id: "detail-16px",
    type: "info",
    title: "16px Browser Tab Legibility",
    message:
      "Check the 16×16 preview carefully. Fine typography and thin line illustrations usually disappear or blur at this scale.",
  });

  return {
    width,
    height,
    isSquare,
    aspectRatio,
    warnings,
  };
}

export function generateHtmlFaviconSnippet(siteName = "My Website"): string {
  return `<!-- Standard Favicons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />

<!-- Apple Touch Icon (iOS) -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

<!-- Android & PWA Web App Manifest -->
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#ffffff" />
<meta name="apple-mobile-web-app-title" content="${siteName}" />`;
}
