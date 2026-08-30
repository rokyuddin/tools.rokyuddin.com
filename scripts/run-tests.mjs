import assert from "node:assert/strict";
import { parseBanglaOrEnglishNumber } from "../src/features/bdt-to-words/utils/parser.ts";
import { convertNumberToWordsEn } from "../src/features/bdt-to-words/utils/number-to-words-en.ts";
import { convertNumberToWordsBn } from "../src/features/bdt-to-words/utils/number-to-words-bn.ts";
import { generateWhatsAppUrl, sanitizePhoneNumber } from "../src/features/whatsapp-link/utils/generate-url.ts";
import { rgbToHex, rgbToHsl, buildColorInfo } from "../src/features/color-extractor/utils/color-math.ts";

// 1. Photo Print Size Checker
import {
  evaluatePrintSize,
  getQualityAssessment,
  calculateImagePrintSummary,
  formatAspectRatio,
} from "../src/features/photo-print-checker/utils/dpi-calculator.ts";

// 2. Favicon Analyzer
import {
  analyzeIconDimensions,
  generateHtmlFaviconSnippet,
} from "../src/features/favicon-tester/utils/icon-analyzer.ts";

// 3. Batch Renamer
import {
  splitFilename,
  formatPaddedNumber,
  transformCase,
  applyRenamingRule,
  processBatchRenaming,
  DEFAULT_RENAME_OPTIONS,
} from "../src/features/batch-renamer/utils/rename-engine.ts";

// 5. Text Cleaner
import {
  cleanText,
  DEFAULT_CLEANER_OPTIONS,
  CLEAN_EVERYTHING_OPTIONS,
} from "../src/features/text-cleaner/utils/cleaner-engine.ts";
import {
  cleanEmailList,
  cleanPhoneList,
  cleanNamesList,
} from "../src/features/text-cleaner/utils/specialized-cleaners.ts";

// 6. UTM Builder
import {
  cleanUtmString,
  autoFixUtmParams,
  buildCampaignUrl,
} from "../src/features/utm-builder/utils/utm-generator.ts";
import { validateUtmParams } from "../src/features/utm-builder/utils/utm-validator.ts";

console.log("🚀 Running Roky Tools Unit Tests...\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
  }
}

// 1. BDT to Words tests
console.log("=== BDT Amount to Words ===");
test("Parse standard English digits", () => {
  const res = parseBanglaOrEnglishNumber("125500");
  assert.equal(res.isValid, true);
  assert.equal(res.taka, 125500);
});

test("Parse decimal paisa amount", () => {
  const res = parseBanglaOrEnglishNumber("125500.50");
  assert.equal(res.isValid, true);
  assert.equal(res.taka, 125500);
  assert.equal(res.paisa, 50);
});

test("Parse Bengali numerals (১২৫৫০০)", () => {
  const res = parseBanglaOrEnglishNumber("১২৫৫০০");
  assert.equal(res.isValid, true);
  assert.equal(res.taka, 125500);
});

test("English conversion (125500)", () => {
  assert.equal(
    convertNumberToWordsEn(125500, 0),
    "One lakh twenty-five thousand five hundred taka only."
  );
});

test("English conversion with crore (12345678)", () => {
  assert.equal(
    convertNumberToWordsEn(12345678, 0),
    "One crore twenty-three lakh forty-five thousand six hundred seventy-eight taka only."
  );
});

test("Bangla conversion (125500)", () => {
  assert.equal(
    convertNumberToWordsBn(125500, 0),
    "এক লাখ পঁচিশ হাজার পাঁচ শত টাকা মাত্র।"
  );
});

// 2. WhatsApp Link tests
console.log("\n=== WhatsApp Link Generator ===");
test("Sanitize phone numbers with spaces and dashes", () => {
  assert.equal(sanitizePhoneNumber("017-123 45678"), "01712345678");
});

test("Generate clean wa.me URL", () => {
  const url = generateWhatsAppUrl({ dialCode: "880", phoneNumber: "1712345678" });
  assert.equal(url, "https://wa.me/8801712345678");
});

