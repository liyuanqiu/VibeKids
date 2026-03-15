"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/stores/language-store";
import { t } from "@/lib/i18n";

const INSPIRATION_KEYS = [
  { emoji: "🐍", titleKey: "card.snake" as const, descKey: "card.snake.desc" as const },
  { emoji: "🎨", titleKey: "card.drawing" as const, descKey: "card.drawing.desc" as const },
  { emoji: "🎵", titleKey: "card.music" as const, descKey: "card.music.desc" as const },
  { emoji: "🚀", titleKey: "card.space" as const, descKey: "card.space.desc" as const },
  { emoji: "🧮", titleKey: "card.math" as const, descKey: "card.math.desc" as const },
  { emoji: "🌈", titleKey: "card.rainbow" as const, descKey: "card.rainbow.desc" as const },
];

interface SavedProjectSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const [username, setUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [savedProjects, setSavedProjects] = useState<SavedProjectSummary[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setUsername(data.username);
          fetch("/api/projects")
            .then((r) => (r.ok ? r.json() : []))
            .then(setSavedProjects)
            .catch(() => {});
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setChecking(false));
  }, [router]);

  if (checking || !username) return null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <header className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          VibeKid
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">👋 {username}</span>
          <button
            onClick={async () => {
              await fetch("/api/auth/me", { method: "DELETE" });
              router.push("/login");
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {t("home.logout", language)}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-4 leading-tight">
            {t("home.hero.title1", language)}
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              {t("home.hero.title2", language)}
            </span>
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto">
            {t("home.hero.subtitle", language)}
          </p>

          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500
              text-white text-lg font-semibold px-8 py-4 rounded-2xl
              hover:shadow-xl hover:shadow-purple-200 transition-all hover:scale-105
              active:scale-95"
          >
            <span>✨</span>
            {t("home.startCreating", language)}
          </Link>
        </div>

        {savedProjects.length > 0 && (
          <div className="mb-12">
            <h3 className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">
              {t("home.myProjects", language)}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {savedProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/workspace?project=${p.id}`}
                  className="group bg-white/70 backdrop-blur-sm border border-green-100 rounded-2xl p-5 text-center
                    hover:shadow-lg hover:shadow-green-100 hover:border-green-200 transition-all hover:scale-105"
                >
                  <div className="text-3xl mb-2">📁</div>
                  <h4 className="font-semibold text-gray-700 text-sm mb-1 truncate">
                    {p.title || "Untitled"}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">
            {t("home.inspiration", language)}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {INSPIRATION_KEYS.map((card) => (
              <Link
                key={card.titleKey}
                href="/workspace"
                className="group bg-white/70 backdrop-blur-sm border border-purple-100 rounded-2xl p-6 text-center
                  hover:shadow-lg hover:shadow-purple-100 hover:border-purple-200 transition-all hover:scale-105"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {card.emoji}
                </div>
                <h4 className="font-semibold text-gray-700 text-sm mb-1">
                  {t(card.titleKey, language)}
                </h4>
                <p className="text-xs text-gray-400">{t(card.descKey, language)}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-center text-sm font-medium text-gray-400 mb-8 uppercase tracking-wider">
            {t("home.howItWorks", language)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-semibold text-gray-700 mb-2">{t("home.step1.title", language)}</h4>
              <p className="text-sm text-gray-500">{t("home.step1.desc", language)}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-semibold text-gray-700 mb-2">{t("home.step2.title", language)}</h4>
              <p className="text-sm text-gray-500">{t("home.step2.desc", language)}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <h4 className="font-semibold text-gray-700 mb-2">{t("home.step3.title", language)}</h4>
              <p className="text-sm text-gray-500">{t("home.step3.desc", language)}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        {t("home.footer", language)}
      </footer>
    </div>
  );
}
