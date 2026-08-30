import JSZip from "jszip";
import { triggerDownload } from "@/lib/utils";

export interface FaviconExportSize {
  name: string;
  size: number;
  filename: string;
}

export const STANDARD_FAVICON_SIZES: FaviconExportSize[] = [
  { name: "Browser Tab (Small)", size: 16, filename: "favicon-16x16.png" },
  { name: "Browser Tab (Retina)", size: 32, filename: "favicon-32x32.png" },
  { name: "Bookmarks & Desktop", size: 48, filename: "favicon-48x48.png" },
  { name: "Apple Touch Icon (iOS)", size: 180, filename: "apple-touch-icon.png" },
  { name: "Android Chrome / PWA", size: 192, filename: "android-chrome-192x192.png" },
  { name: "High-Res Master / PWA", size: 512, filename: "android-chrome-512x512.png" },
];

export async function renderIconToCanvas(
  imgSrc: string,
  targetSize: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw image centered in square
      const aspect = img.naturalWidth / img.naturalHeight;
      let drawW = targetSize;
      let drawH = targetSize;
      let offsetX = 0;
      let offsetY = 0;

      if (aspect > 1) {
        drawH = targetSize / aspect;
        offsetY = (targetSize - drawH) / 2;
      } else if (aspect < 1) {
        drawW = targetSize * aspect;
        offsetX = (targetSize - drawW) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      canvas.toBlob((blob) => resolve(blob), "image/png");
    };
    img.onerror = () => resolve(null);
    img.src = imgSrc;
  });
}

export async function exportFaviconZipBundle(
  imgSrc: string,
  siteName = "my-site"
): Promise<void> {
  const zip = new JSZip();

  for (const item of STANDARD_FAVICON_SIZES) {
    const blob = await renderIconToCanvas(imgSrc, item.size);
    if (blob) {
      zip.file(item.filename, blob);
    }
  }

  // Also include webmanifest
  const manifest = {
    name: siteName,
    short_name: siteName,
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  };

  zip.file("site.webmanifest", JSON.stringify(manifest, null, 2));

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  triggerDownload(url, `${siteName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-favicon-package.zip`);
  URL.revokeObjectURL(url);
}
