import { NextResponse } from "next/server";
import {
  detectPlatformFromUrl,
  isValidSocialUrl,
  sanitizeVideoUrl,
  cleanEscapedUrl,
} from "@/features/reels-downloader/utils/url-detector";
import { extractWithYtDlp } from "@/features/reels-downloader/utils/ytdlp-runner";
import type { ReelApiResponse, VideoDownloadItem } from "@/features/reels-downloader/types";

const COBALT_INSTANCES = [
  process.env.COBALT_API_URL,
  "https://api.cobalt.tools",
  "https://cobalt.kwiatekm.tokyo",
  "https://co.wuk.sh",
  "https://cobalt-api.kellr.dev",
  "https://cobalt.xy24.eu",
  "https://cobalt.synced.cloud",
].filter(Boolean) as string[];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
];

function extractInstagramShortcode(url: string): string | null {
  const match = url.match(/(?:reel|p|reels)\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

function extractYouTubeVideoId(url: string): string | null {
  const shortsMatch = url.match(/shorts\/([A-Za-z0-9_-]+)/i);
  if (shortsMatch) return shortsMatch[1];

  const watchMatch = url.match(/[?&]v=([A-Za-z0-9_-]+)/i);
  if (watchMatch) return watchMatch[1];

  const shareMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]+)/i);
  if (shareMatch) return shareMatch[1];

  return null;
}

/**
 * Direct YouTube Shorts & Video extraction
 */
