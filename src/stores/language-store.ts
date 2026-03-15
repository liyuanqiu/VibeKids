import { create } from "zustand";

export type AppLanguage = "zh-CN" | "en" | "ja";

export const LANGUAGE_OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: "zh-CN", label: "中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
];

/** Language names used in prompts (English, for AI instructions) */
export const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  "zh-CN": "Chinese (Simplified)",
  en: "English",
  ja: "Japanese",
};

interface LanguageStore {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: "zh-CN",
  setLanguage: (language) => set({ language }),
}));
