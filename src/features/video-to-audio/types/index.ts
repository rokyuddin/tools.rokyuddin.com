export type AudioFormat = "mp3" | "wav" | "aac" | "ogg" | "webm" | "flac";

export type BitrateOption = 128 | 192 | 256 | 320;

export type AudioChannels = 1 | 2; // 1 = mono, 2 = stereo

export interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  duration: number;
  videoWidth?: number;
  videoHeight?: number;
  sampleRate?: number;
  numberOfChannels?: number;
}

export interface AudioTrimRange {
  enabled: boolean;
  startTime: number;
  endTime: number;
}

export interface ExtractionOptions {
  format: AudioFormat;
  bitrate: BitrateOption;
  channels: AudioChannels;
  sampleRate: number;
  trim: AudioTrimRange;
}

export interface ExtractionProgress {
  stage: "decoding" | "encoding" | "complete" | "error";
  percentage: number;
  message: string;
}

export interface ExtractedAudioResult {
  blob: Blob;
  url: string;
  format: AudioFormat;
  filename: string;
  size: number;
  duration: number;
  bitrate?: number;
}
