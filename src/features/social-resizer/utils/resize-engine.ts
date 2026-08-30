import { SocialPreset } from "./presets";

export type FitMode = "blur" | "fill" | "white" | "black";

export interface ResizedSocialResult {
  preset: SocialPreset;
  dataUrl: string;
  blob: Blob;
}

export async function renderSocialImage(
  img: HTMLImageElement,
  preset: SocialPreset,
  fitMode: FitMode = "blur"
): Promise<ResizedSocialResult> {
  const canvas = document.createElement("canvas");
  canvas.width = preset.width;
  canvas.height = preset.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  const targetW = preset.width;
  const targetH = preset.height;
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;

  if (fitMode === "blur") {
    // 1. Draw scaled background and blur it
    ctx.save();
    ctx.filter = "blur(30px) brightness(0.7)";
    // Cover the background
    const bgScale = Math.max(targetW / imgW, targetH / imgH);
    const bgW = imgW * bgScale;
    const bgH = imgH * bgScale;
    const bgX = (targetW - bgW) / 2;
    const bgY = (targetH - bgH) / 2;
    ctx.drawImage(img, bgX, bgY, bgW, bgH);
    ctx.restore();

    // 2. Draw centered crisp foreground
    const fgScale = Math.min(targetW / imgW, targetH / imgH);
    const fgW = imgW * fgScale;
    const fgH = imgH * fgScale;
    const fgX = (targetW - fgW) / 2;
    const fgY = (targetH - fgH) / 2;

    // Soft drop shadow on centered image
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 15;
    ctx.drawImage(img, fgX, fgY, fgW, fgH);
    ctx.restore();
  } else if (fitMode === "fill") {
    // Smart Crop / Fill
    const scale = Math.max(targetW / imgW, targetH / imgH);
    const w = imgW * scale;
    const h = imgH * scale;
    const x = (targetW - w) / 2;
    const y = (targetH - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  } else {
    // Solid background (white or black)
    ctx.fillStyle = fitMode === "white" ? "#ffffff" : "#000000";
    ctx.fillRect(0, 0, targetW, targetH);

    const scale = Math.min(targetW / imgW, targetH / imgH);
    const w = imgW * scale;
    const h = imgH * scale;
    const x = (targetW - w) / 2;
    const y = (targetH - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to export resized social image"));
          return;
        }
        const dataUrl = URL.createObjectURL(blob);
        resolve({
          preset,
          dataUrl,
          blob,
        });
      },
      "image/jpeg",
      0.9
    );
  });
}