async function extractYouTubeDirect(targetUrl: string): Promise<ReelApiResponse | null> {
  const videoId = extractYouTubeVideoId(targetUrl);
  if (!videoId) return null;

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Strategy 1: YouTube Official Android/iOS Client Innertube Player API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const innertubeRes = await fetch("https://www.youtube.com/youtubei/v1/player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip",
        "X-YouTube-Client-Name": "3",
        "X-YouTube-Client-Version": "19.09.37",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "19.09.37",
            androidSdkVersion: 30,
            hl: "en",
            gl: "US",
          },
        },
        videoId,
        playbackContext: {
          contentPlaybackContext: {
            html5Preference: "HTML5_PREF_WANTS",
          },
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (innertubeRes.ok) {
      const playerJson = await innertubeRes.json();
      const streamingData = playerJson.streamingData;
      const videoDetails = playerJson.videoDetails;

      if (streamingData) {
        const formats = streamingData.formats || [];
        const adaptiveFormats = streamingData.adaptiveFormats || [];

        // Look for direct progressive MP4 stream with audio (e.g. 720p or 360p)
        const progressiveStream = formats.find(
          (f: { url?: string; mimeType?: string }) => f.url && f.mimeType?.includes("video/mp4")
        ) || formats.find((f: { url?: string }) => f.url);

        if (progressiveStream && progressiveStream.url) {
          const cleanStreamUrl = cleanEscapedUrl(progressiveStream.url);
          const items: VideoDownloadItem[] = formats
            .filter((f: { url?: string }) => f.url)
            .map((f: { qualityLabel?: string; quality?: string; url: string }) => ({
              quality: (f.qualityLabel?.includes("1080") ? "1080p" : f.qualityLabel?.includes("720") ? "720p" : "default") as VideoDownloadItem["quality"],
              label: `HD Video (${f.qualityLabel || f.quality || "MP4"})`,
              url: cleanEscapedUrl(f.url),
              format: "mp4",
            }));

          // Add audio stream if available
          const audioFormat = adaptiveFormats.find(
            (f: { url?: string; mimeType?: string }) => f.url && f.mimeType?.includes("audio")
          );
          if (audioFormat && audioFormat.url) {
            items.push({
              quality: "audio",
              label: "Audio Only (MP3/M4A)",
              url: cleanEscapedUrl(audioFormat.url),
              format: "mp3",
            });
          }

          const thumb =
            videoDetails?.thumbnail?.thumbnails?.pop()?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

          return {
            success: true,
            platform: "youtube",
            title: videoDetails?.title || "YouTube Shorts",
            author: videoDetails?.author,
            downloadUrl: cleanStreamUrl,
            thumbnailUrl: thumb,
            filename: `youtube_${videoId}.mp4`,
            items: items.length > 0 ? items : undefined,
          };
        }
      }
    }
  } catch (err) {
    console.warn("[YouTube Innertube failed]:", err);
  }

  // Strategy 2: High-speed Piped / Invidious stream gateways
  const apiGateways = [
    `https://pipedapi.kavin.rocks/streams/${videoId}`,
    `https://api.piped.privacydev.net/streams/${videoId}`,
    `https://pipedapi.tokhmi.xyz/streams/${videoId}`,
    `https://inv.nadeko.net/api/v1/videos/${videoId}`,
    `https://invidious.nerdvpn.de/api/v1/videos/${videoId}`,
    `https://yewtu.be/api/v1/videos/${videoId}`,
  ];

  for (const endpoint of apiGateways) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(endpoint, {
        headers: {
          "User-Agent": USER_AGENTS[0],
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();

        // Check piped format
        if (json.videoStreams && Array.isArray(json.videoStreams) && json.videoStreams.length > 0) {
          const videoStreams = json.videoStreams.filter(
            (s: { format?: string; videoOnly?: boolean }) => s.format === "MPEG_4" || s.videoOnly === false
          );
          const bestStream = videoStreams[0] || json.videoStreams[0];

          if (bestStream && bestStream.url) {
            const items: VideoDownloadItem[] = json.videoStreams
              .slice(0, 3)
              .map((s: { quality?: string; url: string }) => ({
                quality: (s.quality?.includes("1080") ? "1080p" : s.quality?.includes("720") ? "720p" : "default") as VideoDownloadItem["quality"],
                label: `HD Video (${s.quality || "MP4"})`,
                url: cleanEscapedUrl(s.url),
                format: "mp4",
              }));

            return {
              success: true,
              platform: "youtube",
              title: json.title || "YouTube Shorts",
              author: json.uploader,
              downloadUrl: cleanEscapedUrl(bestStream.url),
              thumbnailUrl: json.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              filename: `youtube_${videoId}.mp4`,
              items: items.length > 0 ? items : undefined,
            };
          }
        }

        // Check invidious format
        if (json.formatStreams && Array.isArray(json.formatStreams) && json.formatStreams.length > 0) {
          const mp4Stream =
            json.formatStreams.find((s: { container?: string; resolution?: string }) => s.container === "mp4" && s.resolution === "720p") ||
            json.formatStreams.find((s: { container?: string }) => s.container === "mp4") ||
            json.formatStreams[0];

          if (mp4Stream && mp4Stream.url) {
            const items: VideoDownloadItem[] = json.formatStreams.map(
              (s: { resolution?: string; qualityLabel?: string; url: string }) => ({
                quality: (s.resolution?.includes("1080") ? "1080p" : s.resolution?.includes("720") ? "720p" : "default") as VideoDownloadItem["quality"],
                label: `HD Video (${s.qualityLabel || s.resolution || "MP4"})`,
                url: cleanEscapedUrl(s.url),
                format: "mp4",
              })
            );

            return {
              success: true,
              platform: "youtube",
              title: json.title || "YouTube Shorts",
              author: json.author,
              downloadUrl: cleanEscapedUrl(mp4Stream.url),
              thumbnailUrl: json.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              filename: `youtube_${videoId}.mp4`,
              items: items.length > 0 ? items : undefined,
            };
          }
        }
      }
    } catch {
      // Continue to next gateway
    }
  }

  // Strategy 3: Cobalt fallback with canonical watch URL
  for (const instance of COBALT_INSTANCES) {
    const cobaltRes = await fetchFromCobaltInstance(instance, canonicalUrl);
    if (cobaltRes?.url) {
      const cleanUrl = cleanEscapedUrl(cobaltRes.url);
      return {
        success: true,
        platform: "youtube",
        title: cobaltRes.text || "YouTube Shorts",
        downloadUrl: cleanUrl,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        filename: cobaltRes.filename || `youtube_${videoId}.mp4`,
        items: [
          {
            quality: "1080p",
            label: "HD Video (MP4)",
            url: cleanUrl,
            format: "mp4",
          },
        ],
      };
    }
  }

  return null;
}

