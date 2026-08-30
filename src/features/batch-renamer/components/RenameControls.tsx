"use client";

import React from "react";
import { Sliders, Hash, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/field";
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
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Sliders className="size-4 text-primary" />
        <h3 className="font-heading text-base font-bold text-foreground">
          Renaming Rules
        </h3>
      </div>

      <FieldGroup className="gap-5">
        {/* Row 1: Prefix & Suffix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="prefix-input">Add Prefix</FieldLabel>
            <Input
              id="prefix-input"
              value={options.prefix}
              onChange={(e) => update({ prefix: e.target.value })}
              placeholder="e.g. photo-"
              className="h-11"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="suffix-input">Add Suffix</FieldLabel>
            <Input
              id="suffix-input"
              value={options.suffix}
              onChange={(e) => update({ suffix: e.target.value })}
              placeholder="e.g. -edited"
              className="h-11"
            />
          </Field>
        </div>

        {/* Row 2: Sequential Numbering */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="size-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              Sequential Numbering
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Field>
              <FieldLabel className="text-xs">Placement</FieldLabel>
              <select
                aria-label="Numbering Placement"
                value={options.numberingMode}
                onChange={(e) => update({ numberingMode: e.target.value as NumberingMode })}
                className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="none">Disabled</option>
                <option value="suffix">Append (name-001)</option>
                <option value="prefix">Prepend (001-name)</option>
                <option value="replace">Replace whole name (001)</option>
              </select>
            </Field>

            <Field>
              <FieldLabel className="text-xs">Start At</FieldLabel>
              <Input
                type="number"
                min="0"
                value={options.numberStart}
                onChange={(e) => update({ numberStart: parseInt(e.target.value) || 1 })}
                disabled={options.numberingMode === "none"}
                className="h-11"
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">Step</FieldLabel>
              <Input
                type="number"
                min="1"
                value={options.numberStep}
                onChange={(e) => update({ numberStep: parseInt(e.target.value) || 1 })}
                disabled={options.numberingMode === "none"}
                className="h-11"
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">Padding</FieldLabel>
              <select
                aria-label="Zero Padding"
                value={options.numberPadding}
                onChange={(e) => update({ numberPadding: parseInt(e.target.value) || 1 })}
                disabled={options.numberingMode === "none"}
                className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="1">1 (1, 2, 3)</option>
                <option value="2">2 digits (01, 02)</option>
                <option value="3">3 digits (001, 002)</option>
                <option value="4">4 digits (0001, 0002)</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Row 3: Find & Replace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="find-input" className="flex items-center gap-1">
              <Search className="size-3" />
              Find Text
            </FieldLabel>
            <Input
              id="find-input"
              value={options.findText}
              onChange={(e) => update({ findText: e.target.value })}
              placeholder="e.g. IMG_"
              className="h-11"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="replace-input">Replace With</FieldLabel>
            <Input
              id="replace-input"
              value={options.replaceText}
              onChange={(e) => update({ replaceText: e.target.value })}
              placeholder="e.g. photo-"
              className="h-11"
            />
          </Field>
        </div>

        {/* Row 4: Casing, Spaces & Extensions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-4">
          <Field>
            <FieldLabel>Case</FieldLabel>
            <select
              aria-label="Case Conversion"
              value={options.caseTransform}
              onChange={(e) => update({ caseTransform: e.target.value as CaseTransform })}
              className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="none">Original Case</option>
              <option value="lowercase">lowercase</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="titlecase">Title Case</option>
              <option value="kebabcase">kebab-case</option>
              <option value="snakecase">snake_case</option>
              <option value="camelcase">camelCase</option>
            </select>
          </Field>

          <Field>
            <FieldLabel>Spaces</FieldLabel>
            <select
              aria-label="Spaces Handling"
              value={options.spaceHandling}
              onChange={(e) => update({ spaceHandling: e.target.value as SpaceHandling })}
              className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="keep">Keep Spaces</option>
              <option value="remove">Remove Spaces</option>
              <option value="dash">Replace with &apos;-&apos;</option>
              <option value="underscore">Replace with &apos;_&apos;</option>
            </select>
          </Field>

          <Field>
            <FieldLabel>Extension</FieldLabel>
            <select
              aria-label="File Extension Transform"
              value={options.extensionTransform}
              onChange={(e) => update({ extensionTransform: e.target.value as any })}
              className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="original">Keep Original</option>
              <option value="lowercase">Lowercase (.jpg)</option>
              <option value="uppercase">Uppercase (.JPG)</option>
            </select>
          </Field>
        </div>
      </FieldGroup>
    </div>
  );
}
