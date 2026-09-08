import assert from "node:assert/strict";
import { parseBanglaOrEnglishNumber } from "../src/features/bdt-to-words/utils/parser.ts";
import { convertNumberToWordsEn } from "../src/features/bdt-to-words/utils/number-to-words-en.ts";
import { convertNumberToWordsBn } from "../src/features/bdt-to-words/utils/number-to-words-bn.ts";
import {
  generateWhatsAppUrl,
  sanitizePhoneNumber,
} from "../src/features/whatsapp-link/utils/generate-url.ts";
import {
  rgbToHex,
  rgbToHsl,
  buildColorInfo,
} from "../src/features/color-extractor/utils/color-math.ts";

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

// 7. Reels Downloader
import {
  detectPlatformFromUrl,
  sanitizeVideoUrl,
  isValidSocialUrl,
  cleanEscapedUrl,
} from "../src/features/reels-downloader/utils/url-detector.ts";

// 8. Photo Blur & Redaction
import {
  normalizeRect,
  clampRectToBounds,
} from "../src/features/photo-blur/utils/canvas-redactor.ts";

// 9. File Size Increaser / Pad Engine
import {
  parseUnitToBytes,
  validateTargetSize,
  calculatePaddingBytes,
  formatFileSize,
  generatePaddedFileName,
  generatePaddedBlob,
  BYTES_PER_KB,
  BYTES_PER_MB,
} from "../src/features/file-size-increaser/lib/pad-engine.ts";

// 10. Image Resizer / Resize Engine
import {
  clampDimension,
  resolveBySize,
  resolveByPercentage,
  SOCIAL_PRESETS,
  resolveSocialPreset,
  generateResizedFileName,
  validateTargetFileSizeKB,
  isUpscale,
} from "../src/features/image-resizer/utils/resize-engine.ts";
import {
  resolveMimeType,
  extensionForMime,
} from "../src/features/image-resizer/utils/render-image.ts";

console.log("🚀 Running OmniTools Unit Tests...\n");

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
    "One lakh twenty-five thousand five hundred taka only.",
  );
});

test("English conversion with crore (12345678)", () => {
  assert.equal(
    convertNumberToWordsEn(12345678, 0),
    "One crore twenty-three lakh forty-five thousand six hundred seventy-eight taka only.",
  );
});

test("Bangla conversion (125500)", () => {
  assert.equal(
    convertNumberToWordsBn(125500, 0),
    "এক লাখ পঁচিশ হাজার পাঁচ শত টাকা মাত্র।",
  );
});

// 2. WhatsApp Link tests
console.log("\n=== WhatsApp Link Generator ===");
test("Sanitize phone numbers with spaces and dashes", () => {
  assert.equal(sanitizePhoneNumber("017-123 45678"), "01712345678");
});

test("Generate clean wa.me URL", () => {
  const url = generateWhatsAppUrl({
    dialCode: "880",
    phoneNumber: "1712345678",
  });
  assert.equal(url, "https://wa.me/8801712345678");
});

test("Strip leading zero from national number", () => {
  const url = generateWhatsAppUrl({
    dialCode: "880",
    phoneNumber: "01712345678",
  });
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
  assert.equal(cleanedText, "\"Hello\" 'World'");
  assert.equal(metrics.quotesNormalized, 4);
  assert.equal(metrics.invisibleCharsRemoved, 1);
});

