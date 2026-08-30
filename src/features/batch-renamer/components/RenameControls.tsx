"use client";

import React from "react";
import { Sliders, Hash, Type, Search, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RenameOptions, CaseTransform, SpaceHandling, NumberingMode } from "../utils/rename-engine";

interface RenameControlsProps {
  options: RenameOptions;
  onChange: (newOptions: RenameOptions) => void;
}

export function RenameControls({ options, onChange }: RenameControlsProps) {
  const update = (partial: Partial<RenameOptions>) => {
    onChange({ ...options, ...partial });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Sliders className="size-4 text-primary" />
        <h3 className="font-heading text-base font-bold text-foreground">
          Renaming Rules &amp; Patterns
        </h3>
      </div>

      {/* Row 1: Prefix & Suffix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="prefix-input" className="text-xs font-semibold">
            Add Prefix
          </Label>
          <Input
            id="prefix-input"
            value={options.prefix}
            onChange={(e) => update({ prefix: e.target.value })}
            placeholder="e.g. vacation- or photo_"
            className="mt-1 text-xs"
          />
        </div>

        <div>
          <Label htmlFor="suffix-input" className="text-xs font-semibold">
            Add Suffix
          </Label>
          <Input
            id="suffix-input"
            value={options.suffix}
            onChange={(e) => update({ suffix: e.target.value })}
            placeholder="e.g. -edited or _final"
            className="mt-1 text-xs"
          />
        </div>
      </div>

      {/* Row 2: Sequential Numbering */}
      <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Hash className="size-4 text-primary" />
          <Label className="text-xs font-bold text-foreground">
            Sequential Numbering
          </Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <Label className="text-[11px] text-muted-foreground">Placement</Label>
            <select
              value={options.numberingMode}
              onChange={(e) => update({ numberingMode: e.target.value as NumberingMode })}
              className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="none">Disabled</option>
              <option value="suffix">Append at end (name-001)</option>
              <option value="prefix">Prepend at start (001-name)</option>
              <option value="replace">Replace whole name (001)</option>
            </select>
          </div>

          <div>
            <Label className="text-[11px] text-muted-foreground">Start At</Label>
            <Input
              type="number"
              min="0"
              value={options.numberStart}
              onChange={(e) => update({ numberStart: parseInt(e.target.value) || 1 })}
              disabled={options.numberingMode === "none"}
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label className="text-[11px] text-muted-foreground">Increment Step</Label>
            <Input
              type="number"
              min="1"
              value={options.numberStep}
              onChange={(e) => update({ numberStep: parseInt(e.target.value) || 1 })}
              disabled={options.numberingMode === "none"}
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label className="text-[11px] text-muted-foreground">Zero Padding</Label>
            <select
              value={options.numberPadding}
              onChange={(e) => update({ numberPadding: parseInt(e.target.value) || 1 })}
              disabled={options.numberingMode === "none"}
              className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="1">1 (1, 2, 3)</option>
              <option value="2">2 digits (01, 02)</option>
              <option value="3">3 digits (001, 002)</option>
              <option value="4">4 digits (0001, 0002)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 3: Find & Replace */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="find-input" className="text-xs font-semibold flex items-center gap-1">
            <Search className="size-3" />
            Find Text
          </Label>
          <Input
            id="find-input"
            value={options.findText}
            onChange={(e) => update({ findText: e.target.value })}
            placeholder="e.g. IMG_ or DSC_"
            className="mt-1 text-xs"
          />
        </div>

        <div>
          <Label htmlFor="replace-input" className="text-xs font-semibold">
            Replace With
          </Label>
          <Input
            id="replace-input"
            value={options.replaceText}
            onChange={(e) => update({ replaceText: e.target.value })}
            placeholder="e.g. trip-photo- or empty to delete"
            className="mt-1 text-xs"
          />
        </div>
      </div>

      {/* Row 4: Casing, Spaces & Extensions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-4">
        <div>
          <Label className="text-xs font-semibold">Case Conversion</Label>
          <select
            value={options.caseTransform}
            onChange={(e) => update({ caseTransform: e.target.value as CaseTransform })}
            className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="none">Keep Original Case</option>
            <option value="lowercase">lowercase</option>
            <option value="uppercase">UPPERCASE</option>
            <option value="titlecase">Title Case</option>
            <option value="kebabcase">kebab-case</option>
            <option value="snakecase">snake_case</option>
            <option value="camelcase">camelCase</option>
          </select>
        </div>

        <div>
          <Label className="text-xs font-semibold">Spaces</Label>
          <select
            value={options.spaceHandling}
            onChange={(e) => update({ spaceHandling: e.target.value as SpaceHandling })}
            className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="keep">Keep Spaces</option>
            <option value="remove">Remove Spaces</option>
            <option value="dash">Replace with &apos;-&apos;</option>
            <option value="underscore">Replace with &apos;_&apos;</option>
          </select>
        </div>

        <div>
          <Label className="text-xs font-semibold">File Extension</Label>
          <select
            value={options.extensionTransform}
            onChange={(e) => update({ extensionTransform: e.target.value as any })}
            className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="original">Keep Original (.JPG / .png)</option>
            <option value="lowercase">Lowercase (.jpg / .png)</option>
            <option value="uppercase">Uppercase (.JPG / .PNG)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
