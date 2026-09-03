export type SizeUnit = "KB" | "MB";

export const BYTES_PER_KB = 1024;
export const BYTES_PER_MB = 1024 * 1024;
export const MAX_SAFE_TARGET_BYTES = 100 * BYTES_PER_MB; // 100 MB

/**
 * Converts a numeric amount and unit (KB or MB) to an integer byte count.
 */
export function parseUnitToBytes(amount: number, unit: SizeUnit): number {
  if (Number.isNaN(amount) || amount <= 0) return 0;
  const multiplier = unit === "MB" ? BYTES_PER_MB : BYTES_PER_KB;
  return Math.round(amount * multiplier);
}

/**
 * Validates the desired target size against the original file size and upper memory ceiling.
 */
export function validateTargetSize(
  currentBytes: number,
  targetBytes: number,
  maxBytes: number = MAX_SAFE_TARGET_BYTES,
): { isValid: boolean; error?: string } {
  if (Number.isNaN(targetBytes) || targetBytes <= 0) {
    return { isValid: false, error: "Please enter a valid target file size." };
  }

  if (targetBytes <= currentBytes) {
    return {
      isValid: false,
      error: `Target size must be larger than current file size (${formatFileSize(currentBytes)}).`,
    };
  }

  if (targetBytes > maxBytes) {
    return {
      isValid: false,
      error: `Target size exceeds the safe maximum limit of ${formatFileSize(maxBytes)}.`,
    };
  }

  return { isValid: true };
}

/**
 * Computes exact count of padding bytes to append.
 */
export function calculatePaddingBytes(
  currentBytes: number,
  targetBytes: number,
): number {
  if (targetBytes <= currentBytes) return 0;
  return targetBytes - currentBytes;
}

/**
 * Formats a byte number to human-readable string (B, KB, MB).
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes <= 0) return "0 B";
  if (bytes < BYTES_PER_KB) return `${bytes} B`;
  if (bytes < BYTES_PER_MB) {
    const kb = bytes / BYTES_PER_KB;
    return `${kb.toFixed(Number.isInteger(kb) ? 0 : decimals)} KB`;
  }
  const mb = bytes / BYTES_PER_MB;
  return `${mb.toFixed(Number.isInteger(mb) ? 0 : decimals)} MB`;
}

/**
 * Formats an output filename to clearly indicate the padded target size.
 * e.g. "my-photo.jpg" + 1048576 bytes -> "my-photo-1MB.jpg"
 */
export function generatePaddedFileName(
  originalName: string,
  targetBytes: number,
): string {
  const lastDotIndex = originalName.lastIndexOf(".");
  let baseName = originalName;
  let extension = "";

  if (lastDotIndex > 0) {
    baseName = originalName.slice(0, lastDotIndex);
    extension = originalName.slice(lastDotIndex);
  }

  const formattedSize = formatFileSize(targetBytes).replace(/\s+/g, "");
  return `${baseName}-${formattedSize}${extension}`;
}

/**
 * Assembles a padded Blob by combining the original file bytes with trailing null bytes.
 * Safely handles chunked allocation to avoid browser array buffer size limits.
 */
export function generatePaddedBlob(
  fileData: Uint8Array | ArrayBuffer | Blob,
  targetBytes: number,
  mimeType: string = "application/octet-stream",
): Blob {
  const currentBytes =
    fileData instanceof Blob ? fileData.size : fileData.byteLength;
  const paddingNeeded = calculatePaddingBytes(currentBytes, targetBytes);

  if (paddingNeeded <= 0) {
    return fileData instanceof Blob
      ? fileData
      : new Blob([fileData as BlobPart], { type: mimeType });
  }

  // Construct zero-filled padding chunks (64KB chunks or single chunk)
  // Web API Blob accepts multiple ArrayBuffer/Uint8Array slices without duplicating memory in JS heap
  const CHUNK_SIZE = 1024 * 1024; // 1 MB null buffer chunks
  const parts: BlobPart[] = [fileData as BlobPart];

  let remaining = paddingNeeded;
  while (remaining > 0) {
    const thisChunkSize = Math.min(remaining, CHUNK_SIZE);
    parts.push(new Uint8Array(thisChunkSize) as BlobPart);
    remaining -= thisChunkSize;
  }

  return new Blob(parts, { type: mimeType });
}
