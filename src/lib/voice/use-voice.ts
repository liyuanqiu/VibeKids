"use client";

import { useState, useRef, useCallback } from "react";
import { useDebugStore } from "@/stores/debug-store";

interface UseVoiceOptions {
  onTranscript: (text: string) => void;
}

function trackUsage(usage: { costUSD?: number; model?: string; type?: string }) {
  if (usage.costUSD) {
    useDebugStore.getState().addCost(usage.costUSD);
    useDebugStore.getState().addLog({
      type: (usage.type as "tts" | "stt") || "tts",
      message: `${usage.type} — $${usage.costUSD.toFixed(6)} (${usage.model})`,
    });
  }
}

export function useVoice({ onTranscript }: UseVoiceOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Safari/iPad doesn't support webm — pick the best available format
      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }
      // If none supported, let browser pick default (no mimeType option)

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        // Use the actual mimeType from the recorder
        const actualMime = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: actualMime });
        if (blob.size === 0) return;

        // Determine file extension for the API
        const ext = actualMime.includes("mp4") ? "recording.mp4" : "recording.webm";

        const formData = new FormData();
        formData.append("audio", blob, ext);

        try {
          const res = await fetch("/api/stt", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            if (data.usage) trackUsage(data.usage);
            if (data.text) onTranscript(data.text);
          }
        } catch (err) {
          console.error("STT error:", err);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      // Request data every 1s to avoid empty chunks on short recordings
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return { isRecording, startRecording, stopRecording, toggleRecording };
}

/**
 * Persistent audio element — reusing the same element avoids
 * Safari's autoplay restrictions (unlocked on first user interaction).
 */
let _audioEl: HTMLAudioElement | null = null;
function getAudioElement(): HTMLAudioElement {
  if (!_audioEl) {
    _audioEl = new Audio();
    // Unlock audio on first user touch/click (Safari requires this)
    const unlock = () => {
      _audioEl!.play().then(() => _audioEl!.pause()).catch(() => {});
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("touchstart", unlock, { once: true });
    document.addEventListener("click", unlock, { once: true });
  }
  return _audioEl;
}

/** Play TTS audio. Tries OpenAI TTS first, falls back to browser speechSynthesis. */
export async function speakText(text: string): Promise<void> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const usageHeader = res.headers.get("X-Usage");
      if (usageHeader) {
        try { trackUsage(JSON.parse(usageHeader)); } catch {}
      }

      const audioBlob = await res.blob();
      if (audioBlob.size > 0) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = getAudioElement();
        audio.src = audioUrl;
        return new Promise((resolve) => {
          audio.onended = () => { URL.revokeObjectURL(audioUrl); resolve(); };
          audio.onerror = () => { URL.revokeObjectURL(audioUrl); resolve(); };
          audio.play().catch(() => resolve());
        });
      }
    }
  } catch {
    // Fall through to browser TTS
  }

  // Fallback: browser built-in speechSynthesis
  if (typeof window !== "undefined" && window.speechSynthesis) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }
}
