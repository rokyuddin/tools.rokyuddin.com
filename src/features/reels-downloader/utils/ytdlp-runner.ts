import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs";
import type { ReelApiResponse, VideoDownloadItem } from "@/features/reels-downloader/types";
import { cleanEscapedUrl } from "./url-detector";

const execFileAsync = promisify(execFile);

/**
 * Resolves the path to the yt-dlp binary if present
 */
export function getLocalYtDlpPath(): string | null {
  const customPath = process.env.YT_DLP_PATH;
  if (customPath && fs.existsSync(customPath)) {
    return customPath;
  }

  const projectBin = path.join(process.cwd(), "bin", "yt-dlp");
  if (fs.existsSync(projectBin)) {
    return projectBin;
  }

  const projectBinExe = path.join(process.cwd(), "bin", "yt-dlp.exe");
  if (fs.existsSync(projectBinExe)) {
    return projectBinExe;
  }

  return null;
}

interface YtDlpFormat {
  format_id?: string;
  format_note?: string;
  ext?: string;
  protocol?: string;
  resolution?: string;
  width?: number;
  height?: number;
  vcodec?: string;
  acodec?: string;
  filesize?: number;
  filesize_approx?: number;
  url?: string;
}

interface YtDlpOutput {
  id?: string;
  title?: string;
  uploader?: string;
  channel?: string;
  thumbnail?: string;
  url?: string;
  ext?: string;
  formats?: YtDlpFormat[];
  requested_formats?: YtDlpFormat[];
}

/**
 * Normalizes input social URLs to maximize compatibility with yt-dlp
 */
function normalizeUrlForYtDlp(url: string): string {
  let clean = url.trim();

  // Strip trailing /video/1, /photo/1, etc.
  clean = clean.replace(/\/(?:video|photo)\/\d+/i, "");

  // Normalize x.com URLs to twitter.com
  clean = clean.replace(/^https?:\/\/x\.com\//i, "https://twitter.com/");

  return clean;
}

/**
 * Extracts video stream info using local or bundled yt-dlp binary
 */
export async function extractWithYtDlp(
  targetUrl: string,
  platform: ReelApiResponse["platform"]
): Promise<ReelApiResponse | null> {
  const binaryPath = getLocalYtDlpPath();
  if (!binaryPath) return null;

  const normalizedUrl = normalizeUrlForYtDlp(targetUrl);

  try {
    const { stdout } = await execFileAsync(
      binaryPath,
      [
        "--dump-single-json",
        "--no-warnings",
        "--no-check-certificates",
        "--prefer-free-formats",
        "--no-playlist",
        normalizedUrl,
      ],
      {
        timeout: 15000,
        maxBuffer: 10 * 1024 * 1024,
      }
    );

    if (!stdout || !stdout.trim()) return null;

    const data = JSON.parse(stdout) as YtDlpOutput;
    const title = data.title || `${platform.toUpperCase()} Video`;
    const author = data.uploader || data.channel;
    const thumbnail = data.thumbnail ? cleanEscapedUrl(data.thumbnail) : undefined;
    const videoId = data.id || "media";

    const formats = data.formats || [];
    const items: VideoDownloadItem[] = [];

    // 1. Prioritize true standalone HTTP/HTTPS MP4 video files (exclude plain-text m3u8/mpd playlists)
    const directMp4Files = formats.filter(
      (f) =>
        f.url &&
        (f.protocol === "https" || f.protocol === "http" || !f.protocol || !f.protocol.includes("m3u8")) &&
        !f.url.includes(".m3u8") &&
        !f.url.includes(".mpd") &&
        (f.ext === "mp4" || f.url.includes(".mp4") || f.format_id?.startsWith("http") || f.vcodec !== "none")
    );

    // 2. Fallback to other progressive formats if direct MP4 is not found
    const otherStreams = formats.filter(
      (f) => f.url && !f.url.includes(".m3u8") && !f.url.includes(".mpd") && !directMp4Files.includes(f)
    );

    // 3. Last resort HLS streams
    const hlsStreams = formats.filter(
      (f) => f.url && (f.url.includes(".m3u8") || f.url.includes(".mpd"))
    );

    const prioritized = [
      ...directMp4Files.reverse(),
      ...otherStreams.reverse(),
      ...hlsStreams.reverse(),
    ];

    // Best 1080p stream
    const format1080 = prioritized.find(
      (f) =>
        (f.height && f.height >= 1080) ||
        f.resolution?.includes("1080") ||
        f.format_note?.includes("1080")
    );
    if (format1080?.url) {
      items.push({
        quality: "1080p",
        label: `HD Video (1080p MP4)`,
        url: cleanEscapedUrl(format1080.url),
        format: "mp4",
      });
    }

    // Best 720p stream
    const format720 = prioritized.find(
      (f) =>
        (f.height && f.height >= 720 && f.height < 1080) ||
        f.resolution?.includes("720") ||
        f.format_note?.includes("720")
    );
    if (format720?.url && format720.url !== format1080?.url) {
      items.push({
        quality: "720p",
        label: `HD Video (720p MP4)`,
        url: cleanEscapedUrl(format720.url),
        format: "mp4",
      });
    }

    // Best 480p/360p or fallback stream
    const fallbackVideo = prioritized.find(
      (f) => f.url && !items.some((i) => i.url === cleanEscapedUrl(f.url!))
    );
    if (fallbackVideo?.url) {
      items.push({
        quality: "default",
        label: `Download Video (${fallbackVideo.resolution || fallbackVideo.ext || "MP4"})`,
        url: cleanEscapedUrl(fallbackVideo.url),
        format: "mp4",
      });
    }

    // Audio stream
    const audioFormat = formats.find(
      (f) => f.url && f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none")
    );
    if (audioFormat && audioFormat.url) {
      items.push({
        quality: "audio",
        label: `Audio Track (${audioFormat.ext?.toUpperCase() || "MP3"})`,
        url: cleanEscapedUrl(audioFormat.url),
        format: "mp3",
      });
    }

    const mainDownloadUrl = items[0]?.url || (data.url ? cleanEscapedUrl(data.url) : "");
    if (!mainDownloadUrl) return null;

    return {
      success: true,
      platform,
      title,
      author,
      thumbnailUrl: thumbnail,
      downloadUrl: mainDownloadUrl,
      filename: `${platform}_${videoId}.mp4`,
      items: items.length > 0 ? items : undefined,
    };
  } catch (err) {
    console.warn("[yt-dlp runner error]:", err);
    return null;
  }
}
