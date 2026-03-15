"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguageStore, LANGUAGE_OPTIONS } from "@/stores/language-store";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { language, setLanguage } = useLanguageStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        setError(t("login.errorCredentials", language));
      }
    } catch {
      setError(t("login.errorNetwork", language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
      {/* Language selector — top right */}
      <div className="fixed top-4 right-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as typeof language)}
          className="text-xs bg-white border border-purple-200 text-gray-600 rounded-lg px-2 py-1.5
            focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
            VibeKid
          </h1>
          <p className="text-gray-500 text-sm">{t("login.subtitle", language)}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100 p-6 space-y-4 shadow-lg"
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("login.username", language)}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              placeholder={t("login.usernamePlaceholder", language)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("login.password", language)}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              placeholder={t("login.passwordPlaceholder", language)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold
              py-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all
              disabled:opacity-50 active:scale-95"
          >
            {loading ? t("login.loading", language) : t("login.submit", language)}
          </button>
        </form>
      </div>
    </div>
  );
}
