import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  Coins,
  FileArchive,
  FileType,
  Pipette,
  Maximize2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type ToolDefinition } from "@/config/tools";
import { cn } from "@/lib/utils";

const toolIcons: Record<string, React.ElementType> = {
  "whatsapp-link": MessageSquare,
  "bdt-to-words": Coins,
  "image-compressor": FileArchive,
  "image-to-webp": FileType,
  "color-extractor": Pipette,
  "social-resizer": Maximize2,
};

interface ToolCardProps {
  tool: ToolDefinition;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const IconComponent = toolIcons[tool.slug] || Sparkles;

  const categoryColorMap: Record<string, string> = {
    Images: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    Business: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Bangladesh: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    Developer: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  };

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md",
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
            <IconComponent className="size-6" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.isNew && (
              <Badge variant="info" className="text-[10px] uppercase tracking-wider">
                New
              </Badge>
            )}
            <span
              className={cn(
                "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                categoryColorMap[tool.category] || "bg-muted text-muted-foreground"
              )}
            >
              {tool.category}
            </span>
          </div>
        </div>

        <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
          {tool.name}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {tool.tagline}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {tool.badges.slice(0, 3).map((badge) => (
            <span
              key={badge}
              className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-primary pt-3 border-t border-border/50">
        <span>Use Tool</span>
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
