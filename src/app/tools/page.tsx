"use client";

import React, { useState, useMemo } from "react";
import { Search, Sparkles } from "lucide-react";
import { ToolCard } from "@/components/tool-shell/ToolCard";
import {
  toolsRegistry,
  type ToolCategory,
} from "@/config/tools";
import { cn } from "@/lib/utils";

const categories: Array<"All" | ToolCategory> = [
  "All",
  "Images",
  "Developer",
  "General",
  "Business",
  "Bangladesh",
  "Documents",
];

export default function ToolsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | ToolCategory>("All");

  const filteredTools = useMemo(() => {
    return toolsRegistry.filter((tool) => {
      const matchesCategory =
        selectedCategory === "All" || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tagline.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center max-w-xl mx-auto">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          All Tools
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fast, privacy-first tools that run in your browser.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-2xl mx-auto">
        <div className="relative w-full sm:w-72">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="py-14 text-center rounded-2xl border border-dashed border-border bg-card max-w-md mx-auto">
          <Sparkles className="size-8 mx-auto text-muted-foreground/50 mb-2" />
          <h3 className="text-sm font-semibold text-foreground">
            No tools found for &quot;{searchQuery}&quot;
          </h3>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
