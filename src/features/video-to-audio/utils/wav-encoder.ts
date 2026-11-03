/**
 * Pure TypeScript Lossless 16-bit PCM WAV Encoder.
 * Encodes audio channel float samples (-1.0 to 1.0) into a standard RIFF/WAVE format Blob.
 */

export interface WavEncodeOptions {
  sampleRate: number;
  channels: 1 | 2;
  startSample?: number;
  endSample?: number;
}

/**
 * Encodes raw multi-channel Float32Array PCM samples into a standard 16-bit WAV ArrayBuffer / Blob.
 */
export function encodeWavFromChannels(
  channelsData: Float32Array[],
  options: WavEncodeOptions,
): Blob {
  const { sampleRate, channels: targetChannels } = options;
  const numInputChannels = channelsData.length;

  if (numInputChannels === 0 || channelsData[0].length === 0) {
    throw new Error("Cannot encode empty audio channel data");
  }

  const inputLength = channelsData[0].length;
  const start = Math.max(0, options.startSample ?? 0);
  const end = Math.min(inputLength, options.endSample ?? inputLength);
  const numSamples = Math.max(0, end - start);

  const bytesPerSample = 2; // 16-bit
  const blockAlign = targetChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataByteLength = numSamples * blockAlign;
  const bufferByteLength = 44 + dataByteLength;

  const buffer = new ArrayBuffer(bufferByteLength);
  const view = new DataView(buffer);

  // Helper to write ASCII strings into DataView
  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // 1. RIFF Header
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataByteLength, true); // Chunk size
  writeString(8, "WAVE");

  // 2. "fmt " Sub-chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, targetChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // 3. "data" Sub-chunk
  writeString(36, "data");
  view.setUint32(40, dataByteLength, true);

  // Write PCM samples (interleaved)
  let offset = 44;
  const ch0 = channelsData[0];
  const ch1 = numInputChannels > 1 ? channelsData[1] : ch0;

  for (let i = start; i < end; i++) {
    if (targetChannels === 1) {
      // Downmix to mono if input is stereo
      let sample = numInputChannels > 1 ? (ch0[i] + ch1[i]) * 0.5 : ch0[i];
      sample = Math.max(-1, Math.min(1, sample));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    } else {
      // Stereo
      let s0 = Math.max(-1, Math.min(1, ch0[i]));
      let s1 = Math.max(-1, Math.min(1, ch1[i]));
      const int0 = s0 < 0 ? s0 * 0x8000 : s0 * 0x7fff;
      const int1 = s1 < 0 ? s1 * 0x8000 : s1 * 0x7fff;
      view.setInt16(offset, int0, true);
      view.setInt16(offset + 2, int1, true);
      offset += 4;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

/**
 * Encodes an Web Audio API AudioBuffer to WAV Blob.
 */
export function encodeAudioBufferToWav(
  audioBuffer: AudioBuffer,
  options?: Partial<WavEncodeOptions>,
): Blob {
  const numChannels = Math.min(2, audioBuffer.numberOfChannels) as 1 | 2;
  const channelsData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelsData.push(audioBuffer.getChannelData(c));
  }

  return encodeWavFromChannels(channelsData, {
    sampleRate: options?.sampleRate || audioBuffer.sampleRate,
    channels: options?.channels || numChannels,
    startSample: options?.startSample,
    endSample: options?.endSample,
  });
}
