import type { SubtitleCue, TranscriptLanguage } from "../types";
import {
  mapWhisperResponseToCues,
  type WhisperApiResponse,
  type WhisperSegment,
} from "./subtitle-formats";

export type { WhisperApiResponse, WhisperSegment };
export { mapWhisperResponseToCues };

/**
 * Transcribes an audio or video file via the server-side OpenRouter API route.
 * The OPENROUTER_API_KEY is securely stored in Vercel environment variables.
 */
export async function transcribeWithOpenRouter(
  file: File | Blob,
  language: TranscriptLanguage,
): Promise<SubtitleCue[]> {
  const formData = new FormData();
  formData.append("file", file, "audio.mp3");
  formData.append("language", language);

  const res = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const errorMsg =
      errorBody.error ||
      `Transcription failed with status ${res.status}. Please check server configuration.`;
    throw new Error(errorMsg);
  }

  const data = await res.json();
  if (Array.isArray(data.cues) && data.cues.length > 0) {
    return data.cues.map((c: any, idx: number) => ({
      id: c.id || `cue-${idx + 1}`,
      start: typeof c.start === "number" ? Number(c.start.toFixed(3)) : 0,
      end: typeof c.end === "number" ? Number(c.end.toFixed(3)) : 3,
      text: String(c.text || "").trim(),
    }));
  }
  return mapWhisperResponseToCues(data);
}

/**
 * Uses OpenRouter LLMs via the server route to polish grammar/punctuation or translate subtitles.
 */
export async function polishSubtitlesWithOpenRouter(
  cues: SubtitleCue[],
  action: "polish" | "translate_to_bn" | "translate_to_en",
): Promise<SubtitleCue[]> {
  if (cues.length === 0) return [];

  const res = await fetch("/api/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cues,
      action,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error ||
        `AI operation failed with status ${res.status}.`,
    );
  }

  const data = await res.json();
  if (Array.isArray(data.cues) && data.cues.length > 0) {
    return data.cues.map((item: any, idx: number) => ({
      id: item.id || cues[idx]?.id || `cue-${idx + 1}`,
      start: typeof item.start === "number" ? item.start : cues[idx]?.start || 0,
      end: typeof item.end === "number" ? item.end : cues[idx]?.end || 3,
      text: String(item.text || "").trim(),
    }));
  }

  return cues;
}