test("Strip leading zero from national number", () => {
  const url = generateWhatsAppUrl({ dialCode: "880", phoneNumber: "01712345678" });
  assert.equal(url, "https://wa.me/8801712345678");
});

test("Encode message with emojis", () => {
  const url = generateWhatsAppUrl({
    dialCode: "880",
    phoneNumber: "1712345678",
    message: "Hi Roky! 👋",
  });
  assert.ok(url.includes("https://wa.me/8801712345678?text="));
  assert.ok(url.includes("Hi%20Roky!%20%F0%9F%91%8B"));
});

// 3. Color Math tests
console.log("\n=== Color Math Utilities ===");
test("Convert RGB to HEX", () => {
  assert.equal(rgbToHex(37, 99, 235), "#2563EB");
  assert.equal(rgbToHex(255, 255, 255), "#FFFFFF");
});

test("Convert RGB to HSL", () => {
  assert.equal(rgbToHsl(255, 0, 0), "hsl(0, 100%, 50%)");
});

test("Build complete color info with contrast scores", () => {
  const info = buildColorInfo(37, 99, 235);
  assert.equal(info.hex, "#2563EB");
  assert.ok(info.contrastOnWhite > 1);
  assert.ok(info.contrastOnBlack > 1);
});

// 4. Photo Print Size Checker
console.log("\n=== Photo Print Size Checker ===");
test("DPI calculation for 4032x3024 on 4x6 inch", () => {
  const res = evaluatePrintSize(4032, 3024, 4, 6);
  assert.ok(res.effectiveDpi >= 500);
  const q = getQualityAssessment(res.effectiveDpi);
  assert.equal(q.tier, "excellent");
  assert.equal(q.stars, 5);
});

test("Aspect ratio mismatch detection (4:3 photo on 8x10 frame)", () => {
  const res = evaluatePrintSize(4032, 3024, 8, 10);
  assert.equal(res.aspectRatioMismatch, true);
  assert.ok(res.cropPercent > 0);
});

test("Format aspect ratio strings", () => {
  assert.equal(formatAspectRatio(4000, 3000), "4:3 (Standard Phone/M43)");
  assert.equal(formatAspectRatio(6000, 4000), "3:2 (Standard DSLR)");
  assert.equal(formatAspectRatio(2000, 2000), "1:1 (Square)");
});

test("Image print summary calculation", () => {
  const summary = calculateImagePrintSummary(4032, 3024);
  assert.equal(summary.megapixels, 12.2);
  assert.equal(summary.maxSizeAt300DpiInches.width, 13.4);
  assert.equal(summary.maxSizeAt300DpiInches.height, 10.1);
});

// 5. Favicon Analyzer
console.log("\n=== Favicon Tester ===");
test("Analyze square 512x512 icon", () => {
  const analysis = analyzeIconDimensions(512, 512);
  assert.equal(analysis.isSquare, true);
  assert.ok(analysis.warnings.some((w) => w.id === "high-res"));
});

test("Analyze non-square low-res icon", () => {
  const analysis = analyzeIconDimensions(24, 16);
  assert.equal(analysis.isSquare, false);
  assert.ok(analysis.warnings.some((w) => w.id === "non-square"));
  assert.ok(analysis.warnings.some((w) => w.id === "low-res"));
});

test("Generate HTML favicon tags snippet", () => {
  const snippet = generateHtmlFaviconSnippet("Roky Site");
  assert.ok(snippet.includes('rel="icon"'));
  assert.ok(snippet.includes('rel="apple-touch-icon"'));
  assert.ok(snippet.includes('content="Roky Site"'));
});

// 6. Batch Renamer
console.log("\n=== Batch File Renamer ===");
test("Split filename and extension", () => {
  const split1 = splitFilename("photo.jpg");
  assert.equal(split1.baseName, "photo");
  assert.equal(split1.extension, ".jpg");

  const split2 = splitFilename("archive.tar.gz");
  assert.equal(split2.baseName, "archive.tar");
  assert.equal(split2.extension, ".gz");
});

test("Padded number formatter", () => {
  assert.equal(formatPaddedNumber(1, 3), "001");
  assert.equal(formatPaddedNumber(42, 3), "042");
  assert.equal(formatPaddedNumber(100, 3), "100");
});

