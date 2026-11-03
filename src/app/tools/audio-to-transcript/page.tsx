import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell/ToolShell";
import { getToolBySlug } from "@/config/tools";
import { AudioToTranscript } from "@/features/audio-to-transcript/components/AudioToTranscript";

export const metadata: Metadata = {
  title: "Free Audio to Transcript & Subtitle Generator – Timestamped Captions for Bangla & English",
  description:
    "Transcribe audio and video files with timestamps in Bangla (বাংলা) and English. Includes a synchronized video subtitle player, live caption editor, and downloads in SRT, VTT, TXT, JSON, and CSV. 100% private in-browser tool.",
  keywords: [
    "audio to transcript",
    "video subtitle generator",
    "bangla speech to text",
    "bangla audio to text",
    "audio to srt",
    "audio to vtt converter",
    "generate subtitles with timestamps",
    "timestamped audio transcription",
    "english bangla transcription online",
  ],
};

export default function AudioToTranscriptPage() {
  const tool = getToolBySlug("audio-to-transcript");
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      <AudioToTranscript />
    </ToolShell>
  );
}
