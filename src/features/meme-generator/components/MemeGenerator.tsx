"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Copy,
  Download,
  ImagePlus,
  Italic,
  Redo2,
  RotateCcw,
  Search,
  SmilePlus,
  Trash2,
  Type,
  Undo2,
  UnfoldVertical,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SliderProps } from "@/components/ui/slider";
import { Slider } from "@/components/ui/slider";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { cn, triggerDownload } from "@/lib/utils";
import {
  type CanvasPaddingState,
  clampOverlayPosition,
  clampOverlaySize,
  clampPaddingFraction,
  createDefaultIconOverlay,
  createDefaultTextOverlay,
  extensionForMemeFormat,
  filterTemplates,
  generateMemeFileName,
  type IconOverlayState,
  MEME_FONTS,
  type MemeExportFormat,
  type MemeFontId,
  type MemeTemplate,
  type MemeTextAlign,
  parseTemplatesManifest,
  resolveMemeMimeType,
  sanitizeMemeSlug,
  type TextOverlayState,
} from "../utils/meme-engine";
import { loadMemeImage, renderMemeToBlob } from "../utils/render-meme";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/bmp";
const MAX_SIZE_MB = 50;

const EMOJIS = [
  "😂",
  "🤣",
  "😭",
  "😎",
  "🤔",
  "😡",
  "👀",
  "💀",
  "🔥",
  "💯",
  "❤️",
  "👍",
  "👎",
  "🤡",
  "💩",
  "🎉",
  "😱",
  "🤯",
  "🥺",
  "😴",
  "🤝",
  "👏",
  "🙏",
  "💪",
];

