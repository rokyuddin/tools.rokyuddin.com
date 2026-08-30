import JSZip from "jszip";
import { triggerDownload } from "@/lib/utils";
import type { RenamedFileItem } from "./rename-engine";

export async function downloadAllRenamedFilesAsZip(
  items: RenamedFileItem[],
  zipFilename = "renamed-files.zip",
  onProgress?: (progress: number) => void
): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    zip.file(item.newName, item.file);
  }

  const content = await zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
    (metadata) => {
      if (onProgress) onProgress(Math.round(metadata.percent));
    }
  );

  const url = URL.createObjectURL(content);
  triggerDownload(url, zipFilename);
  URL.revokeObjectURL(url);
}

export function downloadSingleFile(file: File, newFilename: string): void {
  const url = URL.createObjectURL(file);
  triggerDownload(url, newFilename);
  URL.revokeObjectURL(url);
}
