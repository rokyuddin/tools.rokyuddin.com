"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, CornerDownLeft, Sparkles } from "lucide-react";
import { toolsRegistry, type ToolDefinition } from "@/config/tools";
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredTools = useMemo(() => {
    if (!query.trim()) return toolsRegistry;
    const q = query.toLowerCase().trim();
    return toolsRegistry.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tagline.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Header */}
        <div className="flex items-center px-4 border-b border-border">
          <Search className="size-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools... (e.g. compress, whatsapp, bdt, color)"
            className="w-full bg-transparent px-3 py-4 text-base outline-none placeholder:text-muted-foreground text-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md"
            >
              <X className="size-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border ml-2">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-border/40">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Sparkles className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No tools found matching &quot;{query}&quot;</p>
              <p className="text-xs mt-1">Try searching for &quot;compress&quot;, &quot;whatsapp&quot;, &quot;taka&quot; or &quot;color&quot;</p>
            </div>
          ) : (
            filteredTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/60 transition-colors group"
              >
                <div className="flex flex-col gap-0.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {tool.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {tool.tagline}
                  </p>
                </div>
                <div className="flex items-center text-xs text-muted-foreground group-hover:text-primary shrink-0">
                  <span className="hidden sm:inline mr-1 text-[11px]">Open</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-t border-border text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>Navigation:</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">
                <CornerDownLeft className="size-2.5 inline" />
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span>{filteredTools.length} tools available</span>
        </div>
      </div>
    </div>
  );
}
