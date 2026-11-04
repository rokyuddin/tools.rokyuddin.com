export interface WordTimestamp {
  word: string;
  start: number; // in seconds
  end: number; // in seconds
  confidence?: number;
}

export interface SubtitleCue {
  id: string;
  start: number; // in seconds
  end: number; // in seconds
  text: string;
  words?: WordTimestamp[];
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  words?: WordTimestamp[];
  cues: SubtitleCue[];
}

export type TranscriptLanguage = "bn-BD" | "bn-IN" | "en-US" | "en-GB" | "en-IN";

export type ExportFormat = "srt" | "vtt" | "txt-time" | "txt-plain" | "json" | "csv";

export interface MediaFileState {
  audioFile: File | null;
  videoFile: File | null;
  audioUrl: string | null;
  videoUrl: string | null;
  duration: number;
  isVideo: boolean;
}

export interface TranscriptionProgress {
  status: "idle" | "listening" | "transcribing" | "complete" | "error";
  percentage?: number;
  message: string;
}
