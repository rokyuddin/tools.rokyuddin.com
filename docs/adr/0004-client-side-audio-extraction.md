# Client-Side Audio Extraction and In-Browser Encoding

To preserve user privacy and avoid costly server-side video uploads, audio track extraction from video files is performed 100% locally on the client's device using the native Web Audio API (`AudioContext.decodeAudioData`).

The resulting multi-channel PCM floating-point samples are encoded into:
1. Lossless 16-bit PCM WAV using a zero-dependency pure TypeScript encoder.
2. MP3 using `@breezystack/lamejs` with asynchronous time-slicing batches to prevent blocking the UI thread during longer files.
3. Modern WebM / OGG Opus audio via `MediaRecorder`.

User files never leave their machine, guaranteeing zero data exposure and instant processing.
