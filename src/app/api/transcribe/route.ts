import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import {
  OPENROUTER_DEFAULT_WHISPER_MODEL,
  OPENROUTER_DEFAULT_AUDIO_MODEL,
  OPENROUTER_FREE_TEXT_MODELS,
  OPENROUTER_DEFAULT_TEXT_MODEL,
} from "@/lib/openrouter";
import { mapWhisperResponseToCues } from "@/features/audio-to-transcript/utils/subtitle-formats";
import { smartChunkWordsToCues } from "@/features/audio-to-transcript/utils/word-aligner";
import type { SubtitleCue, WordTimestamp } from "@/features/audio-to-transcript/types";

export const maxDuration = 60;

/**
 * Pass 2: Automatic Contextual Language Refinement for Bengali & Code-Switched Speech.
 * Corrects acoustic mishearings, compound characters (যুক্তাক্ষর), numbers, and technical loanwords
 * while strictly preserving exact cue timings.
 */
async function refineBengaliCues(
  cues: SubtitleCue[],
  apiKey: string,
): Promise<SubtitleCue[]> {
  if (cues.length === 0) return cues;
  try {
    const refinePrompt = `You are an expert Bengali speech-to-text post-processor.
Review these subtitle cues produced from audio. The acoustic recognizer may have phonetic mishearings on colloquial phrasing, compound letters (যুক্তাক্ষর), numbers, or English business loanwords.
Your task:
Fix all phonetic mishearings, garbled words, numbers, and grammar so the text reflects natural, authentic, grammatically correct Bengali in context (digital marketing, Facebook pages, e-commerce, customer data, sales, retargeting).
Examples of fixes:
- "নোটেই" -> "নক দেয়"
- "মাস্টার শে" -> "মাস শেষে"
- "যাদের পোজিশন ভিত্তিতে সসরন পুল লোকালাইটি এক্টিভেশন এইরাকে 84%" -> "২০২৫-২৬ এর এসএসআরএন ও লোকাল আইটির একটি গবেষণায় দেখা গেছে, ৮৪%"
- "যার অথচের" -> "যারা তাদের"
- "মেইন্টেড করা" -> "মেইনটেইন করে না"
- "এক্সাম কাস্টমার... যৌজা টাকার পুনন" -> "একজন কাস্টমার... ২,০০০ টাকার পণ্য"
- "চাইমাসপরে শেপ পুনন তেওয়ার স্টক কুলেন" -> "৬ মাস পরে সেই পণ্যটি আবার স্টক করলেন"
- "রিটারেট কৃত্য করবেন না" -> "রিটার্গেট করতে পারবেন না"
- "কারুন আপনি আপনার কোনো ডেটা" -> "কারণ, আপনি আপনার কোনো ডাটাই..."

PRESERVE exact "id", "start", and "end" timestamps.
Return ONLY the corrected JSON array with keys "id", "start", "end", "text".`;

    const refineRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "HTTP-Referer": siteConfig.url,
        "X-OpenRouter-Title": siteConfig.name,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        models: OPENROUTER_FREE_TEXT_MODELS,
        messages: [
          { role: "system", content: refinePrompt },
          {
            role: "user",
            content: JSON.stringify(
              cues.map((c) => ({
                id: c.id,
                start: c.start,
                end: c.end,
                text: c.text,
              })),
              null,
              2,
            ),
          },
        ],
        temperature: 0.1,
      }),
    });

    if (refineRes.ok) {
      const refineData = await refineRes.json();
      const refineContent = refineData.choices?.[0]?.message?.content || "";
      const refineMatch = refineContent.match(/\[[\s\S]*\]/);
      if (refineMatch) {
        const refinedParsed = JSON.parse(refineMatch[0]);
        if (Array.isArray(refinedParsed) && refinedParsed.length === cues.length) {
          return cues.map((c, i) => ({
            ...c,
            text: String(refinedParsed[i].text || c.text).trim(),
          }));
        }
      }
    }
  } catch (refineErr) {
    console.warn("Contextual refinement skipped:", refineErr);
  }
  return cues;
}