test("Transform case functions", () => {
  assert.equal(transformCase("hello world", "kebabcase"), "hello-world");
  assert.equal(transformCase("hello world", "snakecase"), "hello_world");
  assert.equal(transformCase("hello world", "titlecase"), "Hello World");
  assert.equal(transformCase("HELLO WORLD", "lowercase"), "hello world");
});

test("Apply renaming rules with numbering and prefix", () => {
  const rule = applyRenamingRule("IMG_001", 0, {
    ...DEFAULT_RENAME_OPTIONS,
    prefix: "trip-",
    numberingMode: "suffix",
    numberStart: 1,
    numberPadding: 3,
  });
  assert.equal(rule, "trip-IMG_001-001");
});

// 7. Text Cleaner
console.log("\n=== Personal Data & Text Cleaner ===");
test("Clean extra spaces and blank lines", () => {
  const raw = "  Hello    World  \n\n\nThis is text.   ";
  const { cleanedText, metrics } = cleanText(raw, DEFAULT_CLEANER_OPTIONS);
  assert.equal(cleanedText, "Hello World\n\nThis is text.");
  assert.ok(metrics.spacesRemoved > 0);
  assert.equal(metrics.blankLinesRemoved, 1);
});

test("Normalize smart curly quotes and invisible chars", () => {
  const raw = "“Hello” ‘World’\u200B";
  const { cleanedText, metrics } = cleanText(raw, DEFAULT_CLEANER_OPTIONS);
  assert.equal(cleanedText, '"Hello" \'World\'');
  assert.equal(metrics.quotesNormalized, 4);
  assert.equal(metrics.invisibleCharsRemoved, 1);
});

test("Specialized Email Cleaner with deduplication", () => {
  const raw = "John <john@example.com>\nJOHN@EXAMPLE.COM\n  info@test.com  \njohn@example.com";
  const { cleanedText, count, duplicates } = cleanEmailList(raw);
  assert.equal(count, 2);
  assert.equal(duplicates, 2);
  assert.equal(cleanedText, "john@example.com\ninfo@test.com");
});

test("Specialized Phone Cleaner", () => {
  const raw = "+1 (555) 234-5678\n+15552345678\n555-999-0000";
  const { cleanedText, count, duplicates } = cleanPhoneList(raw);
  assert.equal(count, 2);
  assert.equal(duplicates, 1);
  assert.equal(cleanedText, "+15552345678\n5559990000");
});

// 8. UTM Builder & Validator
console.log("\n=== UTM Builder & Validator ===");
test("Generate valid UTM URL", () => {
  const url = buildCampaignUrl({
    url: "https://example.com/shop",
    source: "facebook",
    medium: "paid_social",
    campaign: "summer_sale_2026",
    content: "hero_banner",
    term: "",
  });
  assert.equal(
    url,
    "https://example.com/shop?utm_source=facebook&utm_medium=paid_social&utm_campaign=summer_sale_2026&utm_content=hero_banner"
  );
});

test("Detect uppercase and space errors in UTM params", () => {
  const validation = validateUtmParams({
    url: "example.com",
    source: "Facebook Ads",
    medium: "Paid Social",
    campaign: "Summer Sale",
    content: "",
    term: "",
  });
  assert.equal(validation.hasWarnings, true);
  assert.ok(validation.issues.some((i) => i.id === "uppercase-source"));
  assert.ok(validation.issues.some((i) => i.id === "spaces-source"));
});

test("Auto-fix UTM parameters", () => {
  const fixed = autoFixUtmParams({
    url: "example.com/page",
    source: "Facebook Ads",
    medium: "Paid Social",
    campaign: "Summer Sale",
    content: "",
    term: "",
  });
  assert.equal(fixed.url, "https://example.com/page");
  assert.equal(fixed.source, "facebook_ads");
  assert.equal(fixed.medium, "paid_social");
  assert.equal(fixed.campaign, "summer_sale");
});

console.log(`\n🎉 Results: ${passed}/${total} tests passed!\n`);
if (passed !== total) process.exit(1);
