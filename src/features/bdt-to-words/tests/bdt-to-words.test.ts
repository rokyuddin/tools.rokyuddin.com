import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseBanglaOrEnglishNumber } from "../utils/parser";
import { convertNumberToWordsEn } from "../utils/number-to-words-en";
import { convertNumberToWordsBn } from "../utils/number-to-words-bn";

describe("BDT Amount to Words - Parser", () => {
  it("should parse standard English digits", () => {
    const res = parseBanglaOrEnglishNumber("125500");
    assert.equal(res.isValid, true);
    assert.equal(res.taka, 125500);
    assert.equal(res.paisa, 0);
  });

  it("should parse decimal amounts for paisa", () => {
    const res = parseBanglaOrEnglishNumber("125500.50");
    assert.equal(res.isValid, true);
    assert.equal(res.taka, 125500);
    assert.equal(res.paisa, 50);
  });

  it("should parse comma formatted numbers and currency prefixes", () => {
    const res = parseBanglaOrEnglishNumber("BDT 1,25,500.75");
    assert.equal(res.isValid, true);
    assert.equal(res.taka, 125500);
    assert.equal(res.paisa, 75);
  });

  it("should parse Bengali numerals", () => {
    const res = parseBanglaOrEnglishNumber("১২৫৫০০");
    assert.equal(res.isValid, true);
    assert.equal(res.taka, 125500);
  });
});

describe("BDT Amount to Words - English Conversion", () => {
  it("should convert zero", () => {
    assert.equal(convertNumberToWordsEn(0, 0), "Zero taka only.");
  });

  it("should convert small amounts", () => {
    assert.equal(convertNumberToWordsEn(50, 0), "Fifty taka only.");
    assert.equal(convertNumberToWordsEn(105, 0), "One hundred five taka only.");
  });

  it("should convert thousands and lakhs in South Asian format", () => {
    assert.equal(
      convertNumberToWordsEn(125500, 0),
      "One lakh twenty-five thousand five hundred taka only."
    );
  });

  it("should convert crores", () => {
    assert.equal(convertNumberToWordsEn(10000000, 0), "One crore taka only.");
    assert.equal(
      convertNumberToWordsEn(12345678, 0),
      "One crore twenty-three lakh forty-five thousand six hundred seventy-eight taka only."
    );
  });

  it("should include paisa correctly", () => {
    assert.equal(
      convertNumberToWordsEn(125500, 50),
      "One lakh twenty-five thousand five hundred taka and fifty paisa only."
    );
  });
});

describe("BDT Amount to Words - Bangla Conversion", () => {
  it("should convert zero in Bangla", () => {
    assert.equal(convertNumberToWordsBn(0, 0), "শূন্য টাকা মাত্র।");
  });

  it("should convert 125500 in Bangla", () => {
    assert.equal(
      convertNumberToWordsBn(125500, 0),
      "এক লাখ পঁচিশ হাজার পাঁচ শত টাকা মাত্র।"
    );
  });

  it("should convert with paisa in Bangla", () => {
    assert.equal(
      convertNumberToWordsBn(100, 50),
      "এক শত টাকা এবং পঞ্চাশ পয়সা মাত্র।"
    );
  });
});
