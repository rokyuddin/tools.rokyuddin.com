"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Download,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";
import type { RenamedFileItem } from "../utils/rename-engine";
import { downloadSingleFile } from "../utils/zip-downloader";

interface RenameDiffTableProps {
  items: RenamedFileItem[];
  onRemoveFile: (index: number) => void;
}

export function RenameDiffTable({ items, onRemoveFile }: RenameDiffTableProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.originalName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.newName.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const duplicateCount = items.filter((i) => i.isDuplicate).length;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-base font-bold text-foreground">
            Live Renaming Preview ({items.length} files)
          </h3>
          {duplicateCount > 0 && (
            <Badge variant="destructive" className="gap-1 text-[11px]">
              <AlertTriangle className="size-3" />
              {duplicateCount} Duplicate Names Flagged
            </Badge>
          )}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter files..."
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-border/60">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 text-xs transition-colors hover:bg-muted/40 ${
              item.isDuplicate ? "bg-rose-500/5 dark:bg-rose-950/20" : ""
            }`}
          >
            {/* Left: Original Name */}
            <div className="flex items-center gap-2.5 min-w-0 sm:w-5/12 mb-2 sm:mb-0">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 truncate">
                <span className="font-mono text-muted-foreground truncate block">
                  {item.originalName}
                </span>
                <span className="text-[10px] text-muted-foreground/70">
                  {formatBytes(item.file.size)}
                </span>
              </div>
            </div>

            {/* Middle: Arrow */}
            <div className="hidden sm:flex items-center justify-center shrink-0 text-muted-foreground px-2">
              <ArrowRight className="size-3.5" />
            </div>

            {/* Right: New Name & Status */}
            <div className="flex items-center justify-between gap-3 min-w-0 sm:w-6/12">
              <div className="min-w-0 truncate">
                <span
                  className={`font-mono font-bold truncate block ${
                    item.isDuplicate
                      ? "text-rose-600 dark:text-rose-400"
                      : item.hasChanged
                        ? "text-primary"
                        : "text-foreground"
                  }`}
                >
                  {item.newName}
                </span>
                {item.isDuplicate && (
                  <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="size-2.5" />
                    Conflict: Multiple files share this name
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  type="button"
                  title="Download single renamed file"
                  onClick={() => downloadSingleFile(item.file, item.newName)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  <Download className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Remove from list"
                  onClick={() => onRemoveFile(index)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
