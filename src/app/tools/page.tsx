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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          All Free Online Tools
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Explore our collection of fast, browser-powered utility tools. No signup or installation required.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
        <div className="relative w-full sm:w-80">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
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
        <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-card max-w-xl mx-auto">
          <Sparkles className="size-10 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-semibold text-foreground">
            No tools found for &quot;{searchQuery}&quot;
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or choosing another category filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