test("Specialized Email Cleaner with deduplication", () => {
  const raw =
    "John <john@example.com>\nJOHN@EXAMPLE.COM\n  info@test.com  \njohn@example.com";
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
    "https://example.com/shop?utm_source=facebook&utm_medium=paid_social&utm_campaign=summer_sale_2026&utm_content=hero_banner",
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

// 9. Reels Downloader Tests
console.log("\n=== Universal Reels Downloader ===");
test("Detect Instagram Reel URL", () => {
  assert.equal(
    detectPlatformFromUrl("https://www.instagram.com/reel/C3_sample123/"),
    "instagram",
  );
  assert.equal(
    detectPlatformFromUrl("https://instagr.am/p/sample/"),
    "instagram",
  );
});

test("Detect TikTok video and short link", () => {
  assert.equal(
    detectPlatformFromUrl("https://www.tiktok.com/@creator/video/1234567890"),
    "tiktok",
  );
  assert.equal(
    detectPlatformFromUrl("https://vt.tiktok.com/ZS2xyz/"),
    "tiktok",
  );
});

test("Detect Facebook Reel and fb.watch link", () => {
  assert.equal(
    detectPlatformFromUrl("https://www.facebook.com/reel/1234567890"),
    "facebook",
  );
  assert.equal(detectPlatformFromUrl("https://fb.watch/xyz123/"), "facebook");
});

test("Detect YouTube Shorts and youtu.be link", () => {
  assert.equal(
    detectPlatformFromUrl("https://youtube.com/shorts/sample123abc"),
    "youtube",
  );
  assert.equal(detectPlatformFromUrl("https://youtu.be/xyz123"), "youtube");
});

test("Detect X / Twitter post link", () => {
  assert.equal(
    detectPlatformFromUrl("https://x.com/user/status/1234567890"),
    "twitter",
  );
  assert.equal(
    detectPlatformFromUrl("https://twitter.com/user/status/1234567890"),
    "twitter",
  );
});

test("Sanitize video URLs with whitespace and missing protocols", () => {
  assert.equal(
    sanitizeVideoUrl("  instagram.com/reel/123  "),
    "https://instagram.com/reel/123",
  );
  assert.equal(
    sanitizeVideoUrl('"https://vt.tiktok.com/ZS123/"'),
    "https://vt.tiktok.com/ZS123/",
  );
});

test("Validate social URLs", () => {
  assert.equal(isValidSocialUrl("https://www.instagram.com/reel/123/"), true);
  assert.equal(isValidSocialUrl("https://google.com/search?q=test"), false);
  assert.equal(isValidSocialUrl("not-a-url"), false);
});

test("Clean escaped JSON/HTML video URLs with backslashes and unicode", () => {
  const escaped =
    "https:\\/\\/instagram.fdac31-1.fna.fbcdn.net\\/o1\\/v\\/t2\\/video.mp4?efg=abc\\%3D&amp;tag=1";
  const cleaned = cleanEscapedUrl(escaped);
  assert.equal(
    cleaned,
    "https://instagram.fdac31-1.fna.fbcdn.net/o1/v/t2/video.mp4?efg=abc%3D&tag=1",
  );
});

// 10. Photo Blur & Privacy Redaction Tests
console.log("\n=== Photo Blur & Privacy Redaction ===");
test("Normalize reverse drag rectangle (bottom-right to top-left)", () => {
  const norm = normalizeRect(200, 150, 50, 40);
  assert.equal(norm.x, 50);
  assert.equal(norm.y, 40);
  assert.equal(norm.width, 150);
  assert.equal(norm.height, 110);
});

test("Clamp rectangle exceeding canvas bounds", () => {
  const clamped = clampRectToBounds(
    { x: 900, y: 550, width: 200, height: 100 },
    1000,
    600,
  );
  assert.equal(clamped.x, 900);
  assert.equal(clamped.y, 550);
  assert.equal(clamped.width, 100);
  assert.equal(clamped.height, 50);
});

// 11. Bangla Date & Season Converter Tests
import {
  gregorianToBangla,
  banglaToGregorian,
  toBanglaNumber,
  fromBanglaNumber,
  isGregorianLeapYear,
} from "../src/features/bangla-date-converter/utils/bangla-calendar.ts";

console.log("\n=== Bangla Date & Season Converter ===");
test("Bengali digit conversions", () => {
  assert.equal(toBanglaNumber(1433), "১৪৩৩");
  assert.equal(toBanglaNumber("01712"), "০১৭১২");
  assert.equal(fromBanglaNumber("১৪৩৩"), "1433");
});

test("Pohela Boishakh (April 14, 2026 -> 1 Boishakh 1433)", () => {
  const res = gregorianToBangla("2026-04-14");
  assert.equal(res.day, 1);
  assert.equal(res.monthNameBn, "বৈশাখ");
  assert.equal(res.year, 1433);
  assert.equal(res.season.nameBn, "গ্রীষ্ম");
  assert.equal(res.dayBn, "১");
});

test("Pohela Boishakh eve (April 13, 2026 -> 30 Choitro 1432)", () => {
  const res = gregorianToBangla("2026-04-13");
  assert.equal(res.day, 30);
  assert.equal(res.monthNameBn, "চৈত্র");
  assert.equal(res.year, 1432);
  assert.equal(res.season.nameBn, "বসন্ত");
});

test("Ekushey February (Feb 21, 2026 -> 8 Falgun 1432)", () => {
  const res = gregorianToBangla("2026-02-21");
  assert.equal(res.day, 8);
  assert.equal(res.monthNameBn, "ফাল্গুন");
  assert.equal(res.year, 1432);
  assert.equal(res.season.nameBn, "বসন্ত");
});

test("Independence Day (March 26, 2026 -> 12 Choitro 1432)", () => {
  const res = gregorianToBangla("2026-03-26");
  assert.equal(res.day, 12);
  assert.equal(res.monthNameBn, "চৈত্র");
  assert.equal(res.year, 1432);
});

test("Victory Day (Dec 16, 2026 -> 1 Poush 1433)", () => {
  const res = gregorianToBangla("2026-12-16");
  assert.equal(res.day, 1);
  assert.equal(res.monthNameBn, "পৌষ");
  assert.equal(res.year, 1433);
  assert.equal(res.season.nameBn, "শীত");
});

test("Leap year leap day (Feb 29, 2024 -> 16 Falgun 1430)", () => {
  assert.equal(isGregorianLeapYear(2024), true);
  const res = gregorianToBangla("2024-02-29");
  assert.equal(res.day, 16);
  assert.equal(res.monthNameBn, "ফাল্গুন");
  assert.equal(res.year, 1430);
});

test("Reverse Bangla to Gregorian (1 Boishakh 1433 -> April 14, 2026)", () => {
  const gDate = banglaToGregorian(1433, 0, 1);
  assert.equal(gDate.getFullYear(), 2026);
  assert.equal(gDate.getMonth(), 3); // April
  assert.equal(gDate.getDate(), 14);
});

test("Reverse Bangla to Gregorian (8 Falgun 1432 -> Feb 21, 2026)", () => {
  const gDate = banglaToGregorian(1432, 10, 8);
  assert.equal(gDate.getFullYear(), 2026);
  assert.equal(gDate.getMonth(), 1); // February
  assert.equal(gDate.getDate(), 21);
});

// 9. File Size Increaser / Pad Engine tests
console.log("=== File Size Increaser (Pad Engine) ===");

test("parseUnitToBytes correctly converts KB and MB", () => {
  assert.equal(parseUnitToBytes(10, "KB"), 10 * BYTES_PER_KB);
  assert.equal(parseUnitToBytes(1, "MB"), BYTES_PER_MB);
  assert.equal(parseUnitToBytes(2.5, "MB"), Math.round(2.5 * BYTES_PER_MB));
  assert.equal(parseUnitToBytes(-5, "MB"), 0);
  assert.equal(parseUnitToBytes(NaN, "KB"), 0);
});

test("calculatePaddingBytes computes accurate delta", () => {
  const original = 10 * BYTES_PER_KB; // 10,240
  const target = 1 * BYTES_PER_MB; // 1,048,576
  const padding = calculatePaddingBytes(original, target);
  assert.equal(padding, target - original);
  assert.equal(calculatePaddingBytes(100, 50), 0); // target smaller than current
});

test("validateTargetSize checks constraints and boundaries", () => {
  const current = 15 * BYTES_PER_KB; // 15 KB
  // Smaller than current
  const tooSmall = validateTargetSize(current, 10 * BYTES_PER_KB);
  assert.equal(tooSmall.isValid, false);
  assert.match(tooSmall.error, /must be larger than current file size/i);

  // Equal to current
  const equalSize = validateTargetSize(current, current);
  assert.equal(equalSize.isValid, false);

  // Over 100 MB safe limit
  const tooLarge = validateTargetSize(current, 101 * BYTES_PER_MB);
  assert.equal(tooLarge.isValid, false);
  assert.match(tooLarge.error, /safe maximum limit/i);

  // Valid target
  const valid = validateTargetSize(current, 1 * BYTES_PER_MB);
  assert.equal(valid.isValid, true);
  assert.equal(valid.error, undefined);
});

test("formatFileSize formats bytes cleanly", () => {
  assert.equal(formatFileSize(512), "512 B");
  assert.equal(formatFileSize(1024), "1 KB");
  assert.equal(formatFileSize(1536), "1.50 KB");
  assert.equal(formatFileSize(1048576), "1 MB");
  assert.equal(formatFileSize(2097152), "2 MB");
});

test("generatePaddedFileName formats downloadable filename", () => {
  assert.equal(
    generatePaddedFileName("avatar.png", 1048576),
    "avatar-1MB.png",
  );
  assert.equal(
    generatePaddedFileName("my-passport-doc.pdf", 512000),
    "my-passport-doc-500KB.pdf",
  );
  assert.equal(
    generatePaddedFileName("archive.tar.gz", 2097152),
    "archive.tar-2MB.gz",
  );
});

test("generatePaddedBlob produces exact target size", () => {
  const originalBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]); // 8 bytes
  const targetBytes = 1024; // 1 KB
  const blob = generatePaddedBlob(originalBytes, targetBytes, "image/png");
  assert.equal(blob.size, targetBytes);
  assert.equal(blob.type, "image/png");
});

