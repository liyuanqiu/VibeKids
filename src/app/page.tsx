"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const INSPIRATION_CARDS = [
  { emoji: "🐍", title: "贪吃蛇", desc: "经典小游戏" },
  { emoji: "🎨", title: "画画板", desc: "自由涂鸦创作" },
  { emoji: "🎵", title: "音乐盒", desc: "创作你的旋律" },
  { emoji: "🚀", title: "太空冒险", desc: "飞船射击游戏" },
  { emoji: "🧮", title: "数学大挑战", desc: "趣味算术游戏" },
  { emoji: "🌈", title: "彩虹粒子", desc: "酷炫动画效果" },
];

interface SavedProjectSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [savedProjects, setSavedProjects] = useState<SavedProjectSummary[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setUsername(data.username);
          // Load saved projects
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
      {/* Header */}
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
            退出
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-4 leading-tight">
            把你的想法
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              变成现实
            </span>
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto">
            告诉 AI 你想做什么，一起创造属于你的游戏、动画和音乐！
          </p>

          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500
              text-white text-lg font-semibold px-8 py-4 rounded-2xl
              hover:shadow-xl hover:shadow-purple-200 transition-all hover:scale-105
              active:scale-95"
          >
            <span>✨</span>
            开始创作
          </Link>
        </div>

        {/* Saved projects */}
        {savedProjects.length > 0 && (
          <div className="mb-12">
            <h3 className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">
              我的作品
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
                    {p.title || "未命名项目"}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {new Date(p.updatedAt).toLocaleDateString("zh-CN")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Inspiration cards */}
        <div>
          <h3 className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">
            灵感卡片
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {INSPIRATION_CARDS.map((card) => (
              <Link
                key={card.title}
                href="/workspace"
                className="group bg-white/70 backdrop-blur-sm border border-purple-100 rounded-2xl p-6 text-center
                  hover:shadow-lg hover:shadow-purple-100 hover:border-purple-200 transition-all hover:scale-105"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {card.emoji}
                </div>
                <h4 className="font-semibold text-gray-700 text-sm mb-1">
                  {card.title}
                </h4>
                <p className="text-xs text-gray-400">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h3 className="text-center text-sm font-medium text-gray-400 mb-8 uppercase tracking-wider">
            怎么玩
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-semibold text-gray-700 mb-2">1. 说出想法</h4>
              <p className="text-sm text-gray-500">
                打字或者用语音告诉小V你想做什么
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-semibold text-gray-700 mb-2">2. 一起完成</h4>
              <p className="text-sm text-gray-500">
                小V 帮你一步一步做出来，你来决定细节
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <h4 className="font-semibold text-gray-700 mb-2">3. 玩起来！</h4>
              <p className="text-sm text-gray-500">
                每一步都可以看到结果，随时能玩你的作品
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400">
        VibeKid — 让每个孩子都成为创造者 ✨
      </footer>
    </div>
  );
}
