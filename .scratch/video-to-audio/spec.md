# Spec: Video to Audio Extractor & Converter

## Overview
A fast, privacy-first, 100% in-browser web tool that allows users to extract audio tracks from any video file (MP4, WebM, MOV, MKV, AVI, etc.) and download the extracted audio in multiple formats: MP3, WAV, AAC/M4A, and OGG/WebM Opus.

## Requirements
1. Drag & drop / file upload supporting all common video formats.
2. In-browser extraction using Web Audio API (`AudioContext.decodeAudioData`).
3. Audio quality and format selection:
   - MP3 with 128kbps, 192kbps, 256kbps, 320kbps presets.
   - WAV (16-bit uncompressed PCM lossless).
   - AAC / M4A.
   - OGG / WebM Opus.
4. Audio trimming / range selection to extract full duration or a specific time snippet.
5. In-browser audio player preview before downloading.
6. Zero server uploads: 100% private processing.
