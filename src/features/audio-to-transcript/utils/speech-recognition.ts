import type { SubtitleCue, TranscriptLanguage } from "../types";

export interface SpeechRecognitionResultItem {
  transcript: string;
  isFinal: boolean;
  startTime: number;
  endTime: number;
}

export interface SpeechRecognitionController {
  start: (getCurrentMediaTime: () => number) => void;
  stop: () => void;
  isSupported: boolean;
}

// Window type extension for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as unknown as IWindow;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Creates a SpeechRecognition instance calibrated for Bangla or English.
 */
export function createSpeechRecognizer(
  language: TranscriptLanguage,
  onResult: (item: SpeechRecognitionResultItem) => void,
  onError?: (error: string) => void,
  onEnd?: () => void,
): SpeechRecognitionController {
  if (!isSpeechRecognitionSupported()) {
    return {
      start: () => {},
      stop: () => {},
      isSupported: false,
    };
  }

  const win = window as unknown as IWindow;
  const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionConstructor();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = language;
  recognition.maxAlternatives = 1;

  let isRunning = false;
  let activeStartTime = 0;
  let getCurrentTimeFn: () => number = () => 0;

  recognition.onstart = () => {
    isRunning = true;
  };

  recognition.onresult = (event: any) => {
    const results = event.results;
    for (let i = event.resultIndex; i < results.length; i++) {
      const res = results[i];
      const text = res[0]?.transcript?.trim();
      const isFinal = res.isFinal;

      if (!text) continue;

      const currentMediaTime = getCurrentTimeFn();
      // Estimate reasonable start and end time
      const endTime = Math.max(activeStartTime + 0.8, currentMediaTime);
      const startTime = Math.max(0, activeStartTime);

      onResult({
        transcript: text,
        isFinal,
        startTime,
        endTime,
      });

      if (isFinal) {
        // Advance segment start window for subsequent words
        activeStartTime = currentMediaTime;
      }
    }
  };

  recognition.onerror = (event: any) => {
    // Some browsers fire 'no-speech' or 'aborted' on silence, which is normal
    if (event.error === "no-speech" || event.error === "aborted") return;
    onError?.(`Speech recognition error: ${event.error || "unknown"}`);
  };

  recognition.onend = () => {
    if (isRunning) {
      // Auto-restart if user hasn't explicitly stopped it
      try {
        recognition.start();
      } catch {
        isRunning = false;
        onEnd?.();
      }
    } else {
      onEnd?.();
    }
  };

  return {
    isSupported: true,
    start: (getCurrentMediaTime: () => number) => {
      getCurrentTimeFn = getCurrentMediaTime;
      activeStartTime = getCurrentMediaTime();
      isRunning = true;
      try {
        recognition.start();
      } catch {
        // Already started
      }
    },
    stop: () => {
      isRunning = false;
      try {
        recognition.stop();
      } catch {}
    },
  };
}
