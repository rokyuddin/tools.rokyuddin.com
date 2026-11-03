"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Film,
  Music,
  Settings,
} from "lucide-react";
import type { SubtitleCue } from "../types";
import { formatDisplayTimestamp } from "../utils/subtitle-formats";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubtitleVideoPlayerProps {
  mediaUrl: string | null;
  isVideo: boolean;
  cues: SubtitleCue[];
  activeCueIndex: number;
  onTimeUpdate: (currentTime: number) => void;
  onSeekRequest?: (time: number) => void;
  playerRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
}

export function SubtitleVideoPlayer({
  mediaUrl,
  isVideo,
  cues,
  activeCueIndex,
  onTimeUpdate,
  playerRef,
}: SubtitleVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [showSubtitleOptions, setShowSubtitleOptions] = useState(false);

  const activeCue = activeCueIndex >= 0 && activeCueIndex < cues.length ? cues[activeCueIndex] : null;

  const handleTimeUpdate = () => {
    const el = playerRef.current;
    if (!el) return;
    const t = el.currentTime;
    setCurrentTime(t);
    onTimeUpdate(t);
  };

  const handleLoadedMetadata = () => {
    const el = playerRef.current;
    if (!el) return;
    setDuration(el.duration || 0);
  };

  const togglePlay = () => {
    const el = playerRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value);
    const el = playerRef.current;
    if (el) {
      el.currentTime = newTime;
      setCurrentTime(newTime);
      onTimeUpdate(newTime);
    }
  };

  if (!mediaUrl) {
    return null;
  }

  const fontSizeClass = {
    sm: "text-xs sm:text-sm",
    base: "text-sm sm:text-base",
    lg: "text-base sm:text-lg",
    xl: "text-lg sm:text-xl",
  }[fontSize];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-black/95 shadow-lg group">
      {/* Video or Audio Element */}
      <div className="relative aspect-video max-h-[380px] w-full flex items-center justify-center bg-zinc-950">
        {isVideo ? (
          <video
            ref={playerRef as React.RefObject<HTMLVideoElement>}
            src={mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-400">
            <audio
              ref={playerRef as React.RefObject<HTMLAudioElement>}
              src={mediaUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="size-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-3">
              <Music className="size-8" />
            </div>
            <p className="text-sm font-medium text-zinc-200">Audio Track Loaded</p>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              {formatDisplayTimestamp(currentTime)} / {formatDisplayTimestamp(duration)}
            </p>
          </div>
        )}

        {/* Live Subtitle Overlay on Top of Video */}
        {activeCue && (
          <div className="absolute bottom-8 left-4 right-4 flex justify-center pointer-events-none z-10 px-4">
            <div
              className={cn(
                "bg-black/85 text-white font-medium px-4 py-2 rounded-xl backdrop-blur-xs text-center max-w-xl shadow-lg border border-white/10 leading-relaxed transition-all duration-150",
                fontSizeClass,
              )}
            >
              {activeCue.text}
            </div>
          </div>
        )}
      </div>

      {/* Media Controls Bar */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800 text-white flex flex-col gap-2">
        {/* Timeline Slider */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[11px] font-mono text-zinc-400 min-w-10">
            {formatDisplayTimestamp(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-[11px] font-mono text-zinc-400 min-w-10 text-right">
            {formatDisplayTimestamp(duration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-zinc-800 size-8 p-0 rounded-lg"
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
            </Button>

            <span className="text-xs text-zinc-400 font-medium">
              {activeCue ? (
                <span className="text-primary truncate max-w-[200px] sm:max-w-xs inline-block">
                  {activeCue.text}
                </span>
              ) : (
                "No active caption"
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSubtitleOptions(!showSubtitleOptions)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 size-8 p-0 rounded-lg"
              title="Subtitle font size"
            >
              <Settings className="size-3.5" />
            </Button>

            {showSubtitleOptions && (
              <div className="absolute right-0 bottom-10 p-2 rounded-xl bg-zinc-800 border border-zinc-700 shadow-xl flex gap-1 z-20">
                {(["sm", "base", "lg", "xl"] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      setFontSize(sz);
                      setShowSubtitleOptions(false);
                    }}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md uppercase font-semibold transition-all",
                      fontSize === sz
                        ? "bg-primary text-primary-foreground"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-700",
                    )}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
