"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Upload,
  Mic,
  MicOff,
  FileAudio,
  Film,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Globe,
  FileText,
  AlertCircle,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type {
  ExportFormat,
  MediaFileState,
  SubtitleCue,
  TranscriptLanguage,
  TranscriptionProgress,
} from "../types";
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from "../utils/speech-recognition";
import {
  generateCsv,
  generateJson,
  generateSrt,
  generateTxt,
  generateVtt,
  parseSrt,
  parseVtt,
} from "../utils/subtitle-formats";
import {
  transcribeWithOpenRouter,
  polishSubtitlesWithOpenRouter,
} from "../utils/ai-transcriber";
import { decodeAudioFromVideo } from "@/features/video-to-audio/utils/audio-extractor";
import { encodeMp3FromChannels } from "@/features/video-to-audio/utils/mp3-encoder";
import { SubtitleVideoPlayer } from "./SubtitleVideoPlayer";
import { TranscriptEditor } from "./TranscriptEditor";
import { cn } from "@/lib/utils";

const LANGUAGES: Array<{ id: TranscriptLanguage; label: string; group: string }> = [
  { id: "bn-BD", label: "বাংলা (বাংলাদেশ - Bangladesh)", group: "Bangla" },
  { id: "bn-IN", label: "বাংলা (ভারত - West Bengal)", group: "Bangla" },
  { id: "en-US", label: "English (US)", group: "English" },
  { id: "en-GB", label: "English (UK)", group: "English" },
  { id: "en-IN", label: "English (Global / South Asia)", group: "English" },
];

const EXPORT_FORMATS: Array<{ id: ExportFormat; label: string; ext: string; desc: string }> = [
  { id: "srt", label: "SRT", ext: ".srt", desc: "YouTube, Premiere, DaVinci, VLC" },
  { id: "vtt", label: "WebVTT", ext: ".vtt", desc: "Web players, Reels, TikTok" },
  { id: "txt-time", label: "TXT (Timestamps)", ext: ".txt", desc: "Timestamped readable transcript" },
  { id: "txt-plain", label: "TXT (Plain)", ext: ".txt", desc: "Pure reading text without timestamps" },
  { id: "json", label: "JSON", ext: ".json", desc: "Structured data with timestamps" },
  { id: "csv", label: "CSV", ext: ".csv", desc: "Spreadsheet & Excel rows" },
];

const SAMPLE_BANGLA_CUES: SubtitleCue[] = [
  {
    id: "sample-1",
    start: 0.5,
    end: 3.8,
    text: "স্বাগতম! এটি একটি ভিডিও সাবটাইটেল এবং অডিও ট্রান্সক্রিপশন টুল।",
  },
  {
    id: "sample-2",
    start: 4.0,
    end: 7.5,
    text: "এখানে আপনি বাংলা এবং ইংরেজি উভয় ভাষায় অডিও ট্রান্সক্রিপ্ট তৈরি করতে পারেন।",
  },
  {
    id: "sample-3",
    start: 8.0,
    end: 11.2,
    text: "এসআরটি (SRT) বা ভিটিটি (VTT) ফরম্যাটে ডাউনলোড করে সহজে ভিডিওতে যুক্ত করুন।",
  },
];

