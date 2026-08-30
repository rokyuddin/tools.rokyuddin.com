"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Link as LinkIcon,
  AlertCircle,
  Play,
  RotateCcw,
  Film,
  Music,
  ExternalLink,
  ClipboardPaste,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  SUPPORTED_PLATFORMS,
  detectPlatformFromUrl,
} from "../utils/url-detector";
import type { ReelApiResponse, SocialPlatform, VideoDownloadItem } from "../types";
import { cn } from "@/lib/utils";

const PLATFORM_LIST: SocialPlatform[] = [
  "instagram",
  "tiktok",
  "facebook",
  "youtube",
  "twitter",
];

export function ReelsDownloader() {
  const [url, setUrl] = useState("");
  const [detectedPlatform, setDetectedPlatform] = useState<SocialPlatform>("unknown");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReelApiResponse | null>(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Auto-detect platform as user types
  useEffect(() => {
    if (!url.trim()) {
      setDetectedPlatform("unknown");
      return;
    }
    const plat = detectPlatformFromUrl(url);
    setDetectedPlatform(plat);
  }, [url]);

  // Click outside listener for download popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsDownloadMenuOpen(false);
      }
    }

    if (isDownloadMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDownloadMenuOpen]);

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          inputRef.current?.focus();
        }
      }
    } catch {
      // Ignore clipboard permission errors
    }
  };

  const handleDownloadFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setResult(null);
    setIsDownloadMenuOpen(false);
    setLoading(true);

    try {
      const res = await fetch("/api/download-reel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = (await res.json()) as ReelApiResponse;

      if (!res.ok || !data.success) {
        setError(
          data.error ||
            "Could not fetch video. Please check that the URL is public and try again."
        );
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
    setError(null);
    setIsDownloadMenuOpen(false);
    setDetectedPlatform("unknown");
    inputRef.current?.focus();
  };

  const handleDirectDownload = (downloadUrl: string, filename?: string) => {
    setIsDownloadMenuOpen(false);
    const cleanFilename = filename || "video.mp4";
    const proxyDownloadUrl = `/api/proxy-download?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(cleanFilename)}`;

    const a = document.createElement("a");
    a.href = proxyDownloadUrl;
    a.download = cleanFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Compile available download options for the popover
  const getDownloadOptions = (): VideoDownloadItem[] => {
    if (!result) return [];

    if (result.items && result.items.length > 0) {
      return result.items;
    }

    if (result.downloadUrl) {
      const items: VideoDownloadItem[] = [
        {
          quality: "1080p",
          label: "HD Video (1080p MP4)",
          url: result.downloadUrl,
          format: "mp4",
        },
      ];

      if (result.audioUrl) {
        items.push({
          quality: "audio",
          label: "Audio Only (MP3)",
          url: result.audioUrl,
          format: "mp3",
        });
      }

      return items;
    }

    return [];
  };

  const downloadOptions = getDownloadOptions();
  const activeConfig = SUPPORTED_PLATFORMS[detectedPlatform];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Platform Badges Bar */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {PLATFORM_LIST.map((p) => {
          const config = SUPPORTED_PLATFORMS[p];
          const isActive = detectedPlatform === p;

          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                if (!url) {
                  setUrl(config.exampleUrl);
                }
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer",
                isActive
                  ? `${config.colorClass} ring-2 ring-primary/20 scale-105 font-semibold`
                  : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Film className="size-3" />
              {config.badgeLabel}
            </button>
          );
        })}
      </div>

      {/* Main Input Box */}
      <Card className="p-4 sm:p-6 rounded-3xl border-border/80 shadow-xs bg-card/80">
        <form onSubmit={handleDownloadFetch} className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
              <LinkIcon className="size-4" />
            </div>

            <Input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={activeConfig.placeholder}
              className="pl-10 pr-24 py-5 text-sm sm:text-base rounded-2xl border-border/80 focus-visible:ring-primary shadow-xs"
              autoFocus
            />

            {/* Quick Actions in Input */}
            <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
              {!url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePasteClipboard}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl flex items-center gap-1"
                >
                  <ClipboardPaste className="size-3.5" />
                  Paste
                </Button>
              )}

              {url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-xl"
                  title="Clear input"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !url.trim()}
            size="lg"
            className="w-full rounded-2xl font-semibold gap-2 shadow-xs py-5"
          >
            {loading ? (
              <>
                <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Fetching Video...
              </>
            ) : (
              <>
                <Download className="size-4" />
                Fetch Video
              </>
            )}
          </Button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in-50">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}
      </Card>

      {/* Video Result Card */}
      {result && (
        <Card className="p-5 sm:p-6 rounded-3xl border-primary/20 bg-card shadow-sm animate-in fade-in-50 slide-in-from-bottom-2 space-y-5">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <h3 className="font-heading text-sm sm:text-base font-bold text-foreground truncate max-w-[240px] sm:max-w-md">
              {result.title || "Video Ready"}
            </h3>
            <Badge variant="secondary" className="capitalize text-xs font-semibold shrink-0">
              {result.platform}
            </Badge>
          </div>

          {/* Video Player / Preview */}
          <div className="overflow-hidden rounded-2xl border border-border bg-black/5 dark:bg-black/40 flex items-center justify-center aspect-video max-h-[320px] w-full">
            {result.downloadUrl ? (
              <video
                src={result.downloadUrl}
                poster={result.thumbnailUrl}
                controls
                playsInline
                className="w-full h-full object-contain rounded-2xl"
              />
            ) : result.thumbnailUrl ? (
              <img
                src={result.thumbnailUrl}
                alt={result.title || "Video thumbnail"}
                className="w-full h-full object-contain rounded-2xl"
              />
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-xs p-6">
                <Film className="size-6" />
                <span>Ready to download</span>
              </div>
            )}
          </div>

          {/* 2 Primary Actions: Download (with Popover) & Open in New Tab */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Download Button with Popover Quality Picker */}
            <div className="relative" ref={popoverRef}>
              <Button
                size="lg"
                onClick={() => {
                  if (downloadOptions.length <= 1 && result.downloadUrl) {
                    handleDirectDownload(result.downloadUrl, result.filename);
                  } else {
                    setIsDownloadMenuOpen((prev) => !prev);
                  }
                }}
                className="w-full rounded-2xl font-bold py-5 gap-2 bg-primary text-primary-foreground shadow-xs hover:opacity-90 cursor-pointer"
              >
                <Download className="size-4" />
                <span>Download Video</span>
                <ChevronDown
                  className={cn(
                    "size-4 opacity-70 transition-transform duration-200",
                    isDownloadMenuOpen && "rotate-180"
                  )}
                />
              </Button>

              {/* Popover Menu for Quality & Formats */}
              {isDownloadMenuOpen && (
                <div className="absolute left-0 right-0 bottom-full mb-2 z-50 rounded-2xl border border-border bg-popover p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95 space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Quality / Format
                  </div>

                  {downloadOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        handleDirectDownload(
                          opt.url,
                          result.filename || `video_${opt.quality}.${opt.format}`
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        {opt.format === "mp3" ? (
                          <Music className="size-4 text-primary" />
                        ) : (
                          <Film className="size-4 text-primary" />
                        )}
                        <span>{opt.label}</span>
                      </div>
                      <Download className="size-3.5 opacity-60" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Open in New Tab Button */}
            {result.downloadUrl && (
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full rounded-2xl font-semibold py-5 gap-2 text-foreground cursor-pointer"
              >
                <a
                  href={result.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4" />
                  <span>Open in New Tab</span>
                </a>
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
