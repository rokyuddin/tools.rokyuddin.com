export interface CompressionOptions {
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: "image/jpeg" | "image/png" | "image/webp";
}

export interface CompressedImageResult {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  compressedSize: number;
  percentageSaved: number;
  originalWidth: number;
  originalHeight: number;
  compressedWidth: number;
  compressedHeight: number;
  previewUrl: string;
  compressedBlob: Blob;
  compressedUrl: string;
}

export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<CompressedImageResult> {
  const { quality = 0.8, maxWidth = 3840, maxHeight = 2160, outputFormat } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to create canvas context"));
          return;
        }

        // Determine mime type
        let mimeType = outputFormat || file.type;
        if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
          mimeType = "image/jpeg";
        }

        // For JPEG, fill white background if transparency exists
        if (mimeType === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }

        // Draw image smoothly with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }

            const compressedSize = blob.size;
            const originalSize = file.size;
            const percentageSaved = Math.max(
              0,
              Math.round(((originalSize - compressedSize) / originalSize) * 100)
            );

            const compressedUrl = URL.createObjectURL(blob);
            const previewUrl = URL.createObjectURL(file);

            resolve({
              id: `${file.name}-${Date.now()}-${Math.random()}`,
              file,
              name: file.name,
              originalSize,
              compressedSize,
              percentageSaved,
              originalWidth: img.width,
              originalHeight: img.height,
              compressedWidth: width,
              compressedHeight: height,
              previewUrl,
              compressedBlob: blob,
              compressedUrl,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image file"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file"));
    };
  });
}
