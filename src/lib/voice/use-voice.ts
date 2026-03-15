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
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;

        const formData = new FormData();
        formData.append("audio", blob);

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
      mediaRecorder.start();
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

/** Play TTS audio. Tries OpenAI TTS first, falls back to browser speechSynthesis. */
export async function speakText(text: string): Promise<void> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      // Track TTS usage from response header
      const usageHeader = res.headers.get("X-Usage");
      if (usageHeader) {
        try { trackUsage(JSON.parse(usageHeader)); } catch {}
      }

      const audioBlob = await res.blob();
      if (audioBlob.size > 0) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
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
