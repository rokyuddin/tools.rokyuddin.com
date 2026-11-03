import type {
  AudioFormat,
  ExtractedAudioResult,
  ExtractionOptions,
  ExtractionProgress,
  VideoMetadata,
} from "../types";
import { encodeAudioBufferToWav } from "./wav-encoder";
import { encodeMp3FromChannels } from "./mp3-encoder";
import { formatTimeDisplay, formatFileSize } from "./audio-helpers";

export { formatTimeDisplay, formatFileSize };

/**
 * Extracts metadata from a video file using HTML5 Video element.
 */
export function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        name: file.name,
        size: file.size,
        type: file.type || "video/mp4",
        duration: video.duration || 0,
        videoWidth: video.videoWidth || 0,
        videoHeight: video.videoHeight || 0,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback for metadata if video element fails to decode visual frames
      resolve({
        name: file.name,
        size: file.size,
        type: file.type || "video/mp4",
        duration: 0,
      });
    };

    video.src = objectUrl;
  });
}

/**
 * Decodes the audio track from a video file into an AudioBuffer using the Web Audio API.
 */
export async function decodeAudioFromVideo(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void,
): Promise<AudioBuffer> {
  onProgress?.({
    stage: "decoding",
    percentage: 15,
    message: "Reading video file into memory...",
  });

  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({
    stage: "decoding",
    percentage: 45,
    message: "Decoding audio track with Web Audio API...",
  });

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported in this browser.");
  }

  const audioCtx = new AudioContextClass();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    onProgress?.({
      stage: "decoding",
      percentage: 100,
      message: "Audio track successfully decoded!",
    });
    return audioBuffer;
  } catch (err) {
    throw new Error(
      "Could not extract audio track directly from this video. Please ensure the video contains an active audio track.",
    );
  } finally {
    // Clean up AudioContext
    if (audioCtx.state !== "closed") {
      audioCtx.close().catch(() => {});
    }
  }
}

/**
 * Encodes an AudioBuffer into the target audio format.
 */
export async function convertAudioBufferToFormat(
  audioBuffer: AudioBuffer,
  originalFilename: string,
  options: ExtractionOptions,
  onProgress?: (progress: ExtractionProgress) => void,
): Promise<ExtractedAudioResult> {
  const { format, bitrate, channels, trim } = options;
  const sampleRate = audioBuffer.sampleRate;

  // Determine start & end sample offsets for trimming
  const duration = audioBuffer.duration;
  let startSec = 0;
  let endSec = duration;

  if (trim.enabled) {
    startSec = Math.max(0, trim.startTime);
    endSec = Math.min(duration, trim.endTime > trim.startTime ? trim.endTime : duration);
  }

  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.floor(endSec * sampleRate);
  const effectiveDuration = Math.max(0, endSec - startSec);

  // Prepare base filename without original extension
  const baseName = originalFilename.replace(/\.[^/.]+$/, "");
  const cleanBaseName = baseName.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, "_");

  let outputBlob: Blob;
  let finalExtension = format;

  onProgress?.({
    stage: "encoding",
    percentage: 10,
    message: `Encoding audio to ${format.toUpperCase()}...`,
  });

  if (format === "wav") {
    outputBlob = encodeAudioBufferToWav(audioBuffer, {
      sampleRate,
      channels,
      startSample,
      endSample,
    });
    finalExtension = "wav";
    onProgress?.({
      stage: "complete",
      percentage: 100,
      message: "Lossless WAV ready for download!",
    });
  } else if (format === "mp3") {
    const numChannels = Math.min(2, audioBuffer.numberOfChannels) as 1 | 2;
    const channelsData: Float32Array[] = [];
    for (let c = 0; c < numChannels; c++) {
      channelsData.push(audioBuffer.getChannelData(c));
    }

    outputBlob = await encodeMp3FromChannels(channelsData, {
      sampleRate,
      channels,
      bitrate,
      startSample,
      endSample,
      onProgress: (pct) => {
        onProgress?.({
          stage: "encoding",
          percentage: pct,
          message: `Encoding MP3 (${bitrate} kbps)... ${pct}%`,
        });
      },
    });
    finalExtension = "mp3";
    onProgress?.({
      stage: "complete",
      percentage: 100,
      message: "MP3 audio ready for download!",
    });
  } else if (format === "ogg" || format === "webm") {
    // Modern WebM / OGG Opus via MediaRecorder where supported
    outputBlob = await recordBufferWithMediaRecorder(
      audioBuffer,
      startSec,
      endSec,
      format === "ogg" ? "audio/ogg; codecs=opus" : "audio/webm; codecs=opus",
    );
    finalExtension = format;
    onProgress?.({
      stage: "complete",
      percentage: 100,
      message: `${format.toUpperCase()} audio ready for download!`,
    });
  } else {
    // Fallback for AAC / M4A / FLAC: high quality WAV or MP3
    outputBlob = encodeAudioBufferToWav(audioBuffer, {
      sampleRate,
      channels,
      startSample,
      endSample,
    });
    finalExtension = "wav";
    onProgress?.({
      stage: "complete",
      percentage: 100,
      message: "Audio extracted in master lossless WAV format!",
    });
  }

  const filename = `${cleanBaseName}-audio.${finalExtension}`;
  const url = URL.createObjectURL(outputBlob);

  return {
    blob: outputBlob,
    url,
    format,
    filename,
    size: outputBlob.size,
    duration: effectiveDuration,
    bitrate: format === "mp3" ? bitrate : undefined,
  };
}

/**
 * Records a slice of an AudioBuffer in real-time or offline using MediaRecorder.
 */
function recordBufferWithMediaRecorder(
  audioBuffer: AudioBuffer,
  startSec: number,
  endSec: number,
  mimeType: string,
): Promise<Blob> {
  return new Promise((resolve) => {
    // If MediaRecorder or mimeType not supported, fallback to WAV
    if (
      typeof MediaRecorder === "undefined" ||
      (mimeType && !MediaRecorder.isTypeSupported(mimeType))
    ) {
      const wav = encodeAudioBufferToWav(audioBuffer, {
        startSample: Math.floor(startSec * audioBuffer.sampleRate),
        endSample: Math.floor(endSec * audioBuffer.sampleRate),
      });
      return resolve(wav);
    }

    const duration = endSec - startSec;
    // For browser media recorder offline capture, we can create an AudioContext with destination
    const ctx = new AudioContext();
    const dest = ctx.createMediaStreamDestination();
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(dest);

    const recorder = new MediaRecorder(dest.stream, {
      mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
    });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      ctx.close().catch(() => {});
      resolve(new Blob(chunks, { type: recorder.mimeType || mimeType }));
    };

    recorder.start();
    source.start(0, startSec, duration);

    setTimeout(() => {
      try {
        if (recorder.state === "recording") recorder.stop();
      } catch {
        resolve(new Blob(chunks, { type: mimeType }));
      }
    }, Math.min(duration * 1000 + 300, 30000));
  });
}
