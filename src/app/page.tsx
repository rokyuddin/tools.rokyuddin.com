"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
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

export default function HomePage() {
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

  const popularTools = useMemo(() => {
    return toolsRegistry.filter((tool) => tool.popular);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Simple, fast tools for{" "}
            <span className="bg-gradient-to-r from-primary to-sky-600 bg-clip-text text-transparent">
              everyday work.
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
            Free and privacy-first. Everything runs directly in your browser.
          </p>

          {/* Quick Search Bar */}
          <div className="mx-auto mt-6 max-w-lg">
            <div className="relative flex items-center rounded-xl border border-border bg-card shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
              <Search className="size-4 text-muted-foreground ml-3.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full bg-transparent px-3 py-3 text-sm sm:text-base outline-none placeholder:text-muted-foreground text-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-3 text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 bg-muted rounded-md cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Tool Grid Section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* If filtering by search/category */}
        {searchQuery || selectedCategory !== "All" ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Results ({filteredTools.length})
              </h2>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="text-xs text-primary font-medium hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            {filteredTools.length === 0 ? (
              <div className="py-14 text-center rounded-2xl border border-dashed border-border bg-card">
                <Sparkles className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                <h3 className="text-sm font-semibold text-foreground">
                  No matching tools found
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
        ) : (
          /* Default Browse View */
          <div className="space-y-12">
            {/* Popular Tools */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Popular Tools
                  </h2>
                </div>
                <Link
                  href="/tools"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>All tools</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {popularTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </div>

            {/* Images Category */}
            <div>
              <div className="mb-5 pb-2 border-b border-border">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Image &amp; Media
                </h3>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {toolsRegistry
                  .filter((t) => t.category === "Images")
                  .map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
              </div>
            </div>

            {/* Business & Bangladesh */}
            <div>
              <div className="mb-5 pb-2 border-b border-border">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Business &amp; Regional
                </h3>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {toolsRegistry
                  .filter(
                    (t) => t.category === "Business" || t.category === "Bangladesh"
                  )
                  .map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
