export interface WebpConversionResult {
  id: string;
  file: File;
  name: string;
  webpName: string;
  originalSize: number;
  webpSize: number;
  percentageSaved: number;
  width: number;
  height: number;
  previewUrl: string;
  webpBlob: Blob;
  webpUrl: string;
}

export async function convertToWebp(
  file: File,
  quality = 0.85
): Promise<WebpConversionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to create canvas context"));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("WebP conversion failed"));
              return;
            }

            const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const webpName = `${baseName}.webp`;
            const webpUrl = URL.createObjectURL(blob);
            const previewUrl = URL.createObjectURL(file);

            const percentageSaved = Math.max(
              0,
              Math.round(((file.size - blob.size) / file.size) * 100)
            );

            resolve({
              id: `${file.name}-${Date.now()}-${Math.random()}`,
              file,
              name: file.name,
              webpName,
              originalSize: file.size,
              webpSize: blob.size,
              percentageSaved,
              width: img.width,
              height: img.height,
              previewUrl,
              webpBlob: blob,
              webpUrl,
            });
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image"));
    };
  });
}