const FONT_OPTIONS: Array<{ id: MemeFontId; label: string }> = [
  { id: "impact", label: "Impact" },
  { id: "arial", label: "Arial" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Mono" },
];

const FORMAT_OPTIONS: Array<{ id: MemeExportFormat; label: string }> = [
  { id: "png", label: "PNG" },
  { id: "jpeg", label: "JPG" },
  { id: "webp", label: "WebP" },
];

interface Snapshot {
  texts: TextOverlayState[];
  icons: IconOverlayState[];
  padding: CanvasPaddingState;
}

interface BaseImage {
  img: HTMLImageElement;
  name: string;
  templateId: string | null;
}

const EMPTY_PADDING: CanvasPaddingState = {
  top: 0,
  bottom: 0,
  color: "#ffffff",
};

function freshTexts(defaults: string[]): TextOverlayState[] {
  return defaults.map((text, i) => ({
    ...createDefaultTextOverlay(i, defaults.length),
    text,
  }));
}

/** Slider that checkpoints undo history when the user starts dragging it. */
function HistorySlider({
  onCommit,
  ...rest
}: SliderProps & { onCommit: () => void }) {
  return (
    <div onPointerDownCapture={onCommit}>
      <Slider {...rest} />
    </div>
  );
}

export function MemeGenerator() {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [query, setQuery] = useState("");
  const [base, setBase] = useState<BaseImage | null>(null);
  const [texts, setTexts] = useState<TextOverlayState[]>([]);
  const [icons, setIcons] = useState<IconOverlayState[]>([]);
  const [padding, setPadding] = useState<CanvasPaddingState>(EMPTY_PADDING);
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [selected, setSelected] = useState<{
    kind: "text" | "icon";
    id: string;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [format, setFormat] = useState<MemeExportFormat>("png");
  const [quality, setQuality] = useState(90);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayW, setDisplayW] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ kind: "text" | "icon"; id: string } | null>(null);

  // Load the Meme Template gallery manifest.
  useEffect(() => {
    fetch("/memes/templates.json")
      .then((r) => {
        if (!r.ok) throw new Error("manifest");
        return r.json();
      })
      .then((j) => setTemplates(parseTemplatesManifest(j)))
      .catch(() => setTemplates([]));
  }, []);

  const measure = useCallback(() => {
    const w = wrapRef.current?.getBoundingClientRect().width ?? 0;
    if (w > 0) setDisplayW(w);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const snapshot = useCallback(
    (): Snapshot => ({ texts, icons, padding }),
    [texts, icons, padding],
  );

  const checkpoint = useCallback(() => {
    const snap = snapshot();
    setPast((p) => [...p.slice(-49), snap]);
    setFuture([]);
  }, [snapshot]);

  const applySnapshot = useCallback((snap: Snapshot) => {
    setTexts(snap.texts);
    setIcons(snap.icons);
    setPadding(snap.padding);
    setSelected(null);
    setEditingId(null);
  }, []);

  const handleUndo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [snapshot(), ...f]);
      applySnapshot(prev);
      return p.slice(0, -1);
    });
  }, [applySnapshot, snapshot]);

  const handleRedo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const [next, ...rest] = f;
      setPast((p) => [...p, snapshot()]);
      applySnapshot(next);
      return rest;
    });
  }, [applySnapshot, snapshot]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT");
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selected &&
        !typing &&
        !editingId
      ) {
        e.preventDefault();
        handleDeleteSelected();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const resetHistory = useCallback(
    (snap: Snapshot) => {
      setPast([]);
      setFuture([]);
      applySnapshot(snap);
    },
    [applySnapshot],
  );

  const handleSelectTemplate = useCallback(
    async (t: MemeTemplate) => {
      setLoading(true);
      setError(null);
      try {
        const img = await loadMemeImage(`/memes/${t.file}`);
        const fresh = freshTexts(t.defaultTexts);
        setBase({ img, name: t.name, templateId: t.id });
        resetHistory({
          texts: fresh,
          icons: [],
          padding: { ...EMPTY_PADDING },
        });
        setSelected(
          fresh.length > 0 ? { kind: "text", id: fresh[0].id } : null,
        );
      } catch {
        setError(`Could not load template "${t.name}". Try another one.`);
      } finally {
        setLoading(false);
      }
    },
    [resetHistory],
  );

  const loadUploadFile = useCallback(
    (file: File) => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Image exceeds the ${MAX_SIZE_MB} MB limit.`);
        return;
      }
      setLoading(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setBase({
            img,
            name: file.name.replace(/\.[^/.]+$/, ""),
            templateId: null,
          });
          const fresh = freshTexts(["TEXT HERE"]);
          resetHistory({
            texts: fresh,
            icons: [],
            padding: { ...EMPTY_PADDING },
          });
          setSelected({ kind: "text", id: fresh[0].id });
          setLoading(false);
        };
        img.onerror = () => {
          setError("Could not read that image file.");
          setLoading(false);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [resetHistory],
  );

  // Global paste handler for screenshots.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) loadUploadFile(file);
          return;
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [loadUploadFile]);

  const handleAddText = useCallback(() => {
    if (!base) return;
    checkpoint();
    const overlay = createDefaultTextOverlay(texts.length, texts.length + 1);
    setTexts((t) => [...t, overlay]);
    setSelected({ kind: "text", id: overlay.id });
    setEditingId(overlay.id);
  }, [base, checkpoint, texts.length]);

  const handleAddIcon = useCallback(
    (emoji: string) => {
      if (!base) return;
      checkpoint();
      const overlay = createDefaultIconOverlay(emoji);
      setIcons((list) => [...list, overlay]);
      setSelected({ kind: "icon", id: overlay.id });
      setShowEmojis(false);
    },
    [base, checkpoint],
  );

  const handleTogglePadding = useCallback(() => {
    if (!base) return;
    checkpoint();
    setPadding((p) =>
      p.top === 0 && p.bottom === 0
        ? { top: 0.12, bottom: 0.12, color: "#ffffff" }
        : { ...EMPTY_PADDING },
    );
  }, [base, checkpoint]);

  const handleDeleteSelected = useCallback(() => {
    if (!selected) return;
    checkpoint();
    if (selected.kind === "text") {
      setTexts((t) => t.filter((o) => o.id !== selected.id));
    } else {
      setIcons((t) => t.filter((o) => o.id !== selected.id));
    }
    setSelected(null);
    setEditingId(null);
  }, [checkpoint, selected]);

  const handleResetCanvas = useCallback(() => {
    if (!base) return;
    checkpoint();
    const tpl = templates.find((t) => t.id === base.templateId);
    const fresh = tpl
      ? freshTexts(tpl.defaultTexts)
      : freshTexts(["TEXT HERE"]);
    setTexts(fresh);
    setIcons([]);
    setPadding({ ...EMPTY_PADDING });
    setSelected(fresh.length > 0 ? { kind: "text", id: fresh[0].id } : null);
  }, [base, checkpoint, templates]);

  // Pointer drag for Text Overlay + Icon Overlay (fractional coordinates).
  const moveOverlay = useCallback(
    (kind: "text" | "icon", id: string, dx: number, dy: number) => {
      const shift = <T extends { x: number; y: number }>(o: T): T => ({
        ...o,
        ...clampOverlayPosition(o.x + dx, o.y + dy),
      });
      if (kind === "text") {
        setTexts((list) => list.map((o) => (o.id === id ? shift(o) : o)));
      } else {
        setIcons((list) => list.map((o) => (o.id === id ? shift(o) : o)));
      }
    },
    [],
  );
  const onOverlayPointerDown = (
    e: React.PointerEvent,
    kind: "text" | "icon",
    id: string,
  ) => {
    if (editingId) return;
    e.preventDefault();
    e.stopPropagation();
    setSelected({ kind, id });
    dragRef.current = { kind, id };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onOverlayPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !wrapRef.current || !base) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const dx = e.movementX / rect.width;
    const dy = e.movementY / rect.height;
    moveOverlay(drag.kind, drag.id, dx, dy);
  };

  const onOverlayPointerUp = () => {
    if (dragRef.current) {
      dragRef.current = null;
      checkpoint();
    }
  };

  const updateSelectedText = useCallback(
    (patch: Partial<TextOverlayState>) => {
      if (!selected || selected.kind !== "text") return;
      setTexts((list) =>
        list.map((o) => (o.id === selected.id ? { ...o, ...patch } : o)),
      );
    },
    [selected],
  );

  const exportBlob = useCallback(async (): Promise<Blob | null> => {
    if (!base) return null;
    const mime = resolveMemeMimeType(format);
    const q = format === "png" ? 1 : quality / 100;
    return renderMemeToBlob(base.img, texts, icons, padding, mime, q);
  }, [base, format, quality, texts, icons, padding]);

  const handleDownload = useCallback(async () => {
    if (!base) return;
    setError(null);
    const blob = await exportBlob();
    if (!blob) {
      setError("Export failed. Try again.");
      return;
    }
    const stem = generateMemeFileName(
      base.templateId ?? "custom",
      format,
    ).replace(
      new RegExp(`${extensionForMemeFormat(format).replace(".", "\\.")}$`),
      `-${Date.now()}${extensionForMemeFormat(format)}`,
    );
    const url = URL.createObjectURL(blob);
    triggerDownload(url, stem || `meme-${Date.now()}.png`);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [base, exportBlob, format]);

  const handleCopy = useCallback(async () => {
    if (!base) return;
    try {
      const blob = await exportBlob();
      if (!blob) return;
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed in this browser. Use Download instead.");
    }
  }, [base, exportBlob]);

  const visibleTemplates = filterTemplates(templates, query);
  const selectedText =
    selected?.kind === "text"
      ? texts.find((o) => o.id === selected.id)
      : undefined;
  const selectedIcon =
    selected?.kind === "icon"
      ? icons.find((o) => o.id === selected.id)
      : undefined;
  const baseName = base
    ? base.templateId
      ? base.name
      : `${base.name} (custom)`
    : "Pick a template";
  const natW = base?.img.naturalWidth || 1;
  const natH = base?.img.naturalHeight || 1;
  const previewImgH = displayW > 0 ? (displayW * natH) / natW : 0;
  const previewPadTopPx = previewImgH * clampPaddingFraction(padding.top);
  const previewPadBottomPx =
    previewImgH * clampPaddingFraction(padding.bottom);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)_300px]">
      {/* Left: Meme Template gallery + actions */}
      <aside className="order-2 lg:order-1 space-y-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Meme Generator</CardTitle>
            <div className="relative pt-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-[calc(-50%+2px)] text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
              {visibleTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTemplate(t)}
                  title={t.name}
                  className={cn(
                    "relative shrink-0 w-24 h-24 lg:w-full lg:h-auto lg:aspect-square overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
                    base?.templateId === t.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/60",
                  )}
                >
                  <img
                    src={`/memes/${t.file}`}
                    alt={t.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </button>
              ))}
              {visibleTemplates.length === 0 && (
                <p className="text-xs text-muted-foreground py-4">
                  No templates match “{query}”.
                </p>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddText}
                disabled={!base}
                className="w-full justify-center gap-2"
              >
                <Type className="size-4" />
                Add Text
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmojis((s) => !s)}
                disabled={!base}
                className="w-full justify-center gap-2"
              >
                <SmilePlus className="size-4" />
                Add Icon
              </Button>
              {showEmojis && (
                <div className="grid grid-cols-8 gap-1 rounded-lg border border-border p-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleAddIcon(emoji)}
                      className="rounded p-1 text-xl leading-none hover:bg-muted cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="w-full justify-center gap-2"
              >
                <ImagePlus className="size-4" />
                Upload Meme
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) loadUploadFile(f);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTogglePadding}
                disabled={!base}
                className="w-full justify-center gap-2"
              >
                <UnfoldVertical className="size-4" />
                Add Padding
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Center: canvas */}
      <section className="order-1 lg:order-2 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold truncate">
            {loading ? "Loading…" : baseName}
          </h2>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={!base}
            className="gap-2 shrink-0"
          >
            <Download className="size-4" />
            Download
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            {!base ? (
              <UploadDropzone
                accept={ACCEPT}
                maxSizeMB={MAX_SIZE_MB}
                title="Pick a Meme Template on the left, or drop your own image here"
                subtitle="Supports JPG, PNG, WebP, GIF, BMP. Up to 50MB. You can also paste (Ctrl+V)."
                onFilesSelected={(files) => {
                  if (files[0]) loadUploadFile(files[0]);
                }}
              />
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30 flex items-center justify-center min-h-[320px] max-h-[560px] p-2">
                <div className="inline-flex max-w-full flex-col rounded-lg shadow-xs">
                  <div
                    style={{
                      height: previewPadTopPx,
                      backgroundColor: padding.color,
                    }}
                    className="w-full rounded-t-lg"
                  />
                  <div
                    ref={wrapRef}
                    className="relative max-w-full select-none"
                    style={{ touchAction: "none" }}
                    onPointerMove={onOverlayPointerMove}
                    onPointerUp={onOverlayPointerUp}
                  >
                    <img
                      src={base.img.src}
                      alt={base.name}
                      draggable={false}
                      onLoad={measure}
                      className="block max-w-full object-contain"
                      style={{ maxHeight: "520px" }}
                    />
                  {texts.map((o) => {
                    const isSel =
                      selected?.kind === "text" && selected.id === o.id;
                    const fontPx =
                      displayW > 0 ? Math.max(8, o.size * displayW) : 16;
                    const strokePx = Math.max(0, o.strokeWidth * fontPx);
                    return editingId === o.id ? (
                      <textarea
                        key={o.id}
                        ref={(el) => {
                          el?.focus();
                        }}
                        value={o.text}
                        rows={2}
                        onChange={(e) =>
                          setTexts((list) =>
                            list.map((t) =>
                              t.id === o.id
                                ? { ...t, text: e.target.value }
                                : t,
                            ),
                          )
                        }
                        onBlur={() => {
                          setEditingId(null);
                          checkpoint();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setEditingId(null);
                            checkpoint();
                          }
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute z-10 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded border border-primary bg-background/90 p-1 text-center"
                        style={{
                          left: `${o.x * 100}%`,
                          top: `${o.y * 100}%`,
                          fontSize: fontPx,
                        }}
                      />
                    ) : (
                      <button
                        key={o.id}
                        type="button"
                        aria-label={`Edit text overlay: ${o.text || "empty"}`}
                        onPointerDown={(e) =>
                          onOverlayPointerDown(e, "text", o.id)
                        }
                        onDoubleClick={() => {
                          checkpoint();
                          setEditingId(o.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            checkpoint();
                            setEditingId(o.id);
                          }
                        }}
                        className={cn(
                          "absolute max-w-[94%] cursor-move whitespace-pre-wrap break-words px-1",
                          isSel &&
                            "outline-2 outline-dashed outline-primary rounded",
                        )}
                        style={{
                          left: `${o.x * 100}%`,
                          top: `${o.y * 100}%`,
                          transform: "translate(-50%, -50%)",
                          fontFamily: MEME_FONTS[o.font],
                          fontSize: fontPx,
                          lineHeight: 1.15,
                          color: o.color,
                          textAlign: o.align,
                          fontWeight: o.bold ? "bold" : "normal",
                          fontStyle: o.italic ? "italic" : "normal",
                          WebkitTextStroke:
                            strokePx > 0
                              ? `${strokePx}px ${o.strokeColor}`
                              : undefined,
                          paintOrder: "stroke fill",
                        }}
                      >
                        {o.text || " "}
                      </button>
                    );
                  })}
                  {icons.map((o) => {
                    const isSel =
                      selected?.kind === "icon" && selected.id === o.id;
                    const sizePx =
                      displayW > 0 ? Math.max(8, o.size * displayW) : 24;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-label={`Icon overlay: ${o.emoji}`}
                        onPointerDown={(e) =>
                          onOverlayPointerDown(e, "icon", o.id)
                        }
                        className={cn(
                          "absolute cursor-move leading-none",
                          isSel &&
                            "outline-2 outline-dashed outline-primary rounded",
                        )}
                        style={{
                          left: `${o.x * 100}%`,
                          top: `${o.y * 100}%`,
                          transform: "translate(-50%, -50%)",
                          fontSize: sizePx,
                        }}
                      >
                        {o.emoji}
                      </button>
                    );
                  })}
                  </div>
                  <div
                    style={{
                      height: previewPadBottomPx,
                      backgroundColor: padding.color,
                    }}
                    className="w-full rounded-b-lg"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-3">
              <span className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={past.length === 0}
                  className="h-8 px-2 text-xs"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="size-3.5 mr-1" />
                  Undo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRedo}
                  disabled={future.length === 0}
                  className="h-8 px-2 text-xs"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="size-3.5 mr-1" />
                  Redo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetCanvas}
                  disabled={!base}
                  className="h-8 px-2 text-xs"
                  title="Reset canvas"
                >
                  <RotateCcw className="size-3.5 mr-1" />
                  Reset
                </Button>
              </span>
              <span>
                Double-click text to edit · drag to move · 100% In-Browser
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Right: style + padding + export */}
      <aside className="order-3 space-y-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Text Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedText ? (
              <p className="text-xs text-muted-foreground">
                {base
                  ? "Select a Text Overlay on the canvas to style it."
                  : "Load a template or upload first."}
              </p>
            ) : (
              <>
                <textarea
                  value={selectedText.text}
                  rows={2}
                  onFocus={checkpoint}
                  onChange={(e) => updateSelectedText({ text: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <label htmlFor="meme-font" className="text-xs space-y-1">
                    <span className="text-muted-foreground">Font</span>
                    <select
                      id="meme-font"
                      value={selectedText.font}
                      onChange={(e) => {
                        checkpoint();
                        updateSelectedText({
                          font: e.target.value as MemeFontId,
                        });
                      }}
                      className="w-full rounded-lg border border-border bg-background p-2 text-sm"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="text-xs space-y-1">
                    <span className="text-muted-foreground">Align</span>
                    <div className="flex gap-1">
                      {(
                        [
                          { id: "left", Icon: AlignLeft },
                          { id: "center", Icon: AlignCenter },
                          { id: "right", Icon: AlignRight },
                        ] as Array<{
                          id: MemeTextAlign;
                          Icon: typeof AlignLeft;
                        }>
                      ).map(({ id, Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            checkpoint();
                            updateSelectedText({ align: id });
                          }}
                          className={cn(
                            "flex-1 rounded-lg border p-2 cursor-pointer",
                            selectedText.align === id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <Icon className="size-4 mx-auto" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-mono">
                      {Math.round(selectedText.size * 100)}%
                    </span>
                  </div>
                  <HistorySlider
                    value={Math.round(selectedText.size * 100)}
                    min={2}
                    max={50}
                    step={1}
                    onCommit={checkpoint}
                    onValueChange={(v) =>
                      updateSelectedText({ size: clampOverlaySize(v / 100) })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    htmlFor="meme-text-color"
                    className="text-xs space-y-1"
                  >
                    <span className="text-muted-foreground">Color</span>
                    <Input
                      id="meme-text-color"
                      type="color"
                      value={selectedText.color}
                      onFocus={checkpoint}
                      onChange={(e) =>
                        updateSelectedText({ color: e.target.value })
                      }
                      className="h-9 w-full p-1 cursor-pointer"
                    />
                  </label>
                  <label
                    htmlFor="meme-stroke-color"
                    className="text-xs space-y-1"
                  >
                    <span className="text-muted-foreground">Outline</span>
                    <Input
                      id="meme-stroke-color"
                      type="color"
                      value={selectedText.strokeColor}
                      onFocus={checkpoint}
                      onChange={(e) =>
                        updateSelectedText({ strokeColor: e.target.value })
                      }
                      className="h-9 w-full p-1 cursor-pointer"
                    />
                  </label>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Outline width</span>
                    <span className="font-mono">
                      {Math.round(selectedText.strokeWidth * 100)}%
                    </span>
                  </div>
                  <HistorySlider
                    value={Math.round(selectedText.strokeWidth * 100)}
                    min={0}
                    max={20}
                    step={1}
                    onCommit={checkpoint}
                    onValueChange={(v) =>
                      updateSelectedText({ strokeWidth: v / 100 })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={selectedText.bold ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      checkpoint();
                      updateSelectedText({ bold: !selectedText.bold });
                    }}
                    className="flex-1"
                  >
                    <Bold className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={selectedText.italic ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      checkpoint();
                      updateSelectedText({ italic: !selectedText.italic });
                    }}
                    className="flex-1"
                  >
                    <Italic className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </>
            )}
            {selectedIcon && (
              <div className="space-y-3 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-2xl leading-none px-2 py-1"
                  >
                    {selectedIcon.emoji}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Icon size</span>
                    <span className="font-mono">
                      {Math.round(selectedIcon.size * 100)}%
                    </span>
                  </div>
                  <HistorySlider
                    value={Math.round(selectedIcon.size * 100)}
                    min={2}
                    max={50}
                    step={1}
                    onCommit={checkpoint}
                    onValueChange={(v) =>
                      setIcons((list) =>
                        list.map((o) =>
                          o.id === selectedIcon.id
                            ? { ...o, size: clampOverlaySize(v / 100) }
                            : o,
                        ),
                      )
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Canvas Padding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Top</span>
                <span className="font-mono">
                  {Math.round(padding.top * 100)}%
                </span>
              </div>
              <HistorySlider
                value={Math.round(padding.top * 100)}
                min={0}
                max={50}
                step={1}
                onCommit={checkpoint}
                onValueChange={(v) =>
                  setPadding((p) => ({
                    ...p,
                    top: clampPaddingFraction(v / 100),
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Bottom</span>
                <span className="font-mono">
                  {Math.round(padding.bottom * 100)}%
                </span>
              </div>
              <HistorySlider
                value={Math.round(padding.bottom * 100)}
                min={0}
                max={50}
                step={1}
                onCommit={checkpoint}
                onValueChange={(v) =>
                  setPadding((p) => ({
                    ...p,
                    bottom: clampPaddingFraction(v / 100),
                  }))
                }
              />
            </div>
            <label
              htmlFor="meme-padding-color"
              className="text-xs space-y-1 block"
            >
              <span className="text-muted-foreground">Padding color</span>
              <Input
                id="meme-padding-color"
                type="color"
                value={padding.color}
                onFocus={checkpoint}
                onChange={(e) =>
                  setPadding((p) => ({ ...p, color: e.target.value }))
                }
                className="h-9 w-full p-1 cursor-pointer"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="size-4 text-primary" />
              Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-1">
              {FORMAT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id)}
                  className={cn(
                    "rounded-lg border py-1.5 text-xs font-semibold cursor-pointer",
                    format === f.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {format !== "png" && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Quality</span>
                  <span className="font-mono">{quality}%</span>
                </div>
                <HistorySlider
                  value={quality}
                  min={10}
                  max={100}
                  step={1}
                  onCommit={() => {}}
                  onValueChange={setQuality}
                />
              </div>
            )}
            <div className="text-[11px] text-muted-foreground">
              Exports at full Base Image resolution{base ? "" : " once loaded"}{" "}
              · {sanitizeMemeSlug(base?.templateId ?? base?.name ?? "custom")}
              {extensionForMemeFormat(format)}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              disabled={!base}
              className="w-full justify-center gap-2 h-10"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-500" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="size-4 text-muted-foreground" />
                  Copy Image to Clipboard
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleDownload}
              disabled={!base}
              className="w-full justify-center gap-2 h-10"
            >
              <Download className="size-4" />
              Download Meme Output
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