// 10. Image Resizer / Resize Engine tests
console.log("=== Image Resizer (Resize Engine) ===");

test("clampDimension enforces 1-12000 bounds", () => {
  assert.equal(clampDimension(800), 800);
  assert.equal(clampDimension(0), 1);
  assert.equal(clampDimension(-50), 1);
  assert.equal(clampDimension(20000), 12000);
  assert.equal(clampDimension(NaN), 1);
});

test("resolveBySize with Aspect Ratio Lock derives missing axis", () => {
  const fromWidth = resolveBySize(400, 200, 800, undefined, true);
  assert.deepEqual(fromWidth, { width: 800, height: 400 });
  const fromHeight = resolveBySize(400, 200, undefined, 100, true);
  assert.deepEqual(fromHeight, { width: 200, height: 100 });
});

test("resolveBySize without lock uses explicit dims clamped", () => {
  assert.deepEqual(resolveBySize(400, 200, 800, 600, false), {
    width: 800,
    height: 600,
  });
  assert.deepEqual(resolveBySize(400, 200, undefined, undefined, false), {
    width: 400,
    height: 200,
  });
});

test("resolveByPercentage scales Original Dimensions", () => {
  assert.deepEqual(resolveByPercentage(393, 844, 50), {
    width: 197,
    height: 422,
  });
  assert.deepEqual(resolveByPercentage(1000, 1000, 25), {
    width: 250,
    height: 250,
  });
});

