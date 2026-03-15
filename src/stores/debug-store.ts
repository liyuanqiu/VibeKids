import { create } from "zustand";

export interface DebugLogEntry {
  id: number;
  timestamp: string;
  type: "chat" | "tts" | "stt" | "error";
  message: string;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  model?: string;
}

// GPT-5.4 pricing (per 1M tokens) — adjust as needed
const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-5.4": { input: 2.5, output: 10 },
  "gpt-5": { input: 2, output: 8 },
  default: { input: 2.5, output: 10 },
};

interface DebugStore {
  logs: DebugLogEntry[];
  totalInputTokens: number;
  totalOutputTokens: number;
  totalReasoningTokens: number;
  /** Direct cost accumulator — includes audio costs that have no tokens */
  totalDirectCostUSD: number;
  model: string;

  addLog: (entry: Omit<DebugLogEntry, "id" | "timestamp">) => void;
  addUsage: (input: number, output: number, reasoning: number, model?: string) => void;
  addCost: (costUSD: number) => void;
  getCostUSD: () => number;
  reset: () => void;
}

let logId = 0;

export const useDebugStore = create<DebugStore>((set, get) => ({
  logs: [],
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalReasoningTokens: 0,
  totalDirectCostUSD: 0,
  model: "gpt-5.4",

  addLog: (entry) => {
    const log: DebugLogEntry = {
      ...entry,
      id: ++logId,
      timestamp: new Date().toLocaleTimeString(),
    };
    set((s) => ({ logs: [...s.logs.slice(-100), log] })); // keep last 100
  },

  addUsage: (input, output, reasoning, model) => {
    set((s) => ({
      totalInputTokens: s.totalInputTokens + input,
      totalOutputTokens: s.totalOutputTokens + output,
      totalReasoningTokens: s.totalReasoningTokens + reasoning,
      ...(model ? { model } : {}),
    }));
  },

  addCost: (costUSD) => {
    set((s) => ({ totalDirectCostUSD: s.totalDirectCostUSD + costUSD }));
  },

  getCostUSD: () => {
    const { totalInputTokens, totalOutputTokens, totalDirectCostUSD, model } = get();
    const pricing = PRICING[model] ?? PRICING.default;
    const tokenCost = (totalInputTokens / 1_000_000) * pricing.input + (totalOutputTokens / 1_000_000) * pricing.output;
    return tokenCost + totalDirectCostUSD;
  },

  reset: () => set({ logs: [], totalInputTokens: 0, totalOutputTokens: 0, totalReasoningTokens: 0, totalDirectCostUSD: 0 }),
}));
