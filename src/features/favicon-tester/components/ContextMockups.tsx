"use client";

import React, { useState } from "react";
import {
  Globe,
  Plus,
  X,
  Star,
  Search,
  Lock,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  MoreVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface ContextMockupsProps {
  imageSrc: string;
  siteName: string;
}

export function ContextMockups({ imageSrc, siteName }: ContextMockupsProps) {
  const [tabTheme, setTabTheme] = useState<"light" | "dark">("dark");
  const displayTitle = siteName || "My Awesome Project";
  const displayDomain = `${siteName.toLowerCase().replace(/[^a-z0-9]/g, "") || "mywebsite"}.com`;

  return (
    <div className="space-y-6">
      {/* 1. Realistic Browser Tab Simulation */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">1. Browser Tab Simulation</span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              (How users see your site among 20 tabs)
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setTabTheme("light")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                tabTheme === "light" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Light Chrome
            </button>
            <button
              type="button"
              onClick={() => setTabTheme("dark")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                tabTheme === "dark" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dark Chrome
            </button>
          </div>
        </div>

        {/* Browser Chrome Mockup */}
        <div
          className={`p-4 transition-colors ${
            tabTheme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-slate-200 text-slate-900"
          }`}
        >
          {/* Top window buttons + tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="size-2.5 rounded-full bg-rose-500" />
              <span className="size-2.5 rounded-full bg-amber-500" />
              <span className="size-2.5 rounded-full bg-emerald-500" />
            </div>

            {/* Active Tab */}
            <div
              className={`flex items-center gap-2 rounded-t-lg px-3 py-2 text-xs font-medium max-w-[200px] sm:max-w-[240px] shadow-xs ${
                tabTheme === "dark" ? "bg-zinc-800 text-white" : "bg-white text-slate-900"
              }`}
            >
              <img
                src={imageSrc}
                alt="Tab Favicon"
                className="size-4 shrink-0 object-contain rounded-xs"
              />
              <span className="truncate">{displayTitle}</span>
              <X className="size-3 ml-auto text-muted-foreground shrink-0 opacity-70" />
            </div>

            {/* Inactive Tab */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground max-w-[160px] opacity-70">
              <Globe className="size-3.5 shrink-0" />
              <span className="truncate">Another Tab</span>
            </div>

            <button type="button" className="p-1 text-muted-foreground hover:text-foreground">
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* Address Bar */}
          <div
            className={`mt-1 flex items-center gap-2 rounded-b-lg rounded-tr-lg px-3 py-2 text-xs shadow-inner ${
              tabTheme === "dark" ? "bg-zinc-800 text-zinc-300" : "bg-white text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 text-muted-foreground mr-1">
              <ArrowLeft className="size-3.5" />
              <ArrowRight className="size-3.5 opacity-40" />
              <RotateCw className="size-3.5" />
            </div>

            <div
              className={`flex flex-1 items-center gap-2 rounded-md px-2.5 py-1 text-xs ${
                tabTheme === "dark" ? "bg-zinc-950/60 text-zinc-300" : "bg-slate-100 text-slate-800"
              }`}
            >
              <Lock className="size-3 text-emerald-500 shrink-0" />
              <span className="truncate font-mono">
                https://{displayDomain}/
              </span>
              <Star className="size-3 text-muted-foreground ml-auto shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Bookmarks Bar + Google SERP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookmarks Bar Simulation */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h4 className="font-heading text-sm font-bold text-foreground mb-1">
            2. Bookmarks Bar Preview
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            How your site appears pinned on a user&apos;s bookmarks bar.
          </p>

          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-foreground shadow-xs">
                <img
                  src={imageSrc}
                  alt="Bookmark Favicon"
                  className="size-4 object-contain rounded-xs"
                />
                <span className="truncate max-w-[140px]">{displayTitle}</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                <span className="size-3.5 rounded-full bg-blue-500 inline-block" />
                <span>GitHub</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                <span className="size-3.5 rounded-full bg-red-500 inline-block" />
                <span>YouTube</span>
              </div>
            </div>
          </div>
        </div>

        {/* Google SERP Search Snippet */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h4 className="font-heading text-sm font-bold text-foreground mb-1">
            3. Google Search Result (SERP)
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Favicon displayed beside organic search listings on mobile & desktop.
          </p>

          <div className="rounded-xl border border-border bg-background p-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-full bg-muted border border-border shadow-xs shrink-0 overflow-hidden">
                <img
                  src={imageSrc}
                  alt="SERP Favicon"
                  className="size-4 object-contain"
                />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-foreground truncate max-w-[200px]">
                  {displayTitle}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono truncate">
                  https://{displayDomain}
                </div>
              </div>
              <MoreVertical className="size-3.5 text-muted-foreground ml-auto" />
            </div>

            <div className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              {displayTitle} — Fast, Simple & Free Online Utilities
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Discover why thousands of users use {displayTitle}. Process files directly in the browser with 100% privacy and zero installation.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Mobile iOS & Android Home Screen Tiles */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h4 className="font-heading text-sm font-bold text-foreground mb-1">
          4. Mobile Home Screen Mockup (iOS & Android PWA)
        </h4>
        <p className="text-xs text-muted-foreground mb-4">
          How the app icon appears on phone home screens with apple-touch-icon corner radius.
        </p>

        <div className="rounded-xl border border-border bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-6 text-white">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {/* iOS Style (Squircle) */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="relative size-16 overflow-hidden rounded-[15px] border border-white/20 bg-black/40 shadow-xl backdrop-blur-xs flex items-center justify-center p-2">
                <img
                  src={imageSrc}
                  alt="iOS App Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-medium text-white/90 drop-shadow-xs max-w-[80px] truncate">
                {displayTitle}
              </span>
              <span className="text-[10px] text-white/50">iOS (Squircle)</span>
            </div>

            {/* Android Style (Adaptive Circle) */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="relative size-16 overflow-hidden rounded-full border border-white/20 bg-white shadow-xl flex items-center justify-center p-2.5">
                <img
                  src={imageSrc}
                  alt="Android App Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-medium text-white/90 drop-shadow-xs max-w-[80px] truncate">
                {displayTitle}
              </span>
              <span className="text-[10px] text-white/50">Android (Circle)</span>
            </div>

            {/* macOS Dock Tile */}
            <div className="hidden sm:flex flex-col items-center gap-1.5 text-center">
              <div className="relative size-16 overflow-hidden rounded-xl border border-white/10 bg-slate-800/80 shadow-2xl backdrop-blur-md flex items-center justify-center p-2">
                <img
                  src={imageSrc}
                  alt="macOS Dock Icon"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <span className="text-xs font-medium text-white/90 drop-shadow-xs max-w-[80px] truncate">
                {displayTitle}
              </span>
              <span className="text-[10px] text-white/50">macOS Dock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
