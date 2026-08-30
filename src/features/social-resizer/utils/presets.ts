export interface SocialPreset {
  id: string;
  platform: "Instagram" | "Facebook" | "LinkedIn" | "Twitter" | "YouTube";
  name: string;
  aspectRatio: string;
  width: number;
  height: number;
}

export const socialPresets: SocialPreset[] = [
  {
    id: "ig-square",
    platform: "Instagram",
    name: "Square Post",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
  },
  {
    id: "ig-portrait",
    platform: "Instagram",
    name: "Portrait Post",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
  },
  {
    id: "ig-story",
    platform: "Instagram",
    name: "Story / Reel",
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
  },
  {
    id: "fb-post",
    platform: "Facebook",
    name: "Feed Post",
    aspectRatio: "1.91:1",
    width: 1200,
    height: 630,
  },
  {
    id: "fb-cover",
    platform: "Facebook",
    name: "Page Cover",
    aspectRatio: "16:9",
    width: 820,
    height: 312,
  },
  {
    id: "li-post",
    platform: "LinkedIn",
    name: "Feed Post",
    aspectRatio: "1.91:1",
    width: 1200,
    height: 627,
  },
  {
    id: "li-banner",
    platform: "LinkedIn",
    name: "Profile Banner",
    aspectRatio: "4:1",
    width: 1584,
    height: 396,
  },
  {
    id: "tw-post",
    platform: "Twitter",
    name: "X (Twitter) Post",
    aspectRatio: "16:9",
    width: 1600,
    height: 900,
  },
  {
    id: "yt-thumb",
    platform: "YouTube",
    name: "Video Thumbnail",
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
  },
];
