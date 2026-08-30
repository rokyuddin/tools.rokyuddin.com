export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "twitter"
  | "unknown";

export interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  badgeLabel: string;
  placeholder: string;
  colorClass: string;
  exampleUrl: string;
}

export interface VideoDownloadItem {
  quality: "1080p" | "720p" | "480p" | "audio" | "default";
  label: string;
  url: string;
  format: "mp4" | "mp3" | "webm";
  fileSizeBytes?: number;
}

export interface ReelApiResponse {
  success: boolean;
  platform: SocialPlatform;
  title?: string;
  author?: string;
  authorUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  downloadUrl?: string;
  audioUrl?: string;
  filename?: string;
  items?: VideoDownloadItem[];
  error?: string;
}
