import { Mp3Encoder } from "@breezystack/lamejs";
import type { AudioChannels, BitrateOption } from "../types";

export interface Mp3EncodeOptions {
  sampleRate: number;
  channels: AudioChannels;
  bitrate: BitrateOption;
  startSample?: number;
  endSample?: number;
  onProgress?: (percentage: number) => void;
}

/**
 * Converts Float32Array audio samples (-1.0 to 1.0) to 16-bit signed PCM Int16Array (-32768 to 32767).
 */
export function floatToInt16(samples: Float32Array, start: number, end: number): Int16Array {
  const len = Math.max(0, end - start);
  const int16 = new Int16Array(len);
  for (let i = 0; i < len; i++) {
    const s = Math.max(-1, Math.min(1, samples[start + i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

/**
 * Encodes audio channels into an MP3 Blob with asynchronous batching to prevent UI freezing.
 */
export async function encodeMp3FromChannels(
  channelsData: Float32Array[],
  options: Mp3EncodeOptions,
): Promise<Blob> {
  const { sampleRate, channels: targetChannels, bitrate, onProgress } = options;
  const numInputChannels = channelsData.length;

  if (numInputChannels === 0 || channelsData[0].length === 0) {
    throw new Error("Cannot encode empty audio channel data");
  }

  const inputLength = channelsData[0].length;
  const start = Math.max(0, options.startSample ?? 0);
  const end = Math.min(inputLength, options.endSample ?? inputLength);
  const totalSamples = end - start;

  if (totalSamples <= 0) {
    throw new Error("Invalid start and end sample range");
  }

  const mp3Encoder = new Mp3Encoder(targetChannels, sampleRate, bitrate);
  const mp3DataParts: BlobPart[] = [];

  // Convert float to Int16
  const ch0 = channelsData[0];
  let leftInt16: Int16Array;
  let rightInt16: Int16Array | null = null;

  if (targetChannels === 1) {
    if (numInputChannels > 1) {
      // Downmix to mono
      const ch1 = channelsData[1];
      leftInt16 = new Int16Array(totalSamples);
      for (let i = 0; i < totalSamples; i++) {
        const s = (ch0[start + i] + ch1[start + i]) * 0.5;
        const clamped = Math.max(-1, Math.min(1, s));
        leftInt16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      }
    } else {
      leftInt16 = floatToInt16(ch0, start, end);
    }
  } else {
    // Stereo
    leftInt16 = floatToInt16(ch0, start, end);
    const ch1 = numInputChannels > 1 ? channelsData[1] : ch0;
    rightInt16 = floatToInt16(ch1, start, end);
  }

  // LAME processes in blocks of 1152 samples
  const sampleBlockSize = 1152;
  const totalBlocks = Math.ceil(totalSamples / sampleBlockSize);

  for (let blockIdx = 0; blockIdx < totalBlocks; blockIdx++) {
    const chunkStart = blockIdx * sampleBlockSize;
    const chunkEnd = Math.min(chunkStart + sampleBlockSize, totalSamples);

    const leftChunk = leftInt16.subarray(chunkStart, chunkEnd);
    let mp3Buf: Uint8Array | Int8Array;

    if (targetChannels === 1 || !rightInt16) {
      mp3Buf = mp3Encoder.encodeBuffer(leftChunk);
    } else {
      const rightChunk = rightInt16.subarray(chunkStart, chunkEnd);
      mp3Buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
    }

    if (mp3Buf.length > 0) {
      const copy = new Uint8Array(mp3Buf.length);
      copy.set(mp3Buf);
      mp3DataParts.push(copy);
    }

    // Every 50 blocks (~1.3s of audio), yield to event loop so UI stays 60fps responsive
    if (blockIdx % 50 === 0) {
      const percent = Math.min(99, Math.round((blockIdx / totalBlocks) * 100));
      onProgress?.(percent);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // Flush remaining frames from encoder
  const finalBuf = mp3Encoder.flush();
  if (finalBuf.length > 0) {
    const copy = new Uint8Array(finalBuf.length);
    copy.set(finalBuf);
    mp3DataParts.push(copy);
  }

  onProgress?.(100);

  return new Blob(mp3DataParts, { type: "audio/mp3" });
}
