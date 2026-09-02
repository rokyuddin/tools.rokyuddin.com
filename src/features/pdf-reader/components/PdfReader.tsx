"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize,
  Minimize,
  Moon,
  Sun,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { cn } from "@/lib/utils";
import type { ReadingTheme, ZoomMode } from "../types";

const THEME_CONFIG: Record<
  ReadingTheme,
  {
    container: string;
    toolbar: string;
    reader: string;
    indicator: string;
    text: string;
    muted: string;
    canvasShadow: string;
    icon: typeof Sun;
    label: string;
    hover: string;
  }
> = {
  light: {
    container: "bg-[#fbf6ee]",
    toolbar: "bg-[#f5efe4] border-b border-[#e0d8c8]",
    reader: "bg-[#fbf6ee]",
    indicator: "bg-[#f5efe4] border-t border-[#e0d8c8]",
    text: "text-gray-900",
    muted: "text-gray-500",
    canvasShadow: "shadow-xl shadow-black/10 ring-1 ring-black/5",
    icon: Sun,
    label: "Light",
    hover: "hover:bg-black/5",
  },
  sepia: {
    container: "bg-[#f4ecd8]",
    toolbar: "bg-[#ede3c9] border-b border-[#d4c9a8]",
    reader: "bg-[#f4ecd8]",
    indicator: "bg-[#ede3c9] border-t border-[#d4c9a8]",
    text: "text-[#5b4636]",
    muted: "text-[#8b7355]",
    canvasShadow: "shadow-xl shadow-[#5b4636]/15 ring-1 ring-[#5b4636]/5",
    icon: BookOpen,
    label: "Sepia",
    hover: "hover:bg-[#5b4636]/5",
  },
  dark: {
    container: "bg-[#1a1a1a]",
    toolbar: "bg-[#252525] border-b border-[#333]",
    reader: "bg-[#1a1a1a]",
    indicator: "bg-[#252525] border-t border-[#333]",
    text: "text-gray-200",
    muted: "text-gray-400",
    canvasShadow: "shadow-xl shadow-black/50 ring-1 ring-white/5",
    icon: Moon,
    label: "Dark",
    hover: "hover:bg-white/5",
  },
};