/**
 * Direct Instagram Reel / Video extraction
 */
async function extractInstagramDirect(targetUrl: string): Promise<ReelApiResponse | null> {
  const shortcode = extractInstagramShortcode(targetUrl);
  if (!shortcode) return null;

  // Strategy 1: Instagram Embed Page Scraping (no login required)
  try {
    const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent": USER_AGENTS[0],
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();

      const videoMatch =
        html.match(/\\"video_url\\":\\"([^"]+)\\"/) ||
        html.match(/"video_url":"([^"]+)"/) ||
        html.match(/class="EmbeddedMediaVideo"[^>]+src="([^"]+)"/i) ||
        html.match(/<video[^>]+src="([^"]+)"/i);

      const thumbMatch =
        html.match(/\\"display_url\\":\\"([^"]+)\\"/) ||
        html.match(/"display_url":"([^"]+)"/) ||
        html.match(/class="EmbeddedMediaImage"[^>]+src="([^"]+)"/i);

      const titleMatch =
        html.match(/class="Caption"[^>]*>([^<]+)<\/div>/i) ||
        html.match(/<title>([^<]+)<\/title>/i);

      if (videoMatch) {
        const videoUrl = cleanEscapedUrl(videoMatch[1]);
        const thumbUrl = thumbMatch ? cleanEscapedUrl(thumbMatch[1]) : undefined;
        const title = titleMatch ? titleMatch[1].replace(/Instagram/i, "").trim() : "Instagram Reel";

        return {
          success: true,
          platform: "instagram",
          title: title || "Instagram Reel",
          downloadUrl: videoUrl,
          thumbnailUrl: thumbUrl,
          filename: `instagram_${shortcode}.mp4`,
          items: [
            {
              quality: "1080p",
              label: "HD Video (MP4)",
              url: videoUrl,
              format: "mp4",
            },
          ],
        };
      }
    }
  } catch (err) {
    console.warn("[Instagram Embed Extractor failed]:", err);
  }

  // Strategy 2: Instagram GraphQL Query
  try {
    const graphqlUrl = `https://www.instagram.com/graphql/query/?doc_id=10015551848574243&variables=${encodeURIComponent(
      JSON.stringify({ shortcode })
    )}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(graphqlUrl, {
      headers: {
        "User-Agent": USER_AGENTS[0],
        "X-IG-App-ID": "936619743392459",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Site": "same-origin",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const media = json?.data?.xdt_shortcode_media;
      if (media && media.is_video && media.video_url) {
        const videoUrl = cleanEscapedUrl(media.video_url);
        const thumbUrl = media.display_url ? cleanEscapedUrl(media.display_url) : undefined;

        return {
          success: true,
          platform: "instagram",
          title: media.edge_media_to_caption?.edges?.[0]?.node?.text || "Instagram Reel",
          author: media.owner?.username,
          downloadUrl: videoUrl,
          thumbnailUrl: thumbUrl,
          filename: `instagram_${shortcode}.mp4`,
          items: [
            {
              quality: "1080p",
              label: "HD Video (MP4)",
              url: videoUrl,
              format: "mp4",
            },
          ],
        };
      }
    }
  } catch (err) {
    console.warn("[Instagram GraphQL Extractor failed]:", err);
  }

  return null;
}

/**
 * Direct Facebook video extraction from public page markup
 */
async function extractFacebookDirect(targetUrl: string): Promise<ReelApiResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": USER_AGENTS[0],
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const html = await res.text();

    const hdMatch =
      html.match(/"playable_url_quality_hd":"([^"]+)"/) ||
      html.match(/"browser_native_hd_url":"([^"]+)"/) ||
      html.match(/hd_src:"([^"]+)"/) ||
      html.match(/hd_src_no_ratelimit:"([^"]+)"/);

    const sdMatch =
      html.match(/"playable_url":"([^"]+)"/) ||
      html.match(/"browser_native_sd_url":"([^"]+)"/) ||
      html.match(/sd_src:"([^"]+)"/) ||
      html.match(/sd_src_no_ratelimit:"([^"]+)"/);

    const ogVideoMatch =
      html.match(/<meta\s+(?:property|name)="og:video(?::secure_url)?"\s+content="([^"]+)"/i) ||
      html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:video(?::secure_url)?"/i);

    const ogTitleMatch =
      html.match(/<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"/i) ||
      html.match(/<title>([^<]+)<\/title>/i);

    const ogImageMatch =
      html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i) ||
      html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i);

    const hdUrl = hdMatch ? cleanEscapedUrl(hdMatch[1]) : null;
    const sdUrl = sdMatch ? cleanEscapedUrl(sdMatch[1]) : null;
    const ogUrl = ogVideoMatch ? cleanEscapedUrl(ogVideoMatch[1]) : null;

    const mainVideoUrl = hdUrl || sdUrl || ogUrl;
    if (!mainVideoUrl) return null;

    const title = ogTitleMatch ? ogTitleMatch[1].replace(/ \| Facebook$/i, "").trim() : "Facebook Reel";
    const thumb = ogImageMatch ? cleanEscapedUrl(ogImageMatch[1]) : undefined;

    const items: VideoDownloadItem[] = [];
    if (hdUrl) {
      items.push({
        quality: "1080p",
        label: "HD Video (MP4)",
        url: hdUrl,
        format: "mp4",
      });
    }
    if (sdUrl && sdUrl !== hdUrl) {
      items.push({
        quality: "720p",
        label: "SD Video (MP4)",
        url: sdUrl,
        format: "mp4",
      });
    }
    if (items.length === 0) {
      items.push({
        quality: "default",
        label: "Download Video (MP4)",
        url: mainVideoUrl,
        format: "mp4",
      });
    }

    return {
      success: true,
      platform: "facebook",
      title,
      downloadUrl: items[0].url,
      thumbnailUrl: thumb,
      filename: "facebook_reel.mp4",
      items,
    };
  } catch (err) {
    console.warn("[FB Direct Extractor error]:", err);
    return null;
  }
}

/**
 * Direct TikTok extraction using high-availability public gateway (tikwm)
 */
async function extractTikTokDirect(targetUrl: string): Promise<ReelApiResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": USER_AGENTS[0],
      },
      body: new URLSearchParams({
        url: targetUrl,
        count: "12",
        cursor: "0",
        web: "1",
        hd: "1",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const json = (await res.json()) as {
      code: number;
      msg: string;
      data?: {
        id: string;
        title: string;
        cover: string;
        play: string;
        hdplay?: string;
        music?: string;
        author?: {
          nickname?: string;
          unique_id?: string;
        };
      };
    };

    if (json.code === 0 && json.data) {
      const videoData = json.data;
      const rawDownloadUrl = videoData.hdplay || videoData.play;
      const downloadUrl = rawDownloadUrl.startsWith("http")
        ? rawDownloadUrl
        : `https://www.tikwm.com${rawDownloadUrl}`;

      const items: VideoDownloadItem[] = [
        {
          quality: "1080p",
          label: "HD Video (No Watermark)",
          url: cleanEscapedUrl(downloadUrl),
          format: "mp4",
        },
      ];

      if (videoData.music) {
        const musicUrl = videoData.music.startsWith("http")
          ? videoData.music
          : `https://www.tikwm.com${videoData.music}`;
        items.push({
          quality: "audio",
          label: "Audio Only (MP3)",
          url: cleanEscapedUrl(musicUrl),
          format: "mp3",
        });
      }

      return {
        success: true,
        platform: "tiktok",
        title: videoData.title || "TikTok Video",
        author: videoData.author?.nickname || videoData.author?.unique_id,
        downloadUrl: items[0].url,
        thumbnailUrl: videoData.cover ? cleanEscapedUrl(videoData.cover) : undefined,
        filename: `tiktok_${videoData.id || "reel"}.mp4`,
        items,
      };
    }

    return null;
  } catch (err) {
    console.warn("[TikTok Direct Extractor error]:", err);
    return null;
  }
}

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
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": "OmniTools-VideoDownloader/1.0",
  };

  if (process.env.COBALT_API_KEY) {
    headers["Authorization"] = `Api-Key ${process.env.COBALT_API_KEY}`;
  }

  try {
    const res = await fetch(endpoint.endsWith("/") ? endpoint : `${endpoint}/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        url: targetUrl,
        videoQuality: "1080",
        filenameStyle: "pretty",
        downloadMode: "auto",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    return (await res.json()) as CobaltResponse;
  } catch {
    clearTimeout(timeoutId);
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

    // 0. Try local yt-dlp engine first (highest reliability across all video sources)
    const ytdlpRes = await extractWithYtDlp(cleanUrl, platform);
    if (ytdlpRes && ytdlpRes.downloadUrl) {
      return NextResponse.json(ytdlpRes);
    }

    // 1. Try Platform-Specific Direct Extractors First
    if (platform === "youtube") {
      const ytRes = await extractYouTubeDirect(cleanUrl);
      if (ytRes && ytRes.downloadUrl) {
        return NextResponse.json(ytRes);
      }
    }

    if (platform === "instagram") {
      const igRes = await extractInstagramDirect(cleanUrl);
      if (igRes && igRes.downloadUrl) {
        return NextResponse.json(igRes);
      }
    }

    if (platform === "tiktok") {
      const tiktokRes = await extractTikTokDirect(cleanUrl);
      if (tiktokRes && tiktokRes.downloadUrl) {
        return NextResponse.json(tiktokRes);
      }
    }

    if (platform === "facebook") {
      const fbRes = await extractFacebookDirect(cleanUrl);
      if (fbRes && fbRes.downloadUrl) {
        return NextResponse.json(fbRes);
      }
    }

    // 2. Try Cobalt Instances
    let cobaltData: CobaltResponse | null = null;
    for (const instance of COBALT_INSTANCES) {
      cobaltData = await fetchFromCobaltInstance(instance, cleanUrl);
      if (cobaltData && cobaltData.status !== "error" && cobaltData.status !== "rate-limit") {
        break;
      }
    }

    // 3. Fallback direct platform checks if Cobalt didn't catch it
    if (!cobaltData || cobaltData.status === "error") {
      if (platform === "youtube") {
        const ytFallback = await extractYouTubeDirect(cleanUrl);
        if (ytFallback && ytFallback.downloadUrl) {
          return NextResponse.json(ytFallback);
        }
      }
      if (platform === "instagram") {
        const igFallback = await extractInstagramDirect(cleanUrl);
        if (igFallback && igFallback.downloadUrl) {
          return NextResponse.json(igFallback);
        }
      }
      if (platform === "facebook") {
        const fbFallback = await extractFacebookDirect(cleanUrl);
        if (fbFallback && fbFallback.downloadUrl) {
          return NextResponse.json(fbFallback);
        }
      }
    }

    if (!cobaltData) {
      return NextResponse.json(
        {
          success: false,
          platform,
          error:
            "Could not fetch video. The post might be private, deleted, restricted by the creator, or temporarily rate-limited. Please verify that the post is public.",
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
        url: cleanEscapedUrl(item.url),
        format: item.type === "photo" ? "mp4" : "mp4",
      }));

      return NextResponse.json({
        success: true,
        platform,
        title: `${platform.toUpperCase()} Media Carousel (${cobaltData.picker.length} items)`,
        downloadUrl: cleanEscapedUrl(firstItem.url),
        thumbnailUrl: firstItem.thumb ? cleanEscapedUrl(firstItem.thumb) : undefined,
        filename: cobaltData.filename || `${platform}_reel.mp4`,
        items,
      } satisfies ReelApiResponse);
    }

    // Handle single direct video/tunnel response
    if (cobaltData.url) {
      const filename = cobaltData.filename || `${platform}_video.mp4`;
      const cleanDownloadUrl = cleanEscapedUrl(cobaltData.url);

      const items: VideoDownloadItem[] = [
        {
          quality: "1080p",
          label: "HD Video (MP4 - No Watermark)",
          url: cleanDownloadUrl,
          format: "mp4",
        },
      ];

      return NextResponse.json({
        success: true,
        platform,
        title: cobaltData.text || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Reel`,
        downloadUrl: cleanDownloadUrl,
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
