"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Music,
  Film,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Check,
  AlertCircle,
  FileAudio,
  Scissors,
  Volume2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AudioFormat,
  type BitrateOption,
  type ExtractedAudioResult,
  type ExtractionOptions,
  type ExtractionProgress,
  type VideoMetadata,
} from "../types";
import {
  decodeAudioFromVideo,
  convertAudioBufferToFormat,
  extractVideoMetadata,
  formatFileSize,
  formatTimeDisplay,
} from "../utils/audio-extractor";
import { cn } from "@/lib/utils";

const FORMAT_OPTIONS: Array<{
  id: AudioFormat;
  label: string;
  ext: string;
  desc: string;
  badge?: string;
}> = [
  {
    id: "mp3",
    label: "MP3",
    ext: ".mp3",
    desc: "Universal compatibility for all players, phones & cars",
    badge: "Most Popular",
  },
  {
    id: "wav",
    label: "WAV",
    ext: ".wav",
    desc: "Uncompressed 16-bit PCM lossless master studio audio",
    badge: "Lossless",
  },
  {
    id: "aac",
    label: "AAC / M4A",
    ext: ".m4a",
    desc: "High-efficiency Apple & mobile friendly format",
  },
  {
    id: "ogg",
    label: "OGG / WebM",
    ext: ".ogg",
    desc: "Next-gen Opus codec with optimal compression",
  },
];

const BITRATE_OPTIONS: BitrateOption[] = [128, 192, 256, 320];

