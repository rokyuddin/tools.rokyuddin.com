"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Search,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "./SearchDialog";
import { toolsRegistry } from "@/config/tools";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global hotkey Ctrl+K / Cmd+K / Slash to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement))
      ) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight text-foreground transition-colors hover:text-primary"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Wrench className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">ROKY TOOLS</span>
                <span className="text-[10px] font-mono text-muted-foreground font-normal tracking-wide">
                  tools.rokyuddin.com
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/tools"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50 rounded-md"
              >
                All Tools
              </Link>
              <Link
                href="/privacy"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50 rounded-md flex items-center gap-1"
              >
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Privacy
              </Link>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-44 sm:w-56 items-center justify-between rounded-lg border border-input bg-muted/40 px-3 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <Search className="size-3.5" />
                <span className="truncate">Search tools...</span>
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card p-4 space-y-2 animate-in slide-in-from-top-2">
            <Link
              href="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-muted"
            >
              All Tools ({toolsRegistry.length})
            </Link>
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-muted"
            >
              <ShieldCheck className="size-4 text-emerald-500" />
              Privacy Policy & Architecture
            </Link>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
