# Timestamped Transcript and Subtitle Generation Architecture

For transcription of audio and video recordings focusing on Bangla (`bn-BD`, `bn-IN`) and English (`en-US`, `en-GB`, `en-IN`), the application implements a multi-tiered architecture:

1. **Native In-Browser Web Speech API**: Instant, zero-account speech recognition providing real-time segment timestamps synchronized to the media playback cursor.
2. **OpenRouter Unified AI Integration**: Centralized AI integration using OpenRouter (`@openrouter/sdk` and `https://openrouter.ai/api/v1`) via a secure Next.js server route (`/api/transcribe`) for speech-to-text (`openai/whisper-large-v3`) with segment timestamps, plus bilingual subtitle translation and grammar polishing across leading LLMs (`google/gemini-2.5-flash`, `openai/gpt-4o-mini`). The `OPENROUTER_API_KEY` is configured securely in Vercel environment variables, eliminating the need to prompt the user for API keys in the browser. Before transmission, videos have their audio decoded and compressed to a lightweight MP3 track in-browser to respect serverless payload limits.
3. **Interactive Subtitle Studio**: Bi-directional synchronization between the video/audio player and the transcript editor. Subtitles are rendered live on top of the media, active segments auto-scroll, and clicking any cue immediately seeks the playback cursor.
4. **Universal Export Pipeline**: Pure TypeScript formatters generate SubRip (`.srt`), WebVTT (`.vtt`), Timestamped Text (`.txt`), Plain Text (`.txt`), JSON, and CSV.
