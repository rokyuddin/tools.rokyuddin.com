"use client";

import React, { useState, useId } from "react";
import { Coins, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/common/CopyButton";
import {
  parseBanglaOrEnglishNumber,
  getNumberBreakdown,
} from "../utils/parser";
import { convertNumberToWordsEn } from "../utils/number-to-words-en";
import { convertNumberToWordsBn } from "../utils/number-to-words-bn";

const presets = [
  { label: "1,000", value: "1000" },
  { label: "10,000", value: "10000" },
  { label: "50,000", value: "50000" },
  { label: "1 Lakh", value: "100000" },
  { label: "10 Lakh", value: "1000000" },
  { label: "1 Crore", value: "10000000" },
];

export function BdtConverter() {
  const [inputValue, setInputValue] = useState("125500");
  const [caseFormat, setCaseFormat] = useState<"sentence" | "upper" | "title">("sentence");
  const amountInputId = useId();

  const parsed = parseBanglaOrEnglishNumber(inputValue);
  const englishWordsRaw = parsed.isValid
    ? convertNumberToWordsEn(parsed.taka, parsed.paisa)
    : "";
  const banglaWords = parsed.isValid
    ? convertNumberToWordsBn(parsed.taka, parsed.paisa)
    : "";

  const formatEnglishWords = (text: string) => {
    if (caseFormat === "upper") return text.toUpperCase();
    if (caseFormat === "title") {
      return text
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
    return text;
  };

  const englishWords = formatEnglishWords(englishWordsRaw);
  const breakdown = parsed.isValid ? getNumberBreakdown(parsed.taka) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* Input Section */}
      <Card className="lg:col-span-6 shadow-xs border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Coins className="size-4 text-primary" />
              BDT Amount
            </span>
            {inputValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInputValue("")}
                className="text-xs text-muted-foreground hover:text-foreground h-8"
              >
                <RotateCcw className="size-3.5 mr-1" />
                Clear
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor={amountInputId}>Amount (Taka ৳)</FieldLabel>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">
                  ৳
                </span>
                <Input
                  id={amountInputId}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. 125500 or ১২৫৫০০"
                  className="h-14 pl-9 text-xl font-mono tracking-wide font-medium"
                />
              </div>
            </Field>

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setInputValue(p.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-border/50 font-medium"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Formatting options */}
            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCaseFormat("sentence")}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                    caseFormat === "sentence"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  Sentence case
                </button>
                <button
                  type="button"
                  onClick={() => setCaseFormat("title")}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                    caseFormat === "title"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  Title Case
                </button>
                <button
                  type="button"
                  onClick={() => setCaseFormat("upper")}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                    caseFormat === "upper"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  UPPERCASE
                </button>
              </div>
            </div>

            {/* Number Breakdown */}
            {breakdown && parsed.taka > 0 && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center font-mono">
                  {breakdown.crore > 0 && (
                    <div className="p-1.5 bg-background rounded-lg border border-border">
                      <span className="text-muted-foreground block text-[10px]">Crores</span>
                      <span className="font-bold text-primary">{breakdown.crore}</span>
                    </div>
                  )}
                  {breakdown.lakh > 0 && (
                    <div className="p-1.5 bg-background rounded-lg border border-border">
                      <span className="text-muted-foreground block text-[10px]">Lakhs</span>
                      <span className="font-bold text-primary">{breakdown.lakh}</span>
                    </div>
                  )}
                  {breakdown.thousand > 0 && (
                    <div className="p-1.5 bg-background rounded-lg border border-border">
                      <span className="text-muted-foreground block text-[10px]">Thousands</span>
                      <span className="font-bold text-primary">{breakdown.thousand}</span>
                    </div>
                  )}
                  {breakdown.hundred > 0 && (
                    <div className="p-1.5 bg-background rounded-lg border border-border">
                      <span className="text-muted-foreground block text-[10px]">Hundreds</span>
                      <span className="font-bold text-primary">{breakdown.hundred}</span>
                    </div>
                  )}
                  {breakdown.units > 0 && (
                    <div className="p-1.5 bg-background rounded-lg border border-border">
                      <span className="text-muted-foreground block text-[10px]">Units</span>
                      <span className="font-bold text-primary">{breakdown.units}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Output Results Section */}
      <div className="lg:col-span-6 space-y-4">
        {/* English Words Card */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2.5 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-foreground">
              English
            </CardTitle>
            {englishWords && (
              <CopyButton
                textToCopy={englishWords}
                label="Copy"
                size="sm"
              />
            )}
          </CardHeader>
          <CardContent>
            {englishWords ? (
              <div className="p-4 rounded-xl bg-muted/30 border border-border text-foreground font-medium text-base sm:text-lg leading-relaxed select-all">
                {englishWords}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Enter an amount to see English words
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bangla Words Card */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2.5 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-foreground">
              বাংলা
            </CardTitle>
            {banglaWords && (
              <CopyButton
                textToCopy={banglaWords}
                label="Copy"
                size="sm"
              />
            )}
          </CardHeader>
          <CardContent>
            {banglaWords ? (
              <div className="p-4 rounded-xl bg-muted/30 border border-border text-foreground font-medium text-base sm:text-lg leading-relaxed select-all">
                {banglaWords}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                সংখ্যা লিখলে এখানে বাংলায় প্রদর্শিত হবে
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
