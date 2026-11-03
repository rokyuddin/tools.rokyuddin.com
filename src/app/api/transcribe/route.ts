import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import {
  OPENROUTER_DEFAULT_WHISPER_MODEL,
  OPENROUTER_DEFAULT_TEXT_MODEL,
} from "@/lib/openrouter";

export const maxDuration = 60;

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenRouter API key is not configured on the server. Please add OPENROUTER_API_KEY in your Vercel project environment variables.",
      },
      { status: 503 },
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. JSON payload: AI Subtitle Polishing & Translation
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { cues, action } = body;

      if (!cues || !Array.isArray(cues) || cues.length === 0) {
        return NextResponse.json(
          { error: "No subtitle cues provided." },
          { status: 400 },
        );
      }

      let systemPrompt = "";
      if (action === "polish") {
        systemPrompt =
          "You are an expert bilingual subtitle editor. Correct grammar, spelling, and natural punctuation in the provided subtitles while preserving the exact Bengali or English language, timestamps, and JSON structure. Return ONLY a valid JSON array of objects with keys 'id', 'start', 'end', 'text'.";
      } else if (action === "translate_to_bn") {
        systemPrompt =
          "Translate each subtitle cue into natural, fluent Bengali (বাংলা). Preserve the exact 'id', 'start', and 'end' timing values. Return ONLY a valid JSON array of objects with keys 'id', 'start', 'end', 'text'.";
      } else {
        systemPrompt =
          "Translate each subtitle cue into clear, natural English. Preserve the exact 'id', 'start', and 'end' timing values. Return ONLY a valid JSON array of objects with keys 'id', 'start', 'end', 'text'.";
      }

      const cueItems = cues.map((c: any) => ({
        id: c.id,
        start: c.start,
        end: c.end,
        text: c.text,
      }));

      const userPrompt = `Here are the subtitle cues in JSON format:\n${JSON.stringify(cueItems, null, 2)}`;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "HTTP-Referer": siteConfig.url,
          "X-OpenRouter-Title": siteConfig.name,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OPENROUTER_DEFAULT_TEXT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        return NextResponse.json(
          {
            error:
              errorBody.error?.message ||
              `OpenRouter completion failed with status ${res.status}.`,
          },
          { status: res.status },
        );
      }

      const completion = await res.json();
      const rawText = completion.choices?.[0]?.message?.content || "";
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        return NextResponse.json(
          { error: "Could not parse AI response into subtitle cues." },
          { status: 500 },
        );
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ cues: parsed });
    }

    // 2. Multipart form data: Speech-to-Text Audio Transcription
    const formData = await req.formData();
    const file = formData.get("file") as File | Blob | null;
    const language = (formData.get("language") as string) || "bn-BD";
    const langCode = language.startsWith("bn") ? "bn" : "en";

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "audio/mp3";
    const audioFormat = mimeType.includes("wav") ? "wav" : "mp3";

    // Primary: Gemini 2.5 Flash for continuous full-coverage speech-to-text with timestamps
    try {
      const geminiPrompt = `You are an expert bilingual speech-to-text transcriber and subtitle generator. Transcribe the entire attached audio recording from 00:00 to the end in ${langCode === "bn" ? "Bangla / Bengali (বাংলা)" : "English"}.
CRITICAL INSTRUCTIONS:
1. Transcribe EVERY spoken phrase, sentence, and dialogue across the entire duration without omitting anything.
2. Segment the transcription into natural, synchronized subtitle cues (around 2 to 6 seconds per cue).
3. Return ONLY a valid JSON array of cue objects with:
   - "id": string (e.g. "cue-1", "cue-2")
   - "start": float (start time in seconds, e.g. 0.0)
   - "end": float (end time in seconds, e.g. 3.5)
   - "text": string (the exact transcribed speech)
Example format:
[
  {"id": "cue-1", "start": 0.0, "end": 3.5, "text": "প্রথম বাক্য..."},
  {"id": "cue-2", "start": 3.8, "end": 7.2, "text": "পরবর্তী বাক্য..."}
]
Output ONLY the raw JSON array. Do NOT wrap in markdown fences or include explanations.`;

      const geminiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "HTTP-Referer": siteConfig.url,
          "X-OpenRouter-Title": siteConfig.name,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OPENROUTER_DEFAULT_TEXT_MODEL,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: geminiPrompt,
                },
                {
                  type: "input_audio",
                  input_audio: {
                    data: base64Audio,
                    format: audioFormat,
                  },
                },
              ],
            },
          ],
          temperature: 0.1,
        }),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const content = geminiData.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedCues = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsedCues) && parsedCues.length > 0) {
            return NextResponse.json({ cues: parsedCues });
          }
        }
      }
    } catch (geminiErr) {
      console.warn("Gemini transcription fallback to Whisper:", geminiErr);
    }

    // Fallback: Whisper Large v3 with prompt and verbose_json
    const openRouterFormData = new FormData();
    const audioBlob = new Blob([arrayBuffer], { type: "audio/mp3" });
    openRouterFormData.append("file", audioBlob, "audio.mp3");
    openRouterFormData.append("model", OPENROUTER_DEFAULT_WHISPER_MODEL);
    openRouterFormData.append("language", langCode);
    openRouterFormData.append("response_format", "verbose_json");
    openRouterFormData.append(
      "prompt",
      langCode === "bn"
        ? "বাংলা অডিও কথোপকথন ও সাবটাইটেল। শুরু থেকে শেষ পর্যন্ত সম্পূর্ণ বক্তব্য নির্ভুলভাবে ট্রান্সক্রাইব করুন।"
        : "Accurate, continuous English speech-to-text with timestamps across the entire audio.",
    );
    openRouterFormData.append("temperature", "0.0");

    const openRouterRes = await fetch(
      "https://openrouter.ai/api/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "HTTP-Referer": siteConfig.url,
          "X-OpenRouter-Title": siteConfig.name,
        },
        body: openRouterFormData,
      },
    );

    if (!openRouterRes.ok) {
      const errorBody = await openRouterRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorBody.error?.message ||
            `OpenRouter transcription failed with status ${openRouterRes.status}.`,
        },
        { status: openRouterRes.status },
      );
    }

    const transcriptionData = await openRouterRes.json();
    return NextResponse.json(transcriptionData);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal transcription error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
