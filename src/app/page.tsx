"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Heart,
  ArrowRight,
  TrendingUp,
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
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-6 shadow-xs">
            <Sparkles className="size-3.5" />
            <span>Fast, Free & 100% Privacy-Friendly</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">
            Simple tools for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary to-sky-600 bg-clip-text text-transparent">
              small everyday problems.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-xl text-muted-foreground leading-relaxed">
            Free. Fast. No signup. No cookies. All calculations and file conversions process directly in your browser.
          </p>

          {/* Quick Search Bar */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative flex items-center shadow-lg rounded-2xl border border-border bg-card overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
              <Search className="size-5 text-muted-foreground ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. compress image, whatsapp link, taka to words)..."
                className="w-full bg-transparent px-3 py-4 text-sm sm:text-base outline-none placeholder:text-muted-foreground text-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-3 text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 bg-muted rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Tool Grid Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* If filtering by search/category */}
        {searchQuery || selectedCategory !== "All" ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Search Results ({filteredTools.length})
              </h2>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="text-xs text-primary font-medium hover:underline"
              >
                Reset Filters
              </button>
            </div>

            {filteredTools.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-card">
                <Sparkles className="size-10 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="text-base font-semibold text-foreground">
                  No matching tools found
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Try searching for keywords like &quot;whatsapp&quot;, &quot;compress&quot;, &quot;webp&quot;, or &quot;bdt&quot;.
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
        ) : (
          /* Default Browse View: Popular + All Categories */
          <div className="space-y-16">
            {/* Popular Tools */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  <h2 className="font-heading text-2xl font-bold text-foreground">
                    Popular Tools
                  </h2>
                </div>
                <Link
                  href="/tools"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Explore all</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {popularTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </div>

            {/* Category Cluster: Images */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-6 pb-2 border-b border-border">
                <h3 className="font-heading text-xl font-bold text-foreground">
                  Image & Media Utilities
                </h3>
                <span className="text-xs text-muted-foreground">
                  100% client-side compression & conversion
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {toolsRegistry
                  .filter((t) => t.category === "Images")
                  .map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
              </div>
            </div>

            {/* Category Cluster: Business & Bangladesh */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-6 pb-2 border-b border-border">
                <h3 className="font-heading text-xl font-bold text-foreground">
                  Business & Regional Tools
                </h3>
                <span className="text-xs text-muted-foreground">
                  Streamlined chat links & currency formats
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Why Roky Tools Value Props */}
      <section className="border-y border-border/60 bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Built for speed and complete privacy
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Designed as a pure utility platform with zero unnecessary overhead.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col p-6 rounded-2xl bg-card border border-border">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Zap className="size-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground mb-1">
                Zero Signup
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No accounts, no email verification, and no passwords. Arrive, solve your task, and leave.
              </p>
            </div>

            <div className="flex flex-col p-6 rounded-2xl bg-card border border-border">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground mb-1">
                100% In-Browser Privacy
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Images, text, and data are processed locally in your browser. Nothing is uploaded to remote servers.
              </p>
            </div>

            <div className="flex flex-col p-6 rounded-2xl bg-card border border-border">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
                <Lock className="size-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground mb-1">
                No Paywalls
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Completely free to use without hidden limits, trial countdowns, or watermarks.
              </p>
            </div>

            <div className="flex flex-col p-6 rounded-2xl bg-card border border-border">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-4">
                <Heart className="size-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground mb-1">
                Community Supported
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Maintained through voluntary creator support on SupportKori instead of intrusive popups.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
