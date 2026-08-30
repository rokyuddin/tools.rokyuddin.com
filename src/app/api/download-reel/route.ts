import { NextResponse } from "next/server";
import {
  detectPlatformFromUrl,
  isValidSocialUrl,
  sanitizeVideoUrl,
} from "@/features/reels-downloader/utils/url-detector";
import type { ReelApiResponse, VideoDownloadItem } from "@/features/reels-downloader/types";

// Public Cobalt API instances for reliable fallback
const COBALT_INSTANCES = [
  process.env.COBALT_API_URL,
  "https://api.cobalt.tools",
  "https://cobalt.kwiatekm.tokyo",
  "https://co.wuk.sh",
].filter(Boolean) as string[];

interface CobaltResponse {
  status?: "redirect" | "tunnel" | "picker" | "error" | "rate-limit";
  url?: string;
  filename?: string;
  picker?: Array<{
    type?: "video" | "photo";
    url: string;
    thumb?: string;
  }>;
  text?: string;
  error?: {
    code?: string;
    context?: {
      service?: string;
      limit?: number;
    };
  };
}

async function fetchFromCobaltInstance(
  endpoint: string,
  targetUrl: string
): Promise<CobaltResponse | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(endpoint.endsWith("/") ? endpoint : `${endpoint}/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "OmniTools-VideoDownloader/1.0",
      },
      body: JSON.stringify({
        url: targetUrl,
        videoQuality: "1080",
        filenameStyle: "pretty",
        downloadMode: "auto",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[Reels API] Instance ${endpoint} returned status ${res.status}:`, errText);
      return null;
    }

    return (await res.json()) as CobaltResponse;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[Reels API] Instance ${endpoint} failed:`, err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl = body?.url;

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json(
        {
          success: false,
          platform: "unknown",
          error: "Please provide a valid video URL.",
        } satisfies ReelApiResponse,
        { status: 400 }
      );
    }

    const cleanUrl = sanitizeVideoUrl(rawUrl);
    const platform = detectPlatformFromUrl(cleanUrl);

    if (!isValidSocialUrl(cleanUrl)) {
      return NextResponse.json(
        {
          success: false,
          platform,
          error:
            "Unsupported or invalid URL. Please enter a valid Instagram, TikTok, Facebook, YouTube Shorts, or X link.",
        } satisfies ReelApiResponse,
        { status: 400 }
      );
    }

    // Try available backend instances sequentially
    let cobaltData: CobaltResponse | null = null;
    for (const instance of COBALT_INSTANCES) {
      cobaltData = await fetchFromCobaltInstance(instance, cleanUrl);
      if (cobaltData && cobaltData.status !== "error" && cobaltData.status !== "rate-limit") {
        break;
      }
    }

    if (!cobaltData) {
      return NextResponse.json(
        {
          success: false,
          platform,
          error:
            "Could not fetch video. The post might be private, deleted, age-restricted, or temporarily rate-limited. Please verify the link.",
        } satisfies ReelApiResponse,
        { status: 502 }
      );
    }

    // Handle picker (multiple items like Instagram carousel)
    if (cobaltData.status === "picker" && cobaltData.picker && cobaltData.picker.length > 0) {
      const firstItem = cobaltData.picker[0];
      const items: VideoDownloadItem[] = cobaltData.picker.map((item, idx) => ({
        quality: "default",
        label: `Media #${idx + 1} (${item.type === "photo" ? "Photo" : "Video"})`,
        url: item.url,
        format: item.type === "photo" ? "mp4" : "mp4",
      }));

      return NextResponse.json({
        success: true,
        platform,
        title: `${platform.toUpperCase()} Media Carousel (${cobaltData.picker.length} items)`,
        downloadUrl: firstItem.url,
        thumbnailUrl: firstItem.thumb,
        filename: cobaltData.filename || `${platform}_reel.mp4`,
        items,
      } satisfies ReelApiResponse);
    }

    // Handle single direct video/tunnel response
    if (cobaltData.url) {
      const filename = cobaltData.filename || `${platform}_video.mp4`;

      const items: VideoDownloadItem[] = [
        {
          quality: "1080p",
          label: "HD Video (MP4 - No Watermark)",
          url: cobaltData.url,
          format: "mp4",
        },
      ];

      return NextResponse.json({
        success: true,
        platform,
        title: cobaltData.text || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Reel`,
        downloadUrl: cobaltData.url,
        filename,
        items,
      } satisfies ReelApiResponse);
    }

    return NextResponse.json(
      {
        success: false,
        platform,
        error:
          cobaltData.text ||
          cobaltData.error?.code ||
          "Unable to extract video stream. Please check that the account is public and the video exists.",
      } satisfies ReelApiResponse,
      { status: 422 }
    );
  } catch (err: unknown) {
    console.error("[Reels API Error]:", err);
    return NextResponse.json(
      {
        success: false,
        platform: "unknown",
        error: "An unexpected error occurred while processing the video. Please try again.",
      } satisfies ReelApiResponse,
      { status: 500 }
    );
  }
}