export function AudioToTranscript() {
  // Media State
  const [media, setMedia] = useState<MediaFileState>({
    audioFile: null,
    videoFile: null,
    audioUrl: null,
    videoUrl: null,
    duration: 0,
    isVideo: false,
  });

  // Transcription & Cues
  const [cues, setCues] = useState<SubtitleCue[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<TranscriptLanguage>("bn-BD");
  const [activeCueIndex, setActiveCueIndex] = useState<number>(-1);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Engines & Progress
  const [isListening, setIsListening] = useState<boolean>(false);
  const [progress, setProgress] = useState<TranscriptionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI OpenRouter processing state
  const [isAiTranscribing, setIsAiTranscribing] = useState<boolean>(false);
  const [isPolishing, setIsPolishing] = useState<boolean>(false);

  // Export State
  const [selectedExportFormat, setSelectedExportFormat] = useState<ExportFormat>("srt");
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // References
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const subtitleFileInputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const recognizerRef = useRef<any>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (media.videoUrl) URL.revokeObjectURL(media.videoUrl);
      if (media.audioUrl) URL.revokeObjectURL(media.audioUrl);
      if (recognizerRef.current) recognizerRef.current.stop();
    };
  }, [media.videoUrl, media.audioUrl]);

  // Determine active cue based on current media time
  useEffect(() => {
    if (cues.length === 0) {
      setActiveCueIndex(-1);
      return;
    }
    const idx = cues.findIndex(
      (cue) => currentTime >= cue.start && currentTime <= cue.end,
    );
    setActiveCueIndex(idx);
  }, [currentTime, cues]);

  const handleMediaUpload = (file: File) => {
    if (!file) return;

    setError(null);
    setProgress(null);
    const isVideo = file.type.startsWith("video/") || Boolean(file.name.match(/\.(mp4|mov|webm|mkv|avi)$/i));
    const url = URL.createObjectURL(file);

    if (isVideo) {
      setMedia({
        audioFile: null,
        videoFile: file,
        audioUrl: null,
        videoUrl: url,
        duration: 0,
        isVideo: true,
      });
    } else {
      setMedia({
        audioFile: file,
        videoFile: null,
        audioUrl: url,
        videoUrl: null,
        duration: 0,
        isVideo: false,
      });
    }
  };

  const handleSubtitleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      let parsed: SubtitleCue[] = [];
      if (file.name.endsWith(".vtt")) {
        parsed = parseVtt(content);
      } else {
        parsed = parseSrt(content);
      }

      if (parsed.length > 0) {
        setCues(parsed);
      } else {
        setError("Could not parse subtitles from this file. Please verify it is a valid .srt or .vtt file.");
      }
    };
    reader.readAsText(file);
  };

  // Web Speech Recognition Controller
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
      setProgress(null);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setError("Web Speech API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or the AI Whisper option.");
      return;
    }

    setError(null);
    setIsListening(true);
    setProgress({
      status: "listening",
      message: `Listening in ${selectedLanguage.startsWith("bn") ? "Bangla" : "English"}... Play media or speak now.`,
    });

    const recognizer = createSpeechRecognizer(
      selectedLanguage,
      (item) => {
        if (!item.transcript.trim()) return;

        setCues((prev) => {
          if (!item.isFinal) {
            // Live interim feedback
            return prev;
          }

          // Append or merge new finalized chunk
          const newCue: SubtitleCue = {
            id: `cue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            start: Number(item.startTime.toFixed(3)),
            end: Number(item.endTime.toFixed(3)),
            text: item.transcript,
          };
          return [...prev, newCue];
        });
      },
      (err) => {
        setError(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
    );

    recognizerRef.current = recognizer;
    recognizer.start(() => playerRef.current?.currentTime || 0);

    // Auto-play media if loaded and paused
    if (playerRef.current && playerRef.current.paused) {
      playerRef.current.play().catch(() => {});
    }
  };

  // OpenRouter AI Speech-to-Text Execution (via Server Route with Vercel OPENROUTER_API_KEY)
  const handleRunOpenRouter = async () => {
    const fileToTranscribe = media.audioFile || media.videoFile;
    if (!fileToTranscribe) {
      setError("Please upload an audio or video file first.");
      return;
    }

    setIsAiTranscribing(true);
    setError(null);

    try {
      let audioPayload: File | Blob = fileToTranscribe;

      // If video, extract lightweight MP3 in browser first to prevent large upload
      if (media.isVideo && media.videoFile) {
        setProgress({
          status: "transcribing",
          message: "Extracting audio track from video...",
        });
        const audioBuffer = await decodeAudioFromVideo(media.videoFile);
        const numChannels = Math.min(2, audioBuffer.numberOfChannels) as 1 | 2;
        const channelsData: Float32Array[] = [];
        for (let c = 0; c < numChannels; c++) {
          channelsData.push(audioBuffer.getChannelData(c));
        }
        audioPayload = await encodeMp3FromChannels(channelsData, {
          sampleRate: audioBuffer.sampleRate,
          channels: numChannels,
          bitrate: 128,
        });
      }

      setProgress({
        status: "transcribing",
        message: `Transcribing audio via OpenRouter AI (${selectedLanguage.startsWith("bn") ? "বাংলা" : "English"})...`,
      });

      const resultCues = await transcribeWithOpenRouter(
        audioPayload,
        selectedLanguage,
      );

      if (resultCues.length > 0) {
        setCues(resultCues);
        setProgress({
          status: "complete",
          message: `OpenRouter transcription complete! ${resultCues.length} timestamped segments generated.`,
        });
      } else {
        setError("Transcription returned empty results.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "OpenRouter transcription failed.";
      setError(msg);
    } finally {
      setIsAiTranscribing(false);
    }
  };

  // OpenRouter AI Polish / Translation (via Server Route)
  const handlePolishSubtitles = async (action: "polish" | "translate_to_bn" | "translate_to_en") => {
    if (cues.length === 0) return;

    setIsPolishing(true);
    setError(null);
    const actionLabel =
      action === "polish"
        ? "Polishing subtitles with OpenRouter AI..."
        : action === "translate_to_bn"
          ? "Translating subtitles to Bengali (বাংলা) with OpenRouter..."
          : "Translating subtitles to English with OpenRouter...";

    setProgress({
      status: "transcribing",
      message: actionLabel,
    });

    try {
      const updated = await polishSubtitlesWithOpenRouter(cues, action);
      setCues(updated);
      setProgress({
        status: "complete",
        message: "Subtitles successfully updated with OpenRouter AI!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI operation failed.";
      setError(msg);
    } finally {
      setIsPolishing(false);
    }
  };

  // Seek handler
  const handleSeek = (time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = time;
      setCurrentTime(time);
      if (playerRef.current.paused) {
        playerRef.current.play().catch(() => {});
      }
    }
  };

  // Export & Download handlers
  const getExportContent = (fmt: ExportFormat): { content: string; mime: string; ext: string } => {
    switch (fmt) {
      case "srt":
        return { content: generateSrt(cues), mime: "text/plain", ext: "srt" };
      case "vtt":
        return { content: generateVtt(cues), mime: "text/vtt", ext: "vtt" };
      case "txt-time":
        return { content: generateTxt(cues, true), mime: "text/plain", ext: "txt" };
      case "txt-plain":
        return { content: generateTxt(cues, false), mime: "text/plain", ext: "txt" };
      case "json":
        return { content: generateJson(cues), mime: "application/json", ext: "json" };
      case "csv":
        return { content: generateCsv(cues), mime: "text/csv", ext: "csv" };
    }
  };

  const handleDownload = () => {
    const { content, mime, ext } = getExportContent(selectedExportFormat);
    if (!content.trim()) return;

    const baseName =
      (media.videoFile?.name || media.audioFile?.name || "transcript").replace(/\.[^/.]+$/, "");
    const filename = `${baseName}.${ext}`;

    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = async () => {
    const { content } = getExportContent(selectedExportFormat);
    if (!content.trim()) return;

    try {
      await navigator.clipboard.writeText(content);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleLoadSample = () => {
    setCues(SAMPLE_BANGLA_CUES);
    setSelectedLanguage("bn-BD");
  };

  const handleReset = () => {
    if (media.videoUrl) URL.revokeObjectURL(media.videoUrl);
    if (media.audioUrl) URL.revokeObjectURL(media.audioUrl);
    setMedia({
      audioFile: null,
      videoFile: null,
      audioUrl: null,
      videoUrl: null,
      duration: 0,
      isVideo: false,
    });
    setCues([]);
    setError(null);
    setProgress(null);
    setIsListening(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Upload Zone / Media Setup */}
      {!media.videoUrl && !media.audioUrl && (
        <Card className="p-8 sm:p-12 border-2 border-dashed rounded-2xl border-border hover:border-primary/60 transition-all text-center">
          <input
            ref={mediaFileInputRef}
            type="file"
            accept="audio/*,video/*,.mp4,.mov,.webm,.mkv,.avi,.mp3,.wav,.m4a,.ogg,.flac"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleMediaUpload(e.target.files[0]);
            }}
          />

          <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 ring-8 ring-primary/5">
            <Layers className="size-8" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
            Upload Audio or Video to Transcribe
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-5">
            Drop an audio file (MP3, WAV, M4A, OGG) or video file (MP4, WebM, MOV). Automatic timestamp generation for Bangla (বাংলা) and English.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => mediaFileInputRef.current?.click()}
              className="font-bold shadow-sm"
            >
              <Upload className="size-4 mr-2" />
              Upload Audio or Video
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadSample}
              className="font-medium text-xs sm:text-sm"
            >
              <Sparkles className="size-4 mr-1.5 text-primary" />
              Try Bangla Sample Cues
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <Badge variant="outline" className="text-xs">
              বাংলা (Bangla)
            </Badge>
            <Badge variant="outline" className="text-xs">
              English
            </Badge>
            <Badge variant="outline" className="text-xs">
              SRT & VTT Subtitles
            </Badge>
            <Badge variant="outline" className="text-xs">
              100% In-Browser
            </Badge>
          </div>
        </Card>
      )}

      {/* Main Studio Workspace */}
      {(media.videoUrl || media.audioUrl || cues.length > 0) && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Control Bar: Language, Actions, Subtitle File Import */}
          <Card className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-primary shrink-0" />
                <Label className="text-xs font-semibold text-foreground whitespace-nowrap">
                  Language:
                </Label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as TranscriptLanguage)}
                  className="h-8 text-xs font-medium rounded-lg border border-border bg-card px-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Media */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground h-8"
              >
                <RotateCcw className="size-3.5 mr-1" />
                Reset
              </Button>
            </div>

            {/* Quick Actions (Mic recognition, AI Whisper, Import) */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={subtitleFileInputRef}
                type="file"
                accept=".srt,.vtt,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleSubtitleFileUpload(e.target.files[0]);
                }}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => subtitleFileInputRef.current?.click()}
                className="text-xs h-8"
              >
                <FileText className="size-3.5 mr-1" />
                Import SRT/VTT
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRunOpenRouter}
                disabled={isAiTranscribing || isListening}
                className="text-xs h-8 text-primary border-primary/30 hover:bg-primary/5 font-semibold"
              >
                <Sparkles className={cn("size-3.5 mr-1 text-primary", isAiTranscribing && "animate-spin")} />
                {isAiTranscribing ? "Transcribing with AI..." : "AI Transcribe (OpenRouter)"}
              </Button>

              <Button
                size="sm"
                onClick={toggleSpeechRecognition}
                className={cn(
                  "text-xs font-bold h-8 transition-all",
                  isListening
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : "bg-primary text-primary-foreground",
                )}
              >
                {isListening ? (
                  <>
                    <MicOff className="size-3.5 mr-1" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="size-3.5 mr-1" />
                    Live Speech-to-Text
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* OpenRouter AI Subtitle Actions Bar */}
          {cues.length > 0 && (
            <Card className="p-3.5 sm:p-4 rounded-xl border border-primary/20 bg-primary/5 shadow-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    OpenRouter AI Subtitle Actions
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    One-click bilingual grammar polishing and translations powered by OpenRouter
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPolishing}
                  onClick={() => handlePolishSubtitles("polish")}
                  className="text-xs h-7.5 bg-card shadow-xs"
                >
                  <Sparkles className={cn("size-3.5 mr-1 text-primary", isPolishing && "animate-spin")} />
                  {isPolishing ? "Polishing..." : "✨ Polish Grammar & Punctuation"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPolishing}
                  onClick={() =>
                    handlePolishSubtitles(
                      selectedLanguage.startsWith("bn") ? "translate_to_en" : "translate_to_bn",
                    )
                  }
                  className="text-xs h-7.5 bg-card shadow-xs"
                >
                  <Globe className="size-3.5 mr-1 text-primary" />
                  {isPolishing
                    ? "Translating..."
                    : selectedLanguage.startsWith("bn")
                      ? "Translate to English"
                      : "Translate to বাংলা"}
                </Button>
              </div>
            </Card>
          )}

          {/* Feedback & Status Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {progress && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center justify-between font-medium">
              <span>{progress.message}</span>
              {isListening && (
                <span className="flex items-center gap-1.5 text-destructive font-bold">
                  <span className="size-2 rounded-full bg-destructive animate-ping" />
                  RECORDING
                </span>
              )}
            </div>
          )}

          {/* Dual Panel Workspace: Video Player & Subtitle Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: Video / Audio Player with Live Captions */}
            <div className="space-y-4">
              <SubtitleVideoPlayer
                mediaUrl={media.videoUrl || media.audioUrl}
                isVideo={media.isVideo}
                cues={cues}
                activeCueIndex={activeCueIndex}
                onTimeUpdate={(t) => setCurrentTime(t)}
                playerRef={playerRef}
              />

              {/* If audio was uploaded, allow attaching video for preview */}
              {!media.isVideo && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Have a video for this audio?
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    id="attach-video-input"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        setMedia((prev) => ({
                          ...prev,
                          videoFile: file,
                          videoUrl: URL.createObjectURL(file),
                          isVideo: true,
                        }));
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("attach-video-input")?.click()}
                    className="text-xs h-7"
                  >
                    <Film className="size-3 mr-1" />
                    Attach Video
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Interactive Subtitle Editor */}
            <div>
              <TranscriptEditor
                cues={cues}
                activeCueIndex={activeCueIndex}
                onUpdateCues={(updated) => setCues(updated)}
                onSeek={handleSeek}
                currentTime={currentTime}
              />
            </div>
          </div>

          {/* Export & Download Hub */}
          {cues.length > 0 && (
            <Card className="p-5 sm:p-6 rounded-2xl border-2 border-primary/20 bg-card shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-1.5">
                    <Download className="size-4 text-primary" />
                    Download & Export Transcripts
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Save your synchronized captions with millisecond timestamp accuracy
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {cues.length} segments ready
                </Badge>
              </div>

              {/* Format Selection Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {EXPORT_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedExportFormat(fmt.id)}
                    className={cn(
                      "p-2.5 rounded-xl border text-center transition-all text-xs flex flex-col items-center justify-center gap-0.5",
                      selectedExportFormat === fmt.id
                        ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                        : "border-border bg-card text-foreground hover:border-primary/40",
                    )}
                  >
                    <span>{fmt.label}</span>
                    <span className="text-[10px] opacity-75">{fmt.ext}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons: Download & Copy */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="w-full sm:flex-1 font-bold h-11"
                >
                  <Download className="size-4 mr-2" />
                  Download {selectedExportFormat.toUpperCase()} ({cues.length} cues)
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCopyClipboard}
                  className="w-full sm:w-auto font-medium h-11 text-xs sm:text-sm"
                >
                  {hasCopied ? (
                    <>
                      <Check className="size-4 mr-1.5 text-primary" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4 mr-1.5" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
