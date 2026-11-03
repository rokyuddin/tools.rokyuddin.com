import type { SubtitleCue, TranscriptLanguage } from "../types";
import {
  getOpenRouterApiKey,
  saveOpenRouterApiKey,
  getOpenRouterHeaders,
  OPENROUTER_DEFAULT_WHISPER_MODEL,
  OPENROUTER_DEFAULT_TEXT_MODEL,
} from "@/lib/openrouter";

import {
  mapWhisperResponseToCues,
  type WhisperApiResponse,
  type WhisperSegment,
} from "./subtitle-formats";

export type { WhisperApiResponse, WhisperSegment };
export { getOpenRouterApiKey, saveOpenRouterApiKey, mapWhisperResponseToCues };

/**
 * Transcribes an audio or video file using OpenRouter's speech-to-text API.
 * Uses OpenAI Whisper Large v3 through OpenRouter.
 */
export async function transcribeWithOpenRouter(
  file: File | Blob,
  apiKey: string,
  language: TranscriptLanguage,
  model = OPENROUTER_DEFAULT_WHISPER_MODEL,
): Promise<SubtitleCue[]> {
  const langCode = language.startsWith("bn") ? "bn" : "en";
  const formData = new FormData();
  formData.append("file", file, "audio.wav");
  formData.append("model", model);
  formData.append("response_format", "verbose_json");
  formData.append("language", langCode);

  const headers = getOpenRouterHeaders(apiKey);

  const res = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const errorMsg =
      errorBody.error?.message ||
      `OpenRouter request failed with status ${res.status}. Please check your OpenRouter API key.`;
    throw new Error(errorMsg);
  }

  const data: WhisperApiResponse = await res.json();
  return mapWhisperResponseToCues(data);
}

/**
 * Uses OpenRouter LLMs (e.g. Gemini 2.5 Flash / Claude 3.5 / GPT-4o-mini)
 * to polish Bengali/English grammar, punctuation, or translate subtitle cues.
 */
export async function polishSubtitlesWithOpenRouter(
  cues: SubtitleCue[],
  apiKey: string,
  action: "polish" | "translate_to_bn" | "translate_to_en",
  model = OPENROUTER_DEFAULT_TEXT_MODEL,
): Promise<SubtitleCue[]> {
  if (cues.length === 0) return [];

  const headers = {
    ...getOpenRouterHeaders(apiKey),
    "Content-Type": "application/json",
  };

  const cueItems = cues.map((c) => ({
    id: c.id,
    start: c.start,
    end: c.end,
    text: c.text,
  }));

  let systemPrompt = "";
  if (action === "polish") {
    systemPrompt =
      "You are an expert bilingual subtitle editor. Correct grammar, spelling, and natural punctuation in the provided subtitles while preserving the exact Bengali or English language, timestamps, and JSON structure. Return ONLY a valid JSON array of objects with keys 'id', 'start', 'end', 'text'.";
  } else if (action === "translate_to_bn") {
    systemPrompt =
      "Translate each subtitle cue into natural, fluent Bengali (বাংলা). Preserve the exact 'id', 'start', and 'end' timing values. Return ONLY a valid JSON array of objects with keys 'id', 'start', 'end', 'text'.";
  } else {
    systemPrompt =
      "Translate each subtitle cue into clear, natural English. Preserve the exact 'id', 'start', and 'end' timing values. Return ONLY a valid JSON array of objects with keys 'id', 'start', 'end', 'text'.";
  }

  const userPrompt = `Here are the subtitle cues in JSON format:\n${JSON.stringify(cueItems, null, 2)}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message ||
        `OpenRouter completion failed with status ${res.status}.`,
    );
  }

  const completion = await res.json();
  const rawText = completion.choices?.[0]?.message?.content || "";

  // Extract JSON from response
  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not parse AI response into subtitle cues.");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: any, idx: number) => ({
        id: item.id || cues[idx]?.id || `cue-${idx + 1}`,
        start: typeof item.start === "number" ? item.start : cues[idx]?.start || 0,
        end: typeof item.end === "number" ? item.end : cues[idx]?.end || 3,
        text: String(item.text || "").trim(),
      }));
    }
  } catch (err) {
    throw new Error("Failed to decode AI-edited subtitle JSON.");
  }

  return cues;
}
