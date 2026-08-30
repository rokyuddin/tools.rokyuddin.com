import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateWhatsAppUrl,
  sanitizePhoneNumber,
} from "../utils/generate-url";

describe("WhatsApp Link Generator", () => {
  it("should sanitize phone numbers with spaces and dashes", () => {
    assert.equal(sanitizePhoneNumber("017-123 45678"), "01712345678");
    assert.equal(sanitizePhoneNumber("+880 1712-345678"), "8801712345678");
  });

  it("should generate clean wa.me url without message", () => {
    const url = generateWhatsAppUrl({
      dialCode: "880",
      phoneNumber: "1712345678",
    });
    assert.equal(url, "https://wa.me/8801712345678");
  });

  it("should strip leading zero from national number if entered", () => {
    const url = generateWhatsAppUrl({
      dialCode: "880",
      phoneNumber: "01712345678",
    });
    assert.equal(url, "https://wa.me/8801712345678");
  });

  it("should encode message parameter including spaces and emojis", () => {
    const url = generateWhatsAppUrl({
      dialCode: "880",
      phoneNumber: "1712345678",
      message: "Hello Roky! 👋 I need help with an order.",
    });
    assert.ok(url.includes("https://wa.me/8801712345678?text="));
    assert.ok(url.includes("Hello%20Roky!%20%F0%9F%91%8B"));
  });
});
