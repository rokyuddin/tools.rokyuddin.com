import type { PlatformConfig, SocialPlatform } from "../types";

export const SUPPORTED_PLATFORMS: Record<SocialPlatform, PlatformConfig> = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    badgeLabel: "Instagram Reels",
    placeholder: "Paste Instagram Reel or Post link (e.g. instagram.com/reel/...)",
    colorClass: "bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400",
    exampleUrl: "https://www.instagram.com/reel/C3_sample123/",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    badgeLabel: "TikTok (No Watermark)",
    placeholder: "Paste TikTok video link (e.g. vt.tiktok.com/... or tiktok.com/@user/video/...)",
    colorClass: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400",
    exampleUrl: "https://www.tiktok.com/@creator/video/1234567890",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    badgeLabel: "Facebook Reels",
    placeholder: "Paste Facebook Reel or Video link (e.g. fb.watch/... or facebook.com/reel/...)",
    colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    exampleUrl: "https://www.facebook.com/reel/1234567890",
  },
  youtube: {
    id: "youtube",
    name: "YouTube Shorts",
    badgeLabel: "YouTube Shorts",
    placeholder: "Paste YouTube Short or Video link (e.g. youtube.com/shorts/...)",
    colorClass: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    exampleUrl: "https://youtube.com/shorts/sample123abc",
  },
  twitter: {
    id: "twitter",
    name: "X (Twitter)",
    badgeLabel: "X / Twitter Video",
    placeholder: "Paste X (Twitter) post link (e.g. x.com/.../status/...)",
    colorClass: "bg-zinc-500/10 text-zinc-700 border-zinc-500/20 dark:text-zinc-300",
    exampleUrl: "https://x.com/user/status/1234567890",
  },
  unknown: {
    id: "unknown",
    name: "Auto Detect",
    badgeLabel: "All Platforms",
    placeholder: "Paste any Instagram, TikTok, Facebook, YouTube Short, or X video link...",
    colorClass: "bg-muted text-muted-foreground border-border",
    exampleUrl: "",
  },
};

/**
 * Detects the social media platform from a raw URL.
 */
export function detectPlatformFromUrl(rawUrl: string): SocialPlatform {
  if (!rawUrl || typeof rawUrl !== "string") return "unknown";

  const trimmed = rawUrl.trim().toLowerCase();

  if (
    trimmed.includes("instagram.com") ||
    trimmed.includes("instagr.am")
  ) {
    return "instagram";
  }

  if (
    trimmed.includes("tiktok.com") ||
    trimmed.includes("douyin.com")
  ) {
    return "tiktok";
  }

  if (
    trimmed.includes("facebook.com") ||
    trimmed.includes("fb.watch") ||
    trimmed.includes("fb.com") ||
    trimmed.includes("m.facebook.com") ||
    trimmed.includes("web.facebook.com")
  ) {
    return "facebook";
  }

  if (
    trimmed.includes("youtube.com") ||
    trimmed.includes("youtu.be")
  ) {
    return "youtube";
  }

  if (
    trimmed.includes("twitter.com") ||
    trimmed.includes("x.com") ||
    trimmed.includes("t.co")
  ) {
    return "twitter";
  }

  return "unknown";
}

/**
 * Sanitizes and normalizes the incoming URL string.
 */
export function sanitizeVideoUrl(input: string): string {
  if (!input) return "";
  let clean = input.trim();

  // Strip surrounding quotes or whitespace
  clean = clean.replace(/^["']|["']$/g, "");

  // If missing protocol, prepend https://
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = `https://${clean}`;
  }

  return clean;
}

/**
 * Validates if the input looks like a recognized social video link.
 */
export function isValidSocialUrl(url: string): boolean {
  if (!url) return false;
  const platform = detectPlatformFromUrl(url);
  if (platform === "unknown") return false;

  try {
    const parsed = new URL(sanitizeVideoUrl(url));
    return Boolean(parsed.hostname && parsed.pathname.length > 1);
  } catch {
    return false;
  }
}

/**
 * Decodes JSON escaped backslashes, Unicode escapes, and HTML entities from raw video URLs.
 */
export function cleanEscapedUrl(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  let clean = raw.trim();

  // Remove surrounding quotes if any
  clean = clean.replace(/^["']|["']$/g, "");

  // 1. Unescape JSON unicode code points (e.g. \u0026 -> &, \u0025 -> %, \u002F -> /)
  clean = clean.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  // 2. Unescape escaped forward slashes (e.g. \/ -> /, \\/ -> /, \\\/ -> /)
  clean = clean.replace(/\\+(\/)/g, "$1");

  // 3. Unescape double escaped percentage (e.g. \%3D -> %3D, \\% -> %)
  clean = clean.replace(/\\+%/g, "%");

  // 4. Remove any remaining stray backslashes
  clean = clean.replace(/\\+/g, "");

  // 5. Unescape HTML entities (e.g. &amp; -> &)
  clean = clean
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return clean.trim();
}

