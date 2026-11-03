import type { SubtitleCue } from "../types/index.ts";

/**
 * Formats seconds into standard SRT timestamp format: HH:MM:SS,mmm
 */
export function formatSrtTimestamp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Number.isNaN(totalSeconds) ? 0 : totalSeconds);
  const totalMs = Math.round(safeSeconds * 1000);
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;

  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  const mmm = milliseconds.toString().padStart(3, "0");

  return `${hh}:${mm}:${ss},${mmm}`;
}

/**
 * Formats seconds into standard WebVTT timestamp format: HH:MM:SS.mmm
 */
export function formatVttTimestamp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Number.isNaN(totalSeconds) ? 0 : totalSeconds);
  const totalMs = Math.round(safeSeconds * 1000);
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;

  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  const mmm = milliseconds.toString().padStart(3, "0");

  return `${hh}:${mm}:${ss}.${mmm}`;
}

/**
 * Formats seconds into human-readable compact display: MM:SS or HH:MM:SS
 */
export function formatDisplayTimestamp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Number.isNaN(totalSeconds) ? 0 : totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);

  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Parses timestamp string (SRT or VTT) to float seconds.
 * Supports:
 * - "00:01:23,456"
 * - "00:01:23.456"
 * - "01:23.456"
 * - "01:23"
 */
export function parseTimestamp(timeString: string): number {
  if (!timeString || typeof timeString !== "string") return 0;
  const cleaned = timeString.trim().replace(",", ".");
  const parts = cleaned.split(":");

  if (parts.length === 3) {
    const hours = Number.parseFloat(parts[0]) || 0;
    const minutes = Number.parseFloat(parts[1]) || 0;
    const seconds = Number.parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length === 2) {
    const minutes = Number.parseFloat(parts[0]) || 0;
    const seconds = Number.parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  }

  const direct = Number.parseFloat(cleaned);
  return Number.isNaN(direct) ? 0 : direct;
}

/**
 * Generates an SRT (SubRip) subtitle formatted string.
 */
export function generateSrt(cues: SubtitleCue[]): string {
  if (!cues || cues.length === 0) return "";

  return cues
    .map((cue, index) => {
      const startStr = formatSrtTimestamp(cue.start);
      const endStr = formatSrtTimestamp(cue.end);
      const cleanText = cue.text.trim();
      return `${index + 1}\n${startStr} --> ${endStr}\n${cleanText}\n`;
    })
    .join("\n");
}

/**
 * Generates a WebVTT (.vtt) formatted string.
 */
export function generateVtt(cues: SubtitleCue[]): string {
  const header = "WEBVTT\n\n";
  if (!cues || cues.length === 0) return header;

  const body = cues
    .map((cue) => {
      const startStr = formatVttTimestamp(cue.start);
      const endStr = formatVttTimestamp(cue.end);
      const cleanText = cue.text.trim();
      return `${startStr} --> ${endStr}\n${cleanText}\n`;
    })
    .join("\n");

  return header + body;
}

/**
 * Generates plain text or timestamped text transcript.
 */
export function generateTxt(cues: SubtitleCue[], includeTimestamps = false): string {
  if (!cues || cues.length === 0) return "";

  if (includeTimestamps) {
    return cues
      .map((cue) => {
        const start = formatDisplayTimestamp(cue.start);
        const end = formatDisplayTimestamp(cue.end);
        return `[${start} - ${end}] ${cue.text.trim()}`;
      })
      .join("\n");
  }

  return cues
    .map((cue) => cue.text.trim())
    .filter(Boolean)
    .join("\n");
}

/**
 * Generates structured JSON formatted string.
 */
export function generateJson(cues: SubtitleCue[]): string {
  const structured = cues.map((cue, idx) => ({
    index: idx + 1,
    id: cue.id,
    start: cue.start,
    end: cue.end,
    duration: Number((cue.end - cue.start).toFixed(3)),
    startTime: formatSrtTimestamp(cue.start),
    endTime: formatSrtTimestamp(cue.end),
    text: cue.text.trim(),
  }));

  return JSON.stringify(structured, null, 2);
}

/**
 * Generates CSV formatted string.
 */
export function generateCsv(cues: SubtitleCue[]): string {
  const header = "Index,Start Time,End Time,Duration (sec),Text\n";
  if (!cues || cues.length === 0) return header;

  const rows = cues.map((cue, idx) => {
    const index = idx + 1;
    const start = formatSrtTimestamp(cue.start);
    const end = formatSrtTimestamp(cue.end);
    const duration = (cue.end - cue.start).toFixed(2);
    // Escape double quotes in CSV
    const escapedText = `"${cue.text.replace(/"/g, '""').trim()}"`;
    return `${index},${start},${end},${duration},${escapedText}`;
  });

  return header + rows.join("\n");
}

/**
 * Parses an SRT string into SubtitleCue array.
 */
export function parseSrt(srtContent: string): SubtitleCue[] {
  if (!srtContent || typeof srtContent !== "string") return [];

  // Normalize line breaks
  const normalized = srtContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.trim().split(/\n\s*\n/);
  const cues: SubtitleCue[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    const lines = block.split("\n");
    if (lines.length < 2) continue;

    // Line 0 is often the index number, line 1 has the timing: 00:00:01,000 --> 00:00:04,000
    // Sometimes index is omitted, so search for line with "-->"
    let timeLineIdx = -1;
    for (let l = 0; l < lines.length; l++) {
      if (lines[l].includes("-->")) {
        timeLineIdx = l;
        break;
      }
    }

    if (timeLineIdx === -1) continue;

    const timeParts = lines[timeLineIdx].split("-->");
    if (timeParts.length < 2) continue;

    const start = parseTimestamp(timeParts[0]);
    const end = parseTimestamp(timeParts[1]);
    const textLines = lines.slice(timeLineIdx + 1);
    const text = textLines.join(" ").replace(/<[^>]*>/g, "").trim();

    if (text) {
      cues.push({
        id: `cue-${cues.length + 1}-${Math.random().toString(36).substring(2, 7)}`,
        start,
        end: Math.max(start + 0.5, end),
        text,
      });
    }
  }

  return cues;
}

/**
 * Parses a WebVTT string into SubtitleCue array.
 */
export function parseVtt(vttContent: string): SubtitleCue[] {
  if (!vttContent || typeof vttContent !== "string") return [];

  // Remove WEBVTT header and normalize
  const cleaned = vttContent
    .replace(/^WEBVTT[^\n]*\n+/i, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  return parseSrt(cleaned);
}

export interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface WhisperApiResponse {
  text: string;
  segments?: WhisperSegment[];
}

/**
 * Maps standard Whisper verbose_json segments to SubtitleCue[]
 */
export function mapWhisperResponseToCues(data: WhisperApiResponse): SubtitleCue[] {
  if (data.segments && Array.isArray(data.segments) && data.segments.length > 0) {
    return data.segments
      .filter((s) => s.text && s.text.trim().length > 0)
      .map((s, idx) => ({
        id: `cue-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
        start: Number(s.start.toFixed(3)),
        end: Number(Math.max(s.start + 0.5, s.end).toFixed(3)),
        text: s.text.trim(),
      }));
  }

  // Fallback if no segments provided: split full text by punctuation or sentences
  if (data.text) {
    const sentences = data.text
      .split(/(?<=[.?!।\n])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const estDurationPerSentence = 3.5;
    return sentences.map((sentence, idx) => ({
      id: `cue-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
      start: idx * estDurationPerSentence,
      end: (idx + 1) * estDurationPerSentence,
      text: sentence,
    }));
  }

  return [];
}