export function VideoToAudio() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [decodedBuffer, setDecodedBuffer] = useState<AudioBuffer | null>(null);

  // Settings
  const [selectedFormat, setSelectedFormat] = useState<AudioFormat>("mp3");
  const [selectedBitrate, setSelectedBitrate] = useState<BitrateOption>(192);
  const [channels, setChannels] = useState<1 | 2>(2);
  const [trimEnabled, setTrimEnabled] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractedAudioResult | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [videoUrl, result]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|mov|webm|mkv|avi|flv|wmv|m4v)$/i)) {
      setError("Please select a valid video file (.mp4, .mov, .webm, .mkv, .avi, etc.)");
      return;
    }

    setError(null);
    setResult(null);
    setProgress(null);
    setDecodedBuffer(null);

    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const newUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(newUrl);

    try {
      const meta = await extractVideoMetadata(file);
      setMetadata(meta);
      setStartTime(0);
      setEndTime(meta.duration || 60);
    } catch {
      setMetadata({
        name: file.name,
        size: file.size,
        type: file.type,
        duration: 0,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleExtractAudio = async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    setError(null);
    setProgress({
      stage: "decoding",
      percentage: 10,
      message: "Starting audio extraction...",
    });

    try {
      // 1. Decode AudioBuffer if not already decoded
      let buffer = decodedBuffer;
      if (!buffer) {
        buffer = await decodeAudioFromVideo(videoFile, (p) => setProgress(p));
        setDecodedBuffer(buffer);
      }

      // 2. Convert AudioBuffer to selected format
      const options: ExtractionOptions = {
        format: selectedFormat,
        bitrate: selectedBitrate,
        channels,
        sampleRate: buffer.sampleRate,
        trim: {
          enabled: trimEnabled,
          startTime,
          endTime: endTime > startTime ? endTime : buffer.duration,
        },
      };

      const extracted = await convertAudioBufferToFormat(
        buffer,
        videoFile.name,
        options,
        (p) => setProgress(p),
      );

      setResult(extracted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during audio extraction.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (result?.url) URL.revokeObjectURL(result.url);
    setVideoFile(null);
    setVideoUrl(null);
    setMetadata(null);
    setDecodedBuffer(null);
    setResult(null);
    setProgress(null);
    setError(null);
    setTrimEnabled(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Box / Drag & Drop */}
      {!videoFile && (
        <Card
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 text-center",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/60 hover:bg-muted/40",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.mov,.webm,.mkv,.avi,.wmv,.flv,.m4v"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
            }}
          />

          <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 ring-8 ring-primary/5">
            <Film className="size-8" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mb-1">
            Drop your video here, or <span className="text-primary underline">browse</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Supports MP4, WebM, MOV, MKV, AVI, and other standard formats. Processed 100% locally in your browser.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="text-xs">
              MP4
            </Badge>
            <Badge variant="outline" className="text-xs">
              MOV / Apple
            </Badge>
            <Badge variant="outline" className="text-xs">
              WebM
            </Badge>
            <Badge variant="outline" className="text-xs">
              MKV
            </Badge>
            <Badge variant="outline" className="text-xs">
              100% Private
            </Badge>
          </div>
        </Card>
      )}

      {/* Main Workspace when Video is Selected */}
      {videoFile && (
        <div className="space-y-6 animate-fade-in">
          {/* Video Overview Card */}
          <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Film className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                    {videoFile.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{formatFileSize(videoFile.size)}</span>
                    {metadata?.duration ? (
                      <>
                        <span>•</span>
                        <span>{formatTimeDisplay(metadata.duration)}</span>
                      </>
                    ) : null}
                    {metadata?.videoWidth ? (
                      <>
                        <span>•</span>
                        <span>
                          {metadata.videoWidth}×{metadata.videoHeight}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground shrink-0"
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                Choose Another Video
              </Button>
            </div>

            {/* Video Player Preview */}
            {videoUrl && (
              <div className="mt-4 rounded-xl overflow-hidden bg-black/90 aspect-video max-h-64 flex items-center justify-center">
                <video
                  ref={videoPlayerRef}
                  src={videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </Card>

          {/* Extraction Settings Card */}
          <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card space-y-6 shadow-xs">
            {/* Format Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Music className="size-4 text-primary" />
                  Output Audio Format
                </Label>
                <span className="text-xs text-muted-foreground">
                  Select your desired audio encoding
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={cn(
                      "flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150 relative",
                      selectedFormat === fmt.id
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                        : "border-border/80 hover:border-primary/40 hover:bg-muted/30",
                    )}
                  >
                    {fmt.badge && (
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                        {fmt.badge}
                      </span>
                    )}
                    <span className="font-bold text-sm text-foreground">
                      {fmt.label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 leading-snug">
                      {fmt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* MP3 Bitrate Presets (if MP3 selected) */}
            {selectedFormat === "mp3" && (
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sliders className="size-3.5 text-primary" />
                    MP3 Bitrate (Audio Quality)
                  </Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedBitrate} kbps
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {BITRATE_OPTIONS.map((kbps) => (
                    <button
                      key={kbps}
                      type="button"
                      onClick={() => setSelectedBitrate(kbps)}
                      className={cn(
                        "py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all",
                        selectedBitrate === kbps
                          ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "border-border bg-card hover:border-border/80 text-foreground",
                      )}
                    >
                      {kbps} kbps
                      <span className="block text-[10px] opacity-80 mt-0.5">
                        {kbps === 128
                          ? "Smaller"
                          : kbps === 192
                            ? "Standard"
                            : kbps === 256
                              ? "High"
                              : "Maximum"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Channels & Trim Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
              {/* Channels (Stereo / Mono) */}
              <div>
                <Label className="text-xs font-semibold text-foreground mb-2 block">
                  Audio Channels
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannels(2)}
                    className={cn(
                      "py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all",
                      channels === 2
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Stereo (2 Channels)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannels(1)}
                    className={cn(
                      "py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all",
                      channels === 1
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Mono (1 Channel)
                  </button>
                </div>
              </div>

              {/* Optional Trimming Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Scissors className="size-3.5 text-primary" />
                    Trim Audio Range
                  </Label>
                  <button
                    type="button"
                    onClick={() => setTrimEnabled(!trimEnabled)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-md font-medium transition-all",
                      trimEnabled
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {trimEnabled ? "Trimming Active" : "Full Duration"}
                  </button>
                </div>

                {trimEnabled && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label className="text-[10px] text-muted-foreground mb-1 block">
                        Start (sec)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={metadata?.duration || 3600}
                        step={0.5}
                        value={startTime}
                        onChange={(e) => setStartTime(Number(e.target.value))}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <span className="text-muted-foreground text-xs mt-4">to</span>
                    <div className="flex-1">
                      <Label className="text-[10px] text-muted-foreground mb-1 block">
                        End (sec)
                      </Label>
                      <Input
                        type="number"
                        min={startTime + 0.1}
                        max={metadata?.duration || 3600}
                        step={0.5}
                        value={endTime}
                        onChange={(e) => setEndTime(Number(e.target.value))}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Extraction Failed</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Progress Bar during Extraction */}
            {isProcessing && progress && (
              <div className="p-4 rounded-xl bg-muted/60 border border-border/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{progress.message}</span>
                  <span className="font-mono font-bold text-primary">{progress.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <Button
              size="lg"
              onClick={handleExtractAudio}
              disabled={isProcessing}
              className="w-full font-bold shadow-md h-12 text-sm sm:text-base cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Extracting Audio...
                </>
              ) : (
                <>
                  <Music className="size-4 mr-2" />
                  Extract Audio ({selectedFormat.toUpperCase()})
                </>
              )}
            </Button>
          </Card>

          {/* Results Card */}
          {result && (
            <Card className="p-5 sm:p-6 rounded-2xl border-2 border-primary/30 bg-card shadow-md space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Check className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm sm:text-base">
                      Audio Extracted Successfully!
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {result.filename} • {formatFileSize(result.size)} • {formatTimeDisplay(result.duration)}
                    </p>
                  </div>
                </div>

                <Badge variant="secondary" className="font-mono text-xs uppercase font-bold">
                  {result.format}
                </Badge>
              </div>

              {/* Audio Preview Player */}
              <div className="p-3 rounded-xl bg-muted/50 border border-border/60">
                <audio
                  ref={audioPlayerRef}
                  src={result.url}
                  controls
                  className="w-full h-10"
                />
              </div>

              {/* Download & Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={result.url}
                  download={result.filename}
                  className="w-full sm:flex-1"
                >
                  <Button
                    size="lg"
                    className="w-full font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm h-11"
                  >
                    <Download className="size-4 mr-2" />
                    Download {result.format.toUpperCase()} ({formatFileSize(result.size)})
                  </Button>
                </a>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="w-full sm:w-auto h-11 text-xs sm:text-sm"
                >
                  <RotateCcw className="size-4 mr-1.5" />
                  Convert Another
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
