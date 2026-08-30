"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Code2,
  Trash2,
} from "lucide-react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { SizeGridPreview } from "./SizeGridPreview";
import { ContextMockups } from "./ContextMockups";
import { LegibilityWarnings } from "./LegibilityWarnings";
import { analyzeIconDimensions, generateHtmlFaviconSnippet, type IconAnalysis } from "../utils/icon-analyzer";
import { exportFaviconZipBundle } from "../utils/icon-exporter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { copyToClipboard } from "@/lib/utils";

export function FaviconTester() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [siteName, setSiteName] = useState("My Website");
  const [bgMode, setBgMode] = useState<"light" | "dark" | "slate" | "transparent">("transparent");
  const [activeTab, setActiveTab] = useState<"sizes" | "mockups" | "code">("mockups");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth || 512, height: img.naturalHeight || 512 });
    };
    img.src = url;
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setDimensions(null);
  };

  const analysis: IconAnalysis | null = useMemo(() => {
    if (!dimensions) return null;
    return analyzeIconDimensions(dimensions.width, dimensions.height);
  }, [dimensions]);

  const htmlSnippet = useMemo(() => {
    return generateHtmlFaviconSnippet(siteName);
  }, [siteName]);

  const handleCopyCode = async () => {
    const success = await copyToClipboard(htmlSnippet);
    if (success) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleExportZip = async () => {
    if (!imageSrc) return;
    setIsExporting(true);
    try {
      await exportFaviconZipBundle(imageSrc, siteName);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <div>
          <UploadDropzone
            onFilesSelected={handleFilesSelected}
            accept="image/*,.png,.svg,.jpg,.jpeg,.webp,.ico"
            title="Upload favicon or app icon"
            subtitle="Drop SVG or PNG to test on browser tabs and device mockups"
          />

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <defs>
                    <linearGradient id="omni-grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#3B82F6"/>
                      <stop offset="50%" stopColor="#6366F1"/>
                      <stop offset="100%" stopColor="#8B5CF6"/>
                    </linearGradient>
                  </defs>
                  <rect width="512" height="512" rx="128" fill="url(#omni-grad)"/>
                  <path d="M144 192L256 128L368 192V320L256 384L144 320V192Z" stroke="#FFFFFF" stroke-width="24" stroke-linejoin="round" fill="#38BDF8" fill-opacity="0.25"/>
                  <path d="M256 128V384" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round"/>
                  <path d="M144 256H368" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round"/>
                  <circle cx="256" cy="256" r="32" fill="#FFFFFF"/>
                </svg>`;
                const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
                setImageSrc(url);
                setDimensions({ width: 512, height: 512 });
                setSiteName("OmniTools");
              }}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium cursor-pointer"
            >
              <Sparkles className="size-3.5" />
              Try sample logo icon
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative size-14 rounded-xl border border-border bg-muted/60 p-2 shrink-0 shadow-inner flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="Uploaded icon"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Favicon Preview
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    {dimensions?.width} × {dimensions?.height} px
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Field orientation="horizontal" className="gap-2">
                    <FieldLabel htmlFor="site-title" className="text-xs text-muted-foreground font-medium shrink-0">
                      Title:
                    </FieldLabel>
                    <Input
                      id="site-title"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="My Website"
                      className="h-8 text-xs max-w-[180px]"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Actions & Export */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-border">
              {/* Background selector */}
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setBgMode("light")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    bgMode === "light" ? "bg-white text-black shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode("dark")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    bgMode === "dark" ? "bg-zinc-950 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode("transparent")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    bgMode === "transparent" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Grid
                </button>
              </div>

              <Button
                size="sm"
                onClick={handleExportZip}
                disabled={isExporting}
                className="gap-1.5 text-xs cursor-pointer h-8"
              >
                <Download className="size-3.5" />
                {isExporting ? "Exporting..." : "Download ZIP"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer h-8"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("mockups")}
              className={`pb-2.5 px-4 transition-colors cursor-pointer border-b-2 font-semibold ${
                activeTab === "mockups"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Mockups
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sizes")}
              className={`pb-2.5 px-4 transition-colors cursor-pointer border-b-2 font-semibold ${
                activeTab === "sizes"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Size Grid
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={`pb-2.5 px-4 transition-colors cursor-pointer border-b-2 font-semibold flex items-center gap-1.5 ${
                activeTab === "code"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code2 className="size-3.5" />
              HTML Tags
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "mockups" && (
            <ContextMockups imageSrc={imageSrc} siteName={siteName} />
          )}

          {activeTab === "sizes" && (
            <SizeGridPreview imageSrc={imageSrc} bgMode={bgMode} />
          )}

          {activeTab === "code" && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                <h3 className="font-heading text-sm font-bold text-foreground">
                  HTML Tags
                </h3>
                <Button
                  size="sm"
                  onClick={handleCopyCode}
                  className="gap-1.5 text-xs cursor-pointer h-8"
                >
                  {copiedCode ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copiedCode ? "Copied!" : "Copy"}
                </Button>
              </div>

              <pre className="overflow-x-auto rounded-xl bg-muted/60 p-3.5 font-mono text-xs text-foreground leading-relaxed">
                {htmlSnippet}
              </pre>
            </div>
          )}

          {/* Smart Warnings */}
          {analysis && <LegibilityWarnings analysis={analysis} />}
        </div>
      )}
    </div>
  );
}
