"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Link as LinkIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Play,
  RotateCcw,
  Film,
  Music,
  ExternalLink,
  ClipboardPaste,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  SUPPORTED_PLATFORMS,
  detectPlatformFromUrl,
  isValidSocialUrl,
} from "../utils/url-detector";
import type { ReelApiResponse, SocialPlatform } from "../types";
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
  const [copiedLink, setCopiedLink] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-detect platform as user types
  useEffect(() => {
    if (!url.trim()) {
      setDetectedPlatform("unknown");
      return;
    }
    const plat = detectPlatformFromUrl(url);
    setDetectedPlatform(plat);
  }, [url]);

  // Global paste handler on the page
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
    setDetectedPlatform("unknown");
    inputRef.current?.focus();
  };

  const handleDirectDownload = (downloadUrl: string, filename?: string) => {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename || "video.mp4";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const activeConfig = SUPPORTED_PLATFORMS[detectedPlatform];

  return (
    <div className="space-y-8">
      {/* Platform Badges Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
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
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer",
                isActive
                  ? `${config.colorClass} ring-2 ring-primary/20 scale-105 shadow-xs font-semibold`
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
      <Card className="p-6 sm:p-8 rounded-3xl border-border/80 shadow-sm bg-card/70 backdrop-blur-xs">
        <form onSubmit={handleDownloadFetch} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
              <LinkIcon className="size-5" />
            </div>

            <Input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={activeConfig.placeholder}
              className="pl-11 pr-28 py-6 text-sm sm:text-base rounded-2xl border-border/80 focus-visible:ring-primary shadow-xs"
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
                  className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground rounded-xl flex items-center gap-1"
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
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground rounded-xl"
                  title="Clear input"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>100% Free · No Watermark · High Speed Direct Download</span>
            </div>

            <Button
              type="submit"
              disabled={loading || !url.trim()}
              size="lg"
              className="w-full sm:w-auto px-8 rounded-xl font-semibold gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Fetching Video...
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Fetch & Download
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3 animate-in fade-in-50">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Unable to process video</p>
              <p className="text-xs text-destructive/90">{error}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Video Result Card */}
      {result && (
        <Card className="p-6 sm:p-8 rounded-3xl border-primary/20 bg-card shadow-md animate-in fade-in-50 slide-in-from-bottom-2 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-500" />
              <h3 className="font-heading text-lg font-bold text-foreground">
                Video Ready for Download
              </h3>
            </div>
            <Badge variant="secondary" className="capitalize text-xs font-semibold">
              {result.platform}
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 items-start">
            {/* Video Player / Thumbnail Preview */}
            <div className="overflow-hidden rounded-2xl border border-border bg-black/5 dark:bg-black/40 flex items-center justify-center aspect-video sm:aspect-square max-h-[380px] relative group">
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
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-6 text-center">
                  <Film className="size-12 stroke-1" />
                  <span className="text-xs">Preview player ready</span>
                </div>
              )}
            </div>

            {/* Video Info & Download Actions */}
            <div className="space-y-5">
              {result.title && (
                <div>
                  <h4 className="font-heading text-base font-bold text-foreground line-clamp-3">
                    {result.title}
                  </h4>
                  {result.author && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Creator: <span className="font-medium text-foreground">{result.author}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Main Download Buttons */}
              <div className="space-y-3 pt-2">
                {result.downloadUrl && (
                  <Button
                    size="lg"
                    onClick={() => handleDirectDownload(result.downloadUrl!, result.filename)}
                    className="w-full rounded-2xl font-bold py-6 text-sm sm:text-base gap-2 bg-primary text-primary-foreground shadow-md hover:opacity-90"
                  >
                    <Download className="size-5" />
                    Download HD Video (MP4)
                  </Button>
                )}

                {/* Multi-item carousel if available */}
                {result.items && result.items.length > 1 && (
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Multiple Media Found ({result.items.length} files):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {result.items.map((item, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDirectDownload(item.url, `media_${idx + 1}.mp4`)}
                          className="w-full justify-between text-xs rounded-xl"
                        >
                          <span className="truncate">{item.label}</span>
                          <Download className="size-3.5 shrink-0 text-primary" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {result.downloadUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 rounded-xl text-xs gap-1.5"
                    >
                      <a href={result.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-3.5" />
                        Open Video in Tab
                      </a>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="rounded-xl text-xs gap-1.5"
                  >
                    <RotateCcw className="size-3.5" />
                    Download Another
                  </Button>
                </div>
              </div>

              {/* Tips & Safety */}
              <div className="rounded-xl bg-muted/50 p-3.5 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="size-3.5 text-amber-500" />
                  Pro Tip for Mobile:
                </p>
                <p>
                  On iOS / iPhone, tap "Open Video in Tab", then press the Share button and select "Save to Files" or "Save Video".
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1.5">
          <div className="size-8 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center mb-2">
            <Sparkles className="size-4" />
          </div>
          <h4 className="font-heading text-sm font-bold text-foreground">No Watermark</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Download crisp TikTok videos and Instagram Reels without annoying platform logos or watermarks.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1.5">
          <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
            <Film className="size-4" />
          </div>
          <h4 className="font-heading text-sm font-bold text-foreground">Highest HD Quality</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Extracts original full 1080p / 4K source video streams directly from platform CDNs with full audio.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1.5">
          <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
            <ShieldCheck className="size-4" />
          </div>
          <h4 className="font-heading text-sm font-bold text-foreground">100% Ad-Free & Safe</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Zero intrusive popup ads, no redirect loops, and zero mandatory account creation or tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
