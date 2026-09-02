import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, Coffee, ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";
import { toolsRegistry } from "@/config/tools";
import { Logo } from "./Logo";

export function Footer() {
  const categories = ["Images", "Business", "Bangladesh", "Documents"] as const;

  return (
    <footer className="mt-auto border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Logo size="sm" showDomain={false} />

            <p className="text-xs text-muted-foreground leading-relaxed">
              Simple, fast, free online tools for everyday problems. 100% privacy-friendly, zero server uploads, and no sign-up required.
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs border border-emerald-500/20 font-medium">
              <ShieldCheck className="size-3.5" />
              <span>100% In-Browser Execution</span>
            </div>
          </div>

          {/* Categories Columns */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const catTools = toolsRegistry.filter((t) => t.category === cat);
              return (
                <div key={cat} className="space-y-3">
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                    {cat}
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {catTools.map((t) => (
                      <li key={t.slug}>
                        <Link
                          href={`/tools/${t.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {t.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Creator & Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
              About
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Designed & developed by{" "}
              <a
                href={siteConfig.creator.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                {siteConfig.creator.name}
              </a>
              .
            </p>
            <div className="pt-1">
              <Link
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Privacy & Data Architecture
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} OmniTools — tools.rokyuddin.com. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with care by</span>
            <a
              href={siteConfig.creator.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium hover:text-primary"
            >
              {siteConfig.creator.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
