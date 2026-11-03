import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { getToolBySlug } from "@/config/tools";
import { VideoToAudio } from "@/features/video-to-audio/components/VideoToAudio";

export const metadata: Metadata = {
  title: "Free Video to Audio Extractor & Converter – Extract MP3, WAV, AAC from Video Online",
  description:
    "Extract audio tracks from MP4, WebM, MOV, and MKV videos online in high quality. Download as MP3, WAV, AAC, or OGG with custom bitrate and audio trimming. 100% private in-browser tool.",
  keywords: [
    "video to audio",
    "extract audio from video",
    "mp4 to mp3 online",
    "video to mp3 converter",
    "extract wav from video",
    "rip audio from mp4 free",
    "video sound extractor",
    "client-side video to audio",
  ],
};

export default function VideoToAudioPage() {
  const tool = getToolBySlug("video-to-audio");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <VideoToAudio />
    </ToolShell>
  );
}
