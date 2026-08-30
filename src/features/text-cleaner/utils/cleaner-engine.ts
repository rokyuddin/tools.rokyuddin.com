export interface CleanerOptions {
  trimLines: boolean;
  collapseSpaces: boolean;
  removeEmptyLines: boolean;
  collapseBlankLines: boolean;
  removeDuplicateLines: boolean;
  normalizeQuotes: boolean;
  normalizeDashes: boolean;
  removeInvisibleChars: boolean;
  sortLines: "none" | "az" | "za";
}

export interface CleanerMetrics {
  originalCharCount: number;
  cleanedCharCount: number;
  originalLineCount: number;
  cleanedLineCount: number;
  spacesRemoved: number;
  blankLinesRemoved: number;
  duplicateLinesRemoved: number;
  quotesNormalized: number;
  invisibleCharsRemoved: number;
  totalChanges: number;
}

export const DEFAULT_CLEANER_OPTIONS: CleanerOptions = {
  trimLines: true,
  collapseSpaces: true,
  removeEmptyLines: false,
  collapseBlankLines: true,
  removeDuplicateLines: false,
  normalizeQuotes: true,
  normalizeDashes: true,
  removeInvisibleChars: true,
  sortLines: "none",
};

export const CLEAN_EVERYTHING_OPTIONS: CleanerOptions = {
  trimLines: true,
  collapseSpaces: true,
  removeEmptyLines: false,
  collapseBlankLines: true,
  removeDuplicateLines: true,
  normalizeQuotes: true,
  normalizeDashes: true,
  removeInvisibleChars: true,
  sortLines: "none",
};

export function cleanText(
  rawText: string,
  options: CleanerOptions
): { cleanedText: string; metrics: CleanerMetrics } {
  let text = rawText;
  let spacesRemoved = 0;
  let quotesNormalized = 0;
  let invisibleCharsRemoved = 0;

  // 1. Invisible characters stripping (\u200B-\u200D, \uFEFF, \u00A0, \u00AD, etc.)
  if (options.removeInvisibleChars) {
    const invisibleRegex = /[\u200B-\u200D\uFEFF\u00AD\u200E\u200F\u202A-\u202E]/g;
    const matches = text.match(invisibleRegex);
    if (matches) invisibleCharsRemoved += matches.length;
    text = text.replace(invisibleRegex, "");

    // Replace non-breaking spaces with standard space
    text = text.replace(/\u00A0/g, " ");
  }

  // 2. Normalize smart quotes (“ ” „ « » ‘ ’)
  if (options.normalizeQuotes) {
    const quoteRegex = /[“”„«»]/g;
    const singleQuoteRegex = /[‘’`]/g;
    const doubleMatches = text.match(quoteRegex);
    const singleMatches = text.match(singleQuoteRegex);
    if (doubleMatches) quotesNormalized += doubleMatches.length;
    if (singleMatches) quotesNormalized += singleMatches.length;

    text = text.replace(quoteRegex, '"').replace(singleQuoteRegex, "'");
  }

  // 3. Normalize dashes (em dash —, en dash –, figure dash)
  if (options.normalizeDashes) {
    text = text.replace(/[—–―]/g, "-");
  }

  // Process line by line
  let lines = text.split(/\r?\n/);
  const originalLineCount = lines.length;

  if (options.trimLines) {
    lines = lines.map((l) => l.trim());
  }

  if (options.collapseSpaces) {
    lines = lines.map((l) => {
      const beforeLen = l.length;
      const collapsed = l.replace(/[ \t]+/g, " ");
      spacesRemoved += beforeLen - collapsed.length;
      return collapsed;
    });
  }

  // Blank lines handling
  let blankLinesRemoved = 0;
  if (options.removeEmptyLines) {
    const prevCount = lines.length;
    lines = lines.filter((l) => l.trim().length > 0);
    blankLinesRemoved += prevCount - lines.length;
  } else if (options.collapseBlankLines) {
    const newLines: string[] = [];
    let prevWasBlank = false;
    for (const line of lines) {
      const isBlank = line.trim().length === 0;
      if (isBlank) {
        if (!prevWasBlank) {
          newLines.push("");
          prevWasBlank = true;
        } else {
          blankLinesRemoved++;
        }
      } else {
        newLines.push(line);
        prevWasBlank = false;
      }
    }
    lines = newLines;
  }

  // Duplicate lines handling
  let duplicateLinesRemoved = 0;
  if (options.removeDuplicateLines) {
    const seen = new Set<string>();
    const uniqueLines: string[] = [];
    for (const line of lines) {
      if (line.trim().length === 0) {
        uniqueLines.push(line);
      } else {
        if (seen.has(line)) {
          duplicateLinesRemoved++;
        } else {
          seen.add(line);
          uniqueLines.push(line);
        }
      }
    }
    lines = uniqueLines;
  }

  // Sorting
  if (options.sortLines === "az") {
    lines.sort((a, b) => a.localeCompare(b));
  } else if (options.sortLines === "za") {
    lines.sort((a, b) => b.localeCompare(a));
  }

  const cleanedText = lines.join("\n");

  const metrics: CleanerMetrics = {
    originalCharCount: rawText.length,
    cleanedCharCount: cleanedText.length,
    originalLineCount,
    cleanedLineCount: lines.length,
    spacesRemoved,
    blankLinesRemoved,
    duplicateLinesRemoved,
    quotesNormalized,
    invisibleCharsRemoved,
    totalChanges:
      spacesRemoved +
      blankLinesRemoved +
      duplicateLinesRemoved +
      quotesNormalized +
      invisibleCharsRemoved,
  };

  return { cleanedText, metrics };
}
