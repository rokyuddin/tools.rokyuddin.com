import type { SubtitleCue, WordTimestamp } from "../types";

export interface SmartChunkOptions {
  /** Maximum duration in seconds for a single subtitle cue (default: 4.0) */
  maxDuration?: number;
  /** Minimum duration in seconds for a single subtitle cue (default: 1.0) */
  minDuration?: number;
  /** Maximum number of words in a single subtitle cue (default: 8) */
  maxWords?: number;
  /** Maximum number of characters in a single subtitle cue (default: 42) */
  maxChars?: number;
  /** Silence gap in seconds between words to force a cue break (default: 0.55) */
  pauseThreshold?: number;
}

/**
 * Filter out typical Whisper hallucinations and noise tokens on background music/silence.
 */
export function filterWhisperHallucinations(words: WordTimestamp[]): WordTimestamp[] {
  if (!words || words.length === 0) return [];

  const noiseTokenRegex = /^[\[(]?(music|applause|laughter|screaming|cheering|coughing|instrumental)[\])]?$/i;
  const filtered: WordTimestamp[] = [];
  let consecutiveRepeatCount = 0;
  let lastWordText = "";

  for (const item of words) {
    const rawWord = item.word?.trim() || "";
    if (!rawWord) continue;

    // Filter bracketed noise tokens like [Music] or (applause)
    if (noiseTokenRegex.test(rawWord.toLowerCase())) {
      continue;
    }

    const normalized = rawWord.toLowerCase().replace(/[^a-zA-Z\u0980-\u09FF]/g, "");

    if (normalized && normalized === lastWordText) {
      consecutiveRepeatCount++;
      // If the exact same word repeats more than 3 times consecutively, it is a Whisper loop hallucination
      if (consecutiveRepeatCount >= 3) {
        continue;
      }
    } else {
      consecutiveRepeatCount = 1;
      lastWordText = normalized;
    }

    filtered.push({
      word: rawWord,
      start: Number(item.start.toFixed(3)),
      end: Number(Math.max(item.start + 0.1, item.end).toFixed(3)),
      confidence: item.confidence,
    });
  }

  return filtered;
}

/**
 * Smart Subtitle Chunker: ElevenLabs-style algorithm to group word-level tokens into
 * human-readable, balanced subtitle cues with word timings.
 */
export function smartChunkWordsToCues(
  words: WordTimestamp[],
  options: SmartChunkOptions = {},
): SubtitleCue[] {
  const {
    maxDuration = 4.0,
    minDuration = 0.8,
    maxWords = 8,
    maxChars = 40,
    pauseThreshold = 0.55,
  } = options;

  const cleanedWords = filterWhisperHallucinations(words);
  if (cleanedWords.length === 0) return [];

  const cues: SubtitleCue[] = [];
  let currentWords: WordTimestamp[] = [];
  let currentText = "";
  let cueStartTime = cleanedWords[0].start;

  // Bengali and English sentence terminators
  const sentenceEndRegex = /[.?!।\n]$/;

  for (let i = 0; i < cleanedWords.length; i++) {
    const wordObj = cleanedWords[i];
    const prevWord = currentWords[currentWords.length - 1];

    const currentDuration = wordObj.end - cueStartTime;
    const prospectiveText = currentText ? `${currentText} ${wordObj.word}` : wordObj.word;
    const isPause = prevWord && wordObj.start - prevWord.end >= pauseThreshold;
    const prevEndedSentence = prevWord && sentenceEndRegex.test(prevWord.word.trim());
    const exceedsMaxDuration = currentDuration >= maxDuration;
    const exceedsMaxWords = currentWords.length >= maxWords;
    const exceedsMaxChars = prospectiveText.length >= maxChars;

    // Trigger cue boundary if any constraint met and we have at least one word
    const shouldBreak =
      currentWords.length > 0 &&
      (isPause ||
        prevEndedSentence ||
        exceedsMaxDuration ||
        (exceedsMaxWords && currentDuration >= minDuration) ||
        (exceedsMaxChars && currentDuration >= minDuration));

    if (shouldBreak) {
      const cueEnd = prevWord ? prevWord.end : wordObj.start;
      cues.push({
        id: `cue-${cues.length + 1}`,
        start: Number(cueStartTime.toFixed(3)),
        end: Number(Math.max(cueStartTime + minDuration, cueEnd).toFixed(3)),
        text: currentText.trim(),
        words: [...currentWords],
      });

      // Start fresh cue
      currentWords = [wordObj];
      currentText = wordObj.word;
      cueStartTime = wordObj.start;
    } else {
      currentWords.push(wordObj);
      currentText = prospectiveText;
    }
  }

  // Push remaining words
  if (currentWords.length > 0) {
    const lastWord = currentWords[currentWords.length - 1];
    cues.push({
      id: `cue-${cues.length + 1}`,
      start: Number(cueStartTime.toFixed(3)),
      end: Number(Math.max(cueStartTime + minDuration, lastWord.end).toFixed(3)),
      text: currentText.trim(),
      words: [...currentWords],
    });
  }

  return cues;
}
