export type CaseTransform =
  | "none"
  | "lowercase"
  | "uppercase"
  | "titlecase"
  | "kebabcase"
  | "snakecase"
  | "camelcase";

export type SpaceHandling = "keep" | "remove" | "dash" | "underscore";

export type NumberingMode = "none" | "suffix" | "prefix" | "replace";

export interface RenameOptions {
  prefix: string;
  suffix: string;
  findText: string;
  replaceText: string;
  useRegex: boolean;
  caseSensitive: boolean;
  caseTransform: CaseTransform;
  spaceHandling: SpaceHandling;
  numberingMode: NumberingMode;
  numberStart: number;
  numberStep: number;
  numberPadding: number; // e.g. 3 => "001"
  extensionTransform: "original" | "lowercase" | "uppercase";
}

export interface RenamedFileItem {
  id: string;
  file: File;
  originalName: string;
  originalExtension: string;
  baseName: string;
  newName: string;
  hasChanged: boolean;
  isDuplicate: boolean;
}

export const DEFAULT_RENAME_OPTIONS: RenameOptions = {
  prefix: "",
  suffix: "",
  findText: "",
  replaceText: "",
  useRegex: false,
  caseSensitive: false,
  caseTransform: "none",
  spaceHandling: "keep",
  numberingMode: "none",
  numberStart: 1,
  numberStep: 1,
  numberPadding: 3,
  extensionTransform: "original",
};

export function splitFilename(filename: string): { baseName: string; extension: string } {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex <= 0) {
    return { baseName: filename, extension: "" };
  }
  return {
    baseName: filename.substring(0, lastDotIndex),
    extension: filename.substring(lastDotIndex),
  };
}

export function formatPaddedNumber(num: number, padding: number): string {
  const str = Math.abs(num).toString();
  if (str.length >= padding) return str;
  return "0".repeat(padding - str.length) + str;
}

export function transformCase(str: string, transform: CaseTransform): string {
  switch (transform) {
    case "lowercase":
      return str.toLowerCase();
    case "uppercase":
      return str.toUpperCase();
    case "titlecase":
      return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    case "kebabcase":
      return str
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase();
    case "snakecase":
      return str
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[\s-]+/g, "_")
        .toLowerCase();
    case "camelcase":
      return str
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
        .replace(/^([A-Z])/, (m) => m.toLowerCase());
    case "none":
    default:
      return str;
  }
}

export function applyRenamingRule(
  originalBase: string,
  index: number,
  options: RenameOptions
): string {
  let name = originalBase;

  // 1. Find & Replace
  if (options.findText) {
    try {
      if (options.useRegex) {
        const flags = options.caseSensitive ? "g" : "gi";
        const regex = new RegExp(options.findText, flags);
        name = name.replace(regex, options.replaceText);
      } else {
        if (options.caseSensitive) {
          name = name.split(options.findText).join(options.replaceText);
        } else {
          const regex = new RegExp(options.findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
          name = name.replace(regex, options.replaceText);
        }
      }
    } catch {
      // Invalid regex fallback
    }
  }

  // 2. Space handling
  if (options.spaceHandling === "remove") {
    name = name.replace(/\s+/g, "");
  } else if (options.spaceHandling === "dash") {
    name = name.replace(/\s+/g, "-");
  } else if (options.spaceHandling === "underscore") {
    name = name.replace(/\s+/g, "_");
  }

  // 3. Case Transform
  name = transformCase(name, options.caseTransform);

  // 4. Sequential Numbering
  if (options.numberingMode !== "none") {
    const currentNum = options.numberStart + index * options.numberStep;
    const formattedNum = formatPaddedNumber(currentNum, options.numberPadding);

    if (options.numberingMode === "replace") {
      name = formattedNum;
    } else if (options.numberingMode === "prefix") {
      name = `${formattedNum}-${name}`;
    } else if (options.numberingMode === "suffix") {
      name = `${name}-${formattedNum}`;
    }
  }

  // 5. Prefix & Suffix
  if (options.prefix) {
    name = `${options.prefix}${name}`;
  }
  if (options.suffix) {
    name = `${name}${options.suffix}`;
  }

  return name;
}

export function processBatchRenaming(
  files: File[],
  options: RenameOptions
): RenamedFileItem[] {
  const items: RenamedFileItem[] = [];
  const nameCounts = new Map<string, number>();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const { baseName, extension } = splitFilename(file.name);

    const newBase = applyRenamingRule(baseName, i, options);

    let newExt = extension;
    if (options.extensionTransform === "lowercase") {
      newExt = extension.toLowerCase();
    } else if (options.extensionTransform === "uppercase") {
      newExt = extension.toUpperCase();
    }

    const newFullName = `${newBase}${newExt}`;
    nameCounts.set(newFullName, (nameCounts.get(newFullName) || 0) + 1);

    items.push({
      id: `${file.name}-${file.size}-${file.lastModified}-${i}`,
      file,
      originalName: file.name,
      originalExtension: extension,
      baseName,
      newName: newFullName,
      hasChanged: newFullName !== file.name,
      isDuplicate: false,
    });
  }

  // Flag duplicates
  for (const item of items) {
    if ((nameCounts.get(item.newName) || 0) > 1) {
      item.isDuplicate = true;
    }
  }

  return items;
}
