import assert from "node:assert/strict";
import { parseBanglaOrEnglishNumber } from "../src/features/bdt-to-words/utils/parser.ts";
import { convertNumberToWordsEn } from "../src/features/bdt-to-words/utils/number-to-words-en.ts";
import { convertNumberToWordsBn } from "../src/features/bdt-to-words/utils/number-to-words-bn.ts";
import { generateWhatsAppUrl, sanitizePhoneNumber } from "../src/features/whatsapp-link/utils/generate-url.ts";
import { rgbToHex, rgbToHsl, buildColorInfo } from "../src/features/color-extractor/utils/color-math.ts";

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

console.log(`\n🎉 Results: ${passed}/${total} tests passed!\n`);
if (passed !== total) process.exit(1);
