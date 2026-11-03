"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Plus,
  Trash2,
  Merge,
  Search,
  Replace,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import type { SubtitleCue } from "../types";
import { formatSrtTimestamp, formatDisplayTimestamp } from "../utils/subtitle-formats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TranscriptEditorProps {
  cues: SubtitleCue[];
  activeCueIndex: number;
  onUpdateCues: (updated: SubtitleCue[]) => void;
  onSeek: (time: number) => void;
  currentTime: number;
}

export function TranscriptEditor({
  cues,
  activeCueIndex,
  onUpdateCues,
  onSeek,
  currentTime,
}: TranscriptEditorProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");

  const activeItemRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active cue into view
  useEffect(() => {
    if (!autoScroll || activeCueIndex < 0 || !activeItemRef.current) return;
    activeItemRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeCueIndex, autoScroll]);

  const handleTextChange = (id: string, newText: string) => {
    onUpdateCues(
      cues.map((c) => (c.id === id ? { ...c, text: newText } : c)),
    );
  };

  const handleTimingChange = (id: string, start: number, end: number) => {
    onUpdateCues(
      cues.map((c) =>
        c.id === id
          ? {
              ...c,
              start: Math.max(0, Number(start.toFixed(3))),
              end: Math.max(start + 0.1, Number(end.toFixed(3))),
            }
          : c,
      ),
    );
  };

  const handleNudge = (id: string, deltaSeconds: number) => {
    onUpdateCues(
      cues.map((c) => {
        if (c.id !== id) return c;
        const newStart = Math.max(0, c.start + deltaSeconds);
        const newEnd = Math.max(newStart + 0.2, c.end + deltaSeconds);
        return { ...c, start: newStart, end: newEnd };
      }),
    );
  };

  const handleDeleteCue = (id: string) => {
    onUpdateCues(cues.filter((c) => c.id !== id));
  };

  const handleAddCue = (afterIndex: number) => {
    const prevCue = cues[afterIndex];
    const newStart = prevCue ? prevCue.end : currentTime;
    const newEnd = newStart + 3.0;

    const newCue: SubtitleCue = {
      id: `cue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      start: Number(newStart.toFixed(3)),
      end: Number(newEnd.toFixed(3)),
      text: "",
    };

    const newCues = [...cues];
    newCues.splice(afterIndex + 1, 0, newCue);
    onUpdateCues(newCues);
  };

  const handleMergeNext = (index: number) => {
    if (index >= cues.length - 1) return;
    const current = cues[index];
    const next = cues[index + 1];

    const mergedCue: SubtitleCue = {
      id: current.id,
      start: current.start,
      end: next.end,
      text: `${current.text.trim()} ${next.text.trim()}`,
    };

    const newCues = [...cues];
    newCues.splice(index, 2, mergedCue);
    onUpdateCues(newCues);
  };

  const handleReplaceAll = () => {
    if (!searchQuery.trim()) return;
    const query = searchQuery;
    const rep = replaceQuery;

    const updated = cues.map((c) => ({
      ...c,
      text: c.text.replaceAll(query, rep),
    }));

    onUpdateCues(updated);
    setSearchQuery("");
    setReplaceQuery("");
    setShowSearchReplace(false);
  };

  return (
    <Card className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col h-[520px]">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-bold text-foreground">
            Subtitle Cues
          </Label>
          <Badge variant="secondary" className="text-xs font-mono font-semibold">
            {cues.length} {cues.length === 1 ? "segment" : "segments"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearchReplace(!showSearchReplace)}
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <Search className="size-3 mr-1" />
            Find & Replace
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              "text-xs h-7 px-2",
              autoScroll ? "text-primary border-primary/30 bg-primary/5" : "text-muted-foreground",
            )}
          >
            Auto-scroll: {autoScroll ? "On" : "Off"}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => handleAddCue(cues.length - 1)}
            className="text-xs h-7 px-2 font-medium"
          >
            <Plus className="size-3 mr-1" />
            Add Cue
          </Button>
        </div>
      </div>

      {/* Find and Replace Drawer */}
      {showSearchReplace && (
        <div className="p-3 my-2 rounded-xl bg-muted/60 border border-border/80 shrink-0 flex flex-col sm:flex-row items-center gap-2 text-xs">
          <Input
            placeholder="Search word (Bangla / English)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs flex-1"
          />
          <Input
            placeholder="Replace with..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="h-8 text-xs flex-1"
          />
          <Button
            size="sm"
            onClick={handleReplaceAll}
            disabled={!searchQuery.trim()}
            className="h-8 text-xs font-semibold px-3 shrink-0"
          >
            <Replace className="size-3 mr-1" />
            Replace All
          </Button>
        </div>
      )}

      {/* Cues List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 mt-3 custom-scrollbar"
      >
        {cues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <Clock className="size-8 opacity-40 mb-2" />
            <p className="text-sm font-medium">No subtitle cues yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Start speech recognition, upload an audio/video file, or click &ldquo;Add Cue&rdquo; to begin.
            </p>
          </div>
        ) : (
          cues.map((cue, idx) => {
            const isActive = idx === activeCueIndex;
            return (
              <div
                key={cue.id}
                ref={isActive ? activeItemRef : null}
                className={cn(
                  "p-3 rounded-xl border transition-all duration-150 flex flex-col gap-2 relative group",
                  isActive
                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                    : "border-border/70 hover:border-border hover:bg-muted/20",
                )}
              >
                {/* Cue Header with Timestamps & Controls */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-muted-foreground">
                    <span className="font-bold text-foreground/80 min-w-5">
                      #{idx + 1}
                    </span>

                    {/* Seek & Play Button */}
                    <button
                      type="button"
                      onClick={() => onSeek(cue.start)}
                      className="p-1 rounded-md hover:bg-primary/20 text-primary transition-colors flex items-center gap-1"
                      title="Jump to this segment in media"
                    >
                      <Play className="size-3 fill-current" />
                      <span className="font-semibold text-primary">
                        {formatDisplayTimestamp(cue.start)}
                      </span>
                    </button>
                    <span>→</span>
                    <span>{formatDisplayTimestamp(cue.end)}</span>

                    {/* Nudge Buttons */}
                    <div className="hidden sm:flex items-center gap-1 ml-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleNudge(cue.id, -0.5)}
                        className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted-foreground/20 text-muted-foreground font-mono"
                        title="Shift 0.5s earlier"
                      >
                        -0.5s
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudge(cue.id, 0.5)}
                        className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted-foreground/20 text-muted-foreground font-mono"
                        title="Shift 0.5s later"
                      >
                        +0.5s
                      </button>
                    </div>
                  </div>

                  {/* Actions (Merge, Add below, Delete) */}
                  <div className="flex items-center gap-1">
                    {idx < cues.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMergeNext(idx)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded"
                        title="Merge with next cue"
                      >
                        <Merge className="size-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAddCue(idx)}
                      className="p-1 text-muted-foreground hover:text-primary rounded"
                      title="Add cue below"
                    >
                      <Plus className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCue(cue.id)}
                      className="p-1 text-muted-foreground hover:text-destructive rounded"
                      title="Delete this cue"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>

                {/* Subtitle Text Input (Bangla or English) */}
                <textarea
                  rows={2}
                  value={cue.text}
                  onChange={(e) => handleTextChange(cue.id, e.target.value)}
                  placeholder="Enter caption text (বাংলা বা English)..."
                  className="w-full bg-transparent resize-none text-xs sm:text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/40 rounded-md p-1 border border-transparent hover:border-border/60 transition-colors leading-relaxed"
                />
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