export function PdfReader() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomMode, setZoomMode] = useState<ZoomMode>("fit-width");
  const [customScale, setCustomScale] = useState(1.0);
  const [theme, setTheme] = useState<ReadingTheme>("light");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const readerAreaRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const sessionKeyRef = useRef<string>("");
  const renderTasksRef = useRef<RenderTask[]>([]);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);

  const showTwoPages = containerWidth > 1024;

  const calculateScale = useCallback(() => {
    if (!pageDimensions) return 1;
    const padding = 48;
    const gap = 16;
    const targetWidth = showTwoPages
      ? (containerWidth - padding - gap) / 2
      : containerWidth - padding;

    switch (zoomMode) {
      case "fit-width":
        return Math.max(0.1, targetWidth / pageDimensions.width);
      case "fit-page": {
        const availHeight = containerHeight - 32;
        const widthScale = targetWidth / pageDimensions.width;
        const heightScale = availHeight / pageDimensions.height;
        return Math.max(0.1, Math.min(widthScale, heightScale));
      }
      case "custom":
        return Math.max(0.1, customScale);
      default:
        return 1;
    }
  }, [
    pageDimensions,
    containerWidth,
    containerHeight,
    showTwoPages,
    zoomMode,
    customScale,
  ]);

  const loadPdf = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      if (loadingTaskRef.current) await loadingTaskRef.current.destroy();
      renderTasksRef.current = [];

      const lib = await import("pdfjs-dist");
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = lib.getDocument({
        data: new Uint8Array(arrayBuffer),
      });
      loadingTaskRef.current = loadingTask;
      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setFileName(file.name);
      setZoomMode("fit-width");
      setCustomScale(1.0);

      const firstPage = await doc.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      setPageDimensions({
        width: viewport.width,
        height: viewport.height,
      });

      const key = `pdf-reader:${file.name}:${file.size}`;
      sessionKeyRef.current = key;
      const saved = sessionStorage.getItem(key);
      setCurrentPage(saved ? Math.min(parseInt(saved, 10), doc.numPages) : 1);
    } catch (err) {
      setError("Failed to load PDF. Please make sure it's a valid PDF file.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => {
      const step = showTwoPages ? 2 : 1;
      return Math.min(prev + step, totalPages);
    });
  }, [showTwoPages, totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => {
      const step = showTwoPages ? 2 : 1;
      return Math.max(prev - step, 1);
    });
  }, [showTwoPages]);

  const zoomIn = useCallback(() => {
    setZoomMode("custom");
    setCustomScale((s) => Math.min(s + 0.25, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomMode("custom");
    setCustomScale((s) => Math.max(s - 0.25, 0.25));
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => {
      const order: ReadingTheme[] = ["light", "sepia", "dark"];
      return order[(order.indexOf(prev) + 1) % 3];
    });
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await rootRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  const closePdf = useCallback(async () => {
    renderTasksRef.current.forEach((t) => {
      t?.cancel();
    });
    renderTasksRef.current = [];
    if (loadingTaskRef.current) await loadingTaskRef.current.destroy();
    loadingTaskRef.current = null;
    setPdfDoc(null);
    setTotalPages(0);
    setCurrentPage(1);
    setFileName("");
    setPageDimensions(null);
    setError(null);
    sessionKeyRef.current = "";
    if (document.fullscreenElement) await document.exitFullscreen();
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    if (!readerAreaRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(readerAreaRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdfDoc || !pageDimensions || containerWidth === 0) return;

    let cancelled = false;
    renderTasksRef.current.forEach((t) => {
      t?.cancel();
    });
    renderTasksRef.current = [];

    const renderScale = calculateScale();

    const render = async () => {
      try {
        if (leftCanvasRef.current && !cancelled) {
          const page = await pdfDoc.getPage(currentPage);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: renderScale });
          const canvas = leftCanvasRef.current;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const task = page.render({ canvas, viewport });
          renderTasksRef.current.push(task);
          await task.promise;
        }

        if (
          showTwoPages &&
          rightCanvasRef.current &&
          currentPage + 1 <= totalPages &&
          !cancelled
        ) {
          const page = await pdfDoc.getPage(currentPage + 1);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: renderScale });
          const canvas = rightCanvasRef.current;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const task = page.render({ canvas, viewport });
          renderTasksRef.current.push(task);
          await task.promise;
        }
      } catch (err: unknown) {
        const name = (err as { name?: string })?.name;
        if (name !== "RenderingCancelledException" && !cancelled) {
          console.error("Render error:", err);
        }
      }
    };

    render();

    return () => {
      cancelled = true;
      renderTasksRef.current.forEach((t) => {
        t?.cancel();
      });
      renderTasksRef.current = [];
    };
  }, [
    pdfDoc,
    currentPage,
    pageDimensions,
    containerWidth,
    showTwoPages,
    totalPages,
    calculateScale,
  ]);

  useEffect(() => {
    if (sessionKeyRef.current && totalPages > 0) {
      sessionStorage.setItem(sessionKeyRef.current, String(currentPage));
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!pdfDoc) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prevPage();
          break;
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          nextPage();
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "Home":
          e.preventDefault();
          goToPage(1);
          break;
        case "End":
          e.preventDefault();
          goToPage(totalPages);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    pdfDoc,
    prevPage,
    nextPage,
    zoomIn,
    zoomOut,
    toggleFullscreen,
    goToPage,
    totalPages,
  ]);

  useEffect(() => {
    return () => {
      renderTasksRef.current.forEach((t) => {
        t?.cancel();
      });
      loadingTaskRef.current?.destroy();
    };
  }, []);

  if (!pdfDoc) {
    return (
      <div className="w-full">
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
            <span>{error}</span>
          </div>
        )}
        <UploadDropzone
          accept="application/pdf,.pdf"
          maxSizeMB={200}
          title="Drop your PDF here, or browse"
          subtitle="Supports PDF files up to 200MB. 100% in-browser — your file never leaves your device."
          enableClipboardPaste={false}
          onFilesSelected={loadPdf}
        />
        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>Loading PDF...</span>
          </div>
        )}
      </div>
    );
  }

  const tc = THEME_CONFIG[theme];
  const ThemeIcon = tc.icon;
  const hasRightPage = showTwoPages && currentPage + 1 <= totalPages;
  const zoomLabel =
    zoomMode === "custom"
      ? `${Math.round(customScale * 100)}%`
      : zoomMode === "fit-width"
        ? "Fit W"
        : "Fit P";
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex flex-col rounded-2xl overflow-hidden transition-colors",
        tc.container,
        isFullscreen && "h-screen rounded-none",
      )}
    >
      {/* Toolbar */}
      <div
        className={cn(
          "flex items-center gap-1 px-3 py-2 flex-wrap",
          tc.toolbar,
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={closePdf}
          className={cn("size-8 shrink-0", tc.text, tc.hover)}
          title="Close PDF"
        >
          <X className="size-4" />
        </Button>
        <span
          className={cn(
            "text-xs font-medium truncate max-w-[100px] sm:max-w-[200px]",
            tc.muted,
          )}
        >
          {fileName}
        </span>

        <div className="flex-1" />

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevPage}
            disabled={currentPage <= 1}
            className={cn("size-8", tc.text, tc.hover, "disabled:opacity-30")}
            title="Previous page (←)"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className={cn("flex items-center gap-1 text-xs px-1", tc.text)}>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!Number.isNaN(v)) goToPage(v);
              }}
              className={cn(
                "w-10 text-center rounded bg-transparent outline-none px-1 text-xs",
                "ring-1 ring-inset ring-current/20 focus:ring-primary",
                tc.text,
              )}
            />
            <span className={tc.muted}>/ {totalPages}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className={cn("size-8", tc.text, tc.hover, "disabled:opacity-30")}
            title="Next page (→)"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex-1" />

        {/* Zoom + Theme + Fullscreen */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            className={cn("size-8", tc.text, tc.hover)}
            title="Zoom out (−)"
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setZoomMode(zoomMode === "fit-width" ? "fit-page" : "fit-width");
            }}
            className={cn("h-8 px-2 text-xs font-medium", tc.text, tc.hover)}
            title="Toggle fit mode"
          >
            {zoomLabel}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            className={cn("size-8", tc.text, tc.hover)}
            title="Zoom in (+)"
          >
            <ZoomIn className="size-4" />
          </Button>

          <div className={cn("w-px h-5 mx-0.5", tc.muted, "opacity-20")} />

          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className={cn("size-8", tc.text, tc.hover)}
            title={`Theme: ${tc.label}`}
          >
            <ThemeIcon className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className={cn("size-8", tc.text, tc.hover)}
            title="Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize className="size-4" />
            ) : (
              <Maximize className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Reader area */}
      <div
        ref={readerAreaRef}
        className={cn("relative flex-1 overflow-auto", tc.reader)}
        style={{
          maxHeight: isFullscreen ? "calc(100vh - 96px)" : "70vh",
        }}
      >
        <div className="flex justify-center items-start gap-4 p-6 sm:p-8 min-h-full">
          <canvas
            ref={leftCanvasRef}
            className={cn("my-auto rounded-sm bg-white", tc.canvasShadow)}
          />
          {hasRightPage && (
            <canvas
              ref={rightCanvasRef}
              className={cn("my-auto rounded-sm bg-white", tc.canvasShadow)}
            />
          )}
        </div>

        {/* Click zones */}
        <button
          type="button"
          className="absolute left-0 top-0 bottom-0 w-[15%] cursor-pointer z-10 bg-transparent border-0 p-0"
          onClick={prevPage}
          aria-label="Previous page"
        />
        <button
          type="button"
          className="absolute right-0 top-0 bottom-0 w-[15%] cursor-pointer z-10 bg-transparent border-0 p-0"
          onClick={nextPage}
          aria-label="Next page"
        />
      </div>

      {/* Page indicator */}
      <div
        className={cn(
          "flex items-center justify-center gap-3 px-4 py-2",
          tc.indicator,
        )}
      >
        <span className={cn("text-xs", tc.muted)}>
          Page {currentPage}
          {hasRightPage ? `–${currentPage + 1}` : ""} of {totalPages}
        </span>
        <div className="relative h-1 w-32 rounded-full overflow-hidden">
          <div
            className={cn("absolute inset-0 rounded-full bg-current", tc.muted)}
            style={{ opacity: 0.2 }}
          />
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full bg-current transition-all",
              tc.text,
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