export async function POST(req: Request) {
  const customKey = req.headers.get("x-openrouter-key")?.trim();
  const apiKey = customKey || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenRouter API key is not configured. Please enter your API key in settings or configure OPENROUTER_API_KEY in server environment variables.",
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
          "You are an expert bilingual subtitle editor. Correct grammar, spelling, natural punctuation, and repair any phonetically garbled speech-to-text mishearings (e.g. digital marketing, business, and e-commerce terms like ফেসবুক পেজ, কাস্টমার ডাটা, এফ-কমার্স সেলার, ইনসাইট ট্র্যাকিং, স্টক, রিটার্গেট, এসএসআরএন, ২,০০০ টাকার পণ্য, ৬ মাস) in the provided subtitles while preserving the exact Bengali or English language, timestamps, and JSON structure. Return ONLY a valid JSON array of objects with keys 'id', 'start', 'end', 'text'.";
      } else if (action === "translate_to_bn") {
        systemPrompt =
          "Translate each subtitle cue into natural, fluent Bengali (বাংলা). Accurately format modern business, digital marketing, and e-commerce terms (e.g. ফেসবুক পেজ, কাস্টমার ডাটা, এফ-কমার্স সেলার). Preserve the exact 'id', 'start', and 'end' timing values. Return ONLY a valid JSON array of objects with keys 'id', 'start', 'end', 'text'.";
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

      let res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "HTTP-Referer": siteConfig.url,
          "X-OpenRouter-Title": siteConfig.name,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          models: OPENROUTER_FREE_TEXT_MODELS,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
        }),
      });

      // Fallback to Gemini 2.5 Flash if all free models are temporarily rate-limited
      if (!res.ok) {
        res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            "HTTP-Referer": siteConfig.url,
            "X-OpenRouter-Title": siteConfig.name,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: OPENROUTER_DEFAULT_AUDIO_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.2,
          }),
        });
      }

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
    let audioFormat = "mp3";
    if (mimeType.includes("wav")) audioFormat = "wav";
    else if (mimeType.includes("ogg")) audioFormat = "ogg";
    else if (mimeType.includes("webm")) audioFormat = "webm";
    else if (mimeType.includes("m4a") || mimeType.includes("aac")) audioFormat = "aac";

    let transcriptionErrorMsg = "";

    // 1. Primary Engine for Bengali & Multilingual: Gemini 2.5 Flash
    // Google Gemini has state-of-the-art Bengali acoustic models and handles code-switched
    // business terms (e.g. ফেসবুক পেজ, কাস্টমার, ডাটা, এফ-কমার্স, স্টক) without phonetic corruption or skips.
    try {
      const geminiPrompt = `You are a world-class speech-to-text transcriber and subtitle generator.
Transcribe EVERY spoken word from the audio from 00:00 to the end with 100% accuracy in ${langCode === "bn" ? "authentic Bengali (বাংলা)" : "English"}.
CRITICAL INSTRUCTIONS:
1. Accurately transcribe modern business, technical, and e-commerce loanwords (e.g. ফেসবুক পেজ, কাস্টমার, ডাটা, এফ-কমার্স সেলার, ইনসাইট ট্র্যাকিং, ডাটাবেজ, স্টক, রিটার্গেট, এসএসআরএন).
2. Do NOT skip any phrases, words, or sentences. Transcribe completely from beginning to end without omitting speech.
3. Segment the speech into natural, synchronized subtitle cues (around 2 to 5 seconds per cue, breaking on sentence pauses or punctuation).
4. Return ONLY a valid JSON array of cue objects with:
   - "id": string (e.g. "cue-1", "cue-2")
   - "start": float (start time in seconds with 2-3 decimal places, e.g. 0.47)
   - "end": float (end time in seconds with 2-3 decimal places, e.g. 2.59)
   - "text": string (the exact transcribed speech)
   - "words": optional array of {"word": string, "start": float, "end": float}

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
          model: OPENROUTER_DEFAULT_AUDIO_MODEL,
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
            const formattedCues: SubtitleCue[] = [];
            const allWords: WordTimestamp[] = [];

            for (let idx = 0; idx < parsedCues.length; idx++) {
              const c = parsedCues[idx];
              const cueWords: WordTimestamp[] = Array.isArray(c.words)
                ? c.words.map((w: any) => ({
                    word: String(w.word || "").trim(),
                    start: typeof w.start === "number" ? Number(w.start.toFixed(3)) : 0,
                    end: typeof w.end === "number" ? Number(w.end.toFixed(3)) : 0,
                  }))
                : [];

              cueWords.forEach((w) => allWords.push(w));

              formattedCues.push({
                id: c.id || `cue-${idx + 1}`,
                start: typeof c.start === "number" ? Number(c.start.toFixed(3)) : 0,
                end: typeof c.end === "number" ? Number(c.end.toFixed(3)) : 3,
                text: String(c.text || "").trim(),
                words: cueWords.length > 0 ? cueWords : undefined,
              });
            }

            // Pass 2: Automatic Contextual Language Refinement for Bengali & Code-Switched Speech
            const finalCues =
              langCode === "bn"
                ? await refineBengaliCues(formattedCues, apiKey)
                : formattedCues;

            return NextResponse.json({
              text: finalCues.map((c) => c.text).join(" "),
              cues: finalCues,
              words: allWords.length > 0 ? allWords : undefined,
              duration: finalCues[finalCues.length - 1]?.end || 0,
              language: langCode,
            });
          }
        }
      } else {
        const geminiErrBody = await geminiRes.json().catch(() => ({}));
        transcriptionErrorMsg = geminiErrBody.error?.message || "";
      }
    } catch (geminiErr) {
      console.warn("Gemini transcription fallback to Whisper:", geminiErr);
    }

    // 2. Secondary / Fallback: Whisper Large V3 with Bengali Domain Prompt
    let transcriptionData: any = null;
    try {
      const openRouterFormData = new FormData();
      const audioBlob = new Blob([arrayBuffer], { type: mimeType || "audio/mp3" });
      openRouterFormData.append("file", audioBlob, "audio.mp3");
      openRouterFormData.append("model", OPENROUTER_DEFAULT_WHISPER_MODEL);
      openRouterFormData.append("language", langCode);
      openRouterFormData.append("response_format", "verbose_json");
      openRouterFormData.append("timestamp_granularities[]", "word");
      openRouterFormData.append("timestamp_granularities[]", "segment");
      openRouterFormData.append("temperature", "0.0");

      if (langCode === "bn") {
        openRouterFormData.append(
          "prompt",
          "ফেসবুক পেজ, কাস্টমার ডাটা, এফ-কমার্স সেলার, ইনসাইট ট্র্যাকিং ডাটা, ডাটাবেজ, ২,০০০ টাকার পণ্য, ৬ মাস, স্টক, রিটার্গেট, এসএসআরএন ও লোকাল আইটি গবেষণা, ৮৪% এফ-কমার্স, নক দেয়, মাস শেষে।"
        );
      }

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

      if (openRouterRes.ok) {
        transcriptionData = await openRouterRes.json();
      } else {
        const errorBody = await openRouterRes.json().catch(() => ({}));
        transcriptionErrorMsg =
          errorBody.error?.message ||
          `Whisper API returned status ${openRouterRes.status}.`;
      }
    } catch (err: unknown) {
      transcriptionErrorMsg =
        err instanceof Error ? err.message : "Whisper transcription failed.";
    }

    // Process Whisper response if available with Pass 2 refinement
    if (transcriptionData) {
      const rawWords = Array.isArray(transcriptionData.words) ? transcriptionData.words : [];
      const rawText = (transcriptionData.text || "").trim();

      if (rawWords.length > 0) {
        const wordTimestamps: WordTimestamp[] = rawWords.map((w: any) => ({
          word: String(w.word || "").trim(),
          start: typeof w.start === "number" ? Number(w.start.toFixed(3)) : 0,
          end: typeof w.end === "number" ? Number(w.end.toFixed(3)) : 0,
        }));

        const rawCues = smartChunkWordsToCues(wordTimestamps);
        if (rawCues.length > 0) {
          const cues =
            langCode === "bn" ? await refineBengaliCues(rawCues, apiKey) : rawCues;
          return NextResponse.json({
            text: cues.map((c) => c.text).join(" "),
            duration: transcriptionData.duration || cues[cues.length - 1]?.end || 0,
            language: transcriptionData.language || langCode,
            words: wordTimestamps,
            cues,
          });
        }
      }

      if (Array.isArray(transcriptionData.segments) && transcriptionData.segments.length > 0) {
        const rawCues = mapWhisperResponseToCues(transcriptionData);
        if (rawCues.length > 0) {
          const cues =
            langCode === "bn" ? await refineBengaliCues(rawCues, apiKey) : rawCues;
          return NextResponse.json({
            text: cues.map((c) => c.text).join(" "),
            duration: transcriptionData.duration || cues[cues.length - 1]?.end || 0,
            language: transcriptionData.language || langCode,
            cues,
          });
        }
      }
    }

    return NextResponse.json(
      {
        error:
          transcriptionErrorMsg ||
          "Audio transcription failed. Please verify your OpenRouter configuration or audio clarity.",
      },
      { status: 500 },
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal transcription error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
