import OpenAI, { toFile } from "openai";
import { buildInstructions } from "@/lib/ai/prompts";
import type { AIResponse } from "@/types";

/**
 * Centralized OpenAI client — ALL OpenAI API calls MUST go through here.
 * No other file should instantiate OpenAI or call its APIs directly.
 *
 * This ensures:
 * - Single config point for credentials
 * - Every call's usage is tracked and returned
 * - Consistent error handling
 */

// --- Singleton client ---

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  if (!apiKey || !endpoint) throw new Error("Azure OpenAI not configured");
  _client = new OpenAI({ apiKey, baseURL: endpoint });
  return _client;
}

// --- Usage types ---

export interface CallUsage {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
  model: string;
  type: "chat" | "tts" | "stt";
  /** Estimated cost in USD */
  costUSD: number;
}

// Pricing per 1M tokens (adjust as models change)
const CHAT_PRICING: Record<string, { input: number; output: number }> = {
  default: { input: 2.5, output: 10 },
};

// Audio pricing per 1M characters
const TTS_PRICE_PER_1M_CHARS = 15; // $15 per 1M chars for gpt-4o-mini-tts
const STT_PRICE_PER_MINUTE = 0.006; // $0.006 per minute for gpt-4o-mini-transcribe

function estimateChatCost(inputTokens: number, outputTokens: number, model: string): number {
  const p = CHAT_PRICING[model] ?? CHAT_PRICING.default;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

// --- Chat ---

export interface ChatParams {
  userMessage: string;
  previousResponseId: string | null;
}

export interface ChatResult {
  aiResponse: AIResponse;
  responseId: string;
  usage: CallUsage;
}

export async function chat(params: ChatParams): Promise<ChatResult> {
  const client = getClient();
  const model = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-5.4";
  const instructions = buildInstructions();

  const response = await client.responses.create({
    model,
    instructions,
    input: [
      { role: "developer", content: "Always respond in JSON format." },
      { role: "user", content: params.userMessage },
    ],
    ...(params.previousResponseId ? { previous_response_id: params.previousResponseId } : {}),
    reasoning: { effort: "medium" },
    text: { format: { type: "json_object" } },
    store: true,
  });

  const content = response.output_text;
  let aiResponse: AIResponse;
  try {
    aiResponse = content ? JSON.parse(content) : { message: "" };
  } catch {
    aiResponse = { message: content || "" };
  }

  const inputTokens = response.usage?.input_tokens ?? 0;
  const outputTokens = response.usage?.output_tokens ?? 0;
  const reasoningTokens = (response.usage?.output_tokens_details as unknown as Record<string, number>)?.reasoning_tokens ?? 0;
  const actualModel = response.model || model;

  return {
    aiResponse,
    responseId: response.id,
    usage: {
      inputTokens,
      outputTokens,
      reasoningTokens,
      totalTokens: inputTokens + outputTokens,
      model: actualModel,
      type: "chat",
      costUSD: estimateChatCost(inputTokens, outputTokens, actualModel),
    },
  };
}

// --- TTS ---

export interface TTSResult {
  audioBuffer: ArrayBuffer;
  usage: CallUsage;
}

export async function tts(text: string): Promise<TTSResult> {
  const client = getClient();
  const ttsModel = process.env.AZURE_OPENAI_TTS_DEPLOYMENT || "gpt-4o-mini-tts";
  const inputText = text.slice(0, 4096);

  const response = await client.audio.speech.create({
    model: ttsModel,
    voice: "nova",
    input: inputText,
    response_format: "mp3",
    speed: 0.95,
    instructions: "Speak in Chinese (Simplified) with a warm, friendly, energetic tone — like a cheerful big sister chatting with a young friend. Moderate pace, clear and joyful.",
  } as Parameters<typeof client.audio.speech.create>[0]);

  const audioBuffer = await response.arrayBuffer();
  const charCount = inputText.length;
  const costUSD = (charCount / 1_000_000) * TTS_PRICE_PER_1M_CHARS;

  return {
    audioBuffer,
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      totalTokens: 0,
      model: ttsModel,
      type: "tts",
      costUSD,
    },
  };
}

// --- STT ---

export interface STTResult {
  text: string;
  usage: CallUsage;
}

export async function stt(audioBlob: Blob): Promise<STTResult> {
  const client = getClient();
  const sttModel = process.env.AZURE_OPENAI_STT_DEPLOYMENT || "gpt-4o-mini-transcribe";

  const buffer = Buffer.from(await audioBlob.arrayBuffer());
  const file = await toFile(buffer, "recording.webm", { type: "audio/webm" });

  const transcription = await client.audio.transcriptions.create({
    model: sttModel,
    file,
    language: "zh",
  });

  const text = typeof transcription === "string" ? transcription : transcription.text;

  // Estimate cost: assume ~10 seconds of audio per call average
  const estimatedMinutes = 0.17; // ~10 seconds
  const costUSD = estimatedMinutes * STT_PRICE_PER_MINUTE;

  return {
    text: text?.trim() || "",
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      totalTokens: 0,
      model: sttModel,
      type: "stt",
      costUSD,
    },
  };
}
