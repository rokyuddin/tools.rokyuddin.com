"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Trash2,
  Sliders,
  Mail,
  Phone,
  User,
  FileText,
} from "lucide-react";
import {
  cleanText,
  DEFAULT_CLEANER_OPTIONS,
  CLEAN_EVERYTHING_OPTIONS,
  type CleanerOptions,
} from "../utils/cleaner-engine";
import {
  cleanEmailList,
  cleanPhoneList,
  cleanNamesList,
} from "../utils/specialized-cleaners";
import { CleanupStatsCard } from "./CleanupStatsCard";
import { Button } from "@/components/ui/button";
import { copyToClipboard, triggerDownload } from "@/lib/utils";

type CleaningMode = "general" | "email" | "phone" | "names";

export function TextCleaner() {
  const [inputText, setInputText] = useState("");
  const [options, setOptions] = useState<CleanerOptions>(DEFAULT_CLEANER_OPTIONS);
  const [mode, setMode] = useState<CleaningMode>("general");
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const { cleanedOutput, statsComponent } = useMemo(() => {
    if (!inputText) {
      return { cleanedOutput: "", statsComponent: null };
    }

    if (mode === "email") {
      const { cleanedText, count, duplicates } = cleanEmailList(inputText);
      return {
        cleanedOutput: cleanedText,
        statsComponent: (
          <div className="rounded-xl border border-border bg-card p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                Email Extractor &amp; Deduplication
              </span>
              <span className="font-mono font-bold text-primary">
                {count} unique ({duplicates} duplicates removed)
              </span>
            </div>
          </div>
        ),
      };
    }

    if (mode === "phone") {
      const { cleanedText, count, duplicates } = cleanPhoneList(inputText);
      return {
        cleanedOutput: cleanedText,
        statsComponent: (
          <div className="rounded-xl border border-border bg-card p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                Phone Normalizer
              </span>
              <span className="font-mono font-bold text-primary">
                {count} cleaned ({duplicates} duplicates removed)
              </span>
            </div>
          </div>
        ),
      };
    }

    if (mode === "names") {
      const { cleanedText, count, duplicates } = cleanNamesList(inputText);
      return {
        cleanedOutput: cleanedText,
        statsComponent: (
          <div className="rounded-xl border border-border bg-card p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                Name Formatter
              </span>
              <span className="font-mono font-bold text-primary">
                {count} formatted ({duplicates} duplicates removed)
              </span>
            </div>
          </div>
        ),
      };
    }

    // General text cleaning
    const { cleanedText, metrics } = cleanText(inputText, options);
    return {
      cleanedOutput: cleanedText,
      statsComponent: <CleanupStatsCard metrics={metrics} />,
    };
  }, [inputText, options, mode]);

  const handleCleanEverything = () => {
    setMode("general");
    setOptions(CLEAN_EVERYTHING_OPTIONS);
  };

  const handleCopy = async () => {
    if (!cleanedOutput) return;
    const ok = await copyToClipboard(cleanedOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!cleanedOutput) return;
    const blob = new Blob([cleanedOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, "cleaned-text.txt");
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    if (mode === "email") {
      setInputText(
        `Contact list:\nJohn Doe <john.doe@example.com>\nJANE@EXAMPLE.COM\n  john.doe@example.com  \nsupport@company.org\ninfo@company.org\nJANE@EXAMPLE.COM\n`
      );
    } else if (mode === "phone") {
      setInputText(
        `+1 (555) 234-5678\n555.234.5678\n  +1-555-234-5678  \n+880 1712-345678\n01712345678\n`
      );
    } else if (mode === "names") {
      setInputText(
        `rahim uddin\nFATIMA BEGUM\n  tariqul  islam \nrahim uddin\njohn m. doe\n`
      );
    } else {
      setInputText(
        `  Here is some   messy text   from an email or PDF document.\n\n\nIt contains “smart curly quotes”, ‘apostrophes’, and em—dashes.\n\n\nAlso has duplicate blank lines and trailing spaces.   \nAlso has duplicate blank lines and trailing spaces.   \n`
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Bar: Mode Selector & Hero Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        {/* Mode switcher tabs */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("general")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
              mode === "general"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="size-3.5" />
            General
          </button>
          <button
            type="button"
            onClick={() => setMode("email")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
              mode === "email"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="size-3.5" />
            Emails
          </button>
          <button
            type="button"
            onClick={() => setMode("phone")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
              mode === "phone"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Phone className="size-3.5" />
            Phones
          </button>
          <button
            type="button"
            onClick={() => setMode("names")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
              mode === "names"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="size-3.5" />
            Names
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
          <Button
            size="sm"
            onClick={handleCleanEverything}
            className="gap-1.5 text-xs font-bold shadow-xs cursor-pointer h-9"
          >
            <Sparkles className="size-3.5" />
            Clean All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOptions(!showOptions)}
            className="gap-1.5 text-xs cursor-pointer h-9"
          >
            <Sliders className="size-3.5" />
            {showOptions ? "Hide" : "Options"}
          </Button>
        </div>
      </div>

      {/* Granular Options Drawer */}
      {showOptions && mode === "general" && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 animate-in fade-in duration-200">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Rules
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.collapseSpaces}
                onChange={(e) => setOptions({ ...options, collapseSpaces: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary size-4"
              />
              <span>Collapse spaces</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.trimLines}
                onChange={(e) => setOptions({ ...options, trimLines: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary size-4"
              />
              <span>Trim line edges</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.collapseBlankLines}
                onChange={(e) => setOptions({ ...options, collapseBlankLines: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary size-4"
              />
              <span>Collapse empty lines</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.removeEmptyLines}
                onChange={(e) => setOptions({ ...options, removeEmptyLines: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary size-4"
              />
              <span>Remove all blank lines</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.removeDuplicateLines}
                onChange={(e) => setOptions({ ...options, removeDuplicateLines: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary size-4"
              />
              <span>Remove duplicates</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.normalizeQuotes}
                onChange={(e) => setOptions({ ...options, normalizeQuotes: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary size-4"
              />
              <span>Normalize curly quotes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.normalizeDashes}
                onChange={(e) => setOptions({ ...options, normalizeDashes: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary size-4"
              />
              <span>Normalize dashes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.removeInvisibleChars}
                onChange={(e) => setOptions({ ...options, removeInvisibleChars: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary size-4"
              />
              <span>Strip invisible chars</span>
            </label>
          </div>
        </div>
      )}

      {/* Editor Side-by-Side Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Input */}
        <div className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-bold text-foreground">
                Input
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                ({inputText.length} chars)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadSample}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                Sample
              </button>
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText("")}
                  className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                  title="Clear input"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text here..."
            rows={12}
            className="w-full resize-y rounded-xl border-0 bg-transparent p-2 font-mono text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed"
          />
        </div>

        {/* Right: Clean Output */}
        <div className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-bold text-foreground">
                Cleaned
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                ({cleanedOutput.length} chars)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!cleanedOutput}
                onClick={handleCopy}
                className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                {copied ? "Copied!" : "Copy"}
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={!cleanedOutput}
                onClick={handleDownload}
                className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer"
              >
                <Download className="size-3" />
                .txt
              </Button>
            </div>
          </div>

          <textarea
            readOnly
            value={cleanedOutput}
            placeholder="Cleaned output will appear here..."
            rows={12}
            className="w-full resize-y rounded-xl border-0 bg-transparent p-2 font-mono text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Metrics Banner */}
      {statsComponent}
    </div>
  );
}