test("social presets resolve to documented pixels", () => {
  assert.equal(SOCIAL_PRESETS.length, 6);
  assert.deepEqual(resolveSocialPreset("instagram-square"), {
    width: 1080,
    height: 1080,
  });
  assert.deepEqual(resolveSocialPreset("youtube-thumbnail"), {
    width: 1280,
    height: 720,
  });
});

test("generateResizedFileName formats name-WxH.ext", () => {
  assert.equal(generateResizedFileName("photo.png", 800, 600), "photo-800x600.png");
  assert.equal(generateResizedFileName("archive.tar.gz", 100, 100), "archive.tar-100x100.gz");
  assert.equal(generateResizedFileName("noext", 10, 20), "noext-10x20");
});

test("validateTargetFileSizeKB enforces JPG/WebP-only 10-5000KB", () => {
  assert.equal(validateTargetFileSizeKB(200, "image/jpeg").isValid, true);
  assert.equal(validateTargetFileSizeKB(200, "image/webp").isValid, true);
  assert.equal(validateTargetFileSizeKB(200, "image/png").isValid, false);
  assert.equal(validateTargetFileSizeKB(5, "image/jpeg").isValid, false);
  assert.equal(validateTargetFileSizeKB(6000, "image/jpeg").isValid, false);
});

test("isUpscale flags Target Dimensions larger than original", () => {
  assert.equal(isUpscale(400, 200, 800, 400), true);
  assert.equal(isUpscale(800, 600, 400, 300), false);
  assert.equal(isUpscale(800, 600, 800, 600), false);
});

test("resolveBySize lock honors last-edited axis", () => {
  assert.deepEqual(resolveBySize(400, 200, 800, 600, true, "height"), {
    width: 1200,
    height: 600,
  });
  assert.deepEqual(resolveBySize(400, 200, 800, 600, true), {
    width: 800,
    height: 400,
  });
});

test("resolveMimeType maps Original GIF to PNG, extensionForMime matches", () => {
  assert.equal(resolveMimeType("original", "image/gif"), "image/png");
  assert.equal(resolveMimeType("original", "image/png"), "image/png");
  assert.equal(resolveMimeType("original", "image/bmp"), "image/jpeg");
  assert.equal(extensionForMime("image/png"), ".png");
  assert.equal(extensionForMime("image/webp"), ".webp");
  assert.equal(extensionForMime("image/jpeg"), ".jpg");
});

console.log(`\n🎉 Results: ${passed}/${total} tests passed!\n`);
if (passed !== total) process.exit(1);
