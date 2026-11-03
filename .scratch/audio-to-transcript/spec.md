# Spec: Audio & Video Transcript Generator with Timestamps

## Overview
A web utility for generating timestamped transcripts and subtitle files from audio or video recordings, with a primary focus on Bangla (`bn-BD`, `bn-IN`) and English (`en-US`, `en-GB`, `en-IN`).

## Requirements
1. Support both Audio and Video input files.
2. Synchronized video/audio player with live subtitle overlay.
3. Bilingual speech recognition:
   - Built-in Web Speech API for real-time in-browser transcription.
   - Optional AI Whisper API (Groq/OpenAI) for rapid batch transcription.
4. Interactive Subtitle Studio:
   - Real-time cue highlighting during playback.
   - Click to seek navigation.
   - Inline text editing (Bangla / English).
   - Timestamp fine-tuning (-0.5s / +0.5s nudge).
   - Add, delete, split, and merge cues.
   - Global search & replace.
5. Export & Download Formats:
   - SubRip (`.srt`)
   - WebVTT (`.vtt`)
   - Timestamped Text (`.txt`)
   - Plain Text (`.txt`)
   - JSON (`.json`)
   - CSV (`.csv`)
   - Copy to clipboard
6. 100% private in-browser execution.
