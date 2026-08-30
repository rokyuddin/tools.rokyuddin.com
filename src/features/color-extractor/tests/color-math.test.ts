import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  rgbToHex,
  rgbToHsl,
  buildColorInfo,
} from "../utils/color-math";

describe("Color Math Utilities", () => {
  it("should convert RGB to HEX correctly", () => {
    assert.equal(rgbToHex(255, 255, 255), "#FFFFFF");
    assert.equal(rgbToHex(0, 0, 0), "#000000");
    assert.equal(rgbToHex(37, 99, 235), "#2563EB");
  });

  it("should convert RGB to HSL correctly", () => {
    assert.equal(rgbToHsl(255, 0, 0), "hsl(0, 100%, 50%)");
    assert.equal(rgbToHsl(255, 255, 255), "hsl(0, 0%, 100%)");
    assert.equal(rgbToHsl(0, 0, 0), "hsl(0, 0%, 0%)");
  });

  it("should build complete color info with WCAG contrast", () => {
    const info = buildColorInfo(37, 99, 235);
    assert.equal(info.hex, "#2563EB");
    assert.equal(info.rgb, "rgb(37, 99, 235)");
    assert.ok(info.contrastOnWhite > 1);
    assert.ok(info.contrastOnBlack > 1);
  });
});
