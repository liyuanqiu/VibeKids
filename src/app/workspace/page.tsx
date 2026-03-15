"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { useLanguageStore, LANGUAGE_OPTIONS } from "@/stores/language-store";
import type { Project } from "@/types";
import ChatPanel from "@/components/chat/ChatPanel";
import PreviewPanel from "@/components/preview/PreviewPanel";
import DebugPanel from "@/components/debug/DebugPanel";

function WorkspaceInner() {
  const { project, createProject } = useProjectStore();
  const { language, setLanguage } = useLanguageStore();
  const searchParams = useSearchParams();
  const [showDebug, setShowDebug] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const projectId = searchParams.get("project");
    const debug = searchParams.get("debug") === "1";
    setShowDebug(debug);

    if (loaded) return;

    if (projectId) {
      // Load saved project
      fetch(`/api/projects/${projectId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: Project | null) => {
          if (data) {
            // Hydrate store with saved project
            useProjectStore.setState({ project: data });
          } else {
            createProject();
          }
          setLoaded(true);
        })
        .catch(() => {
          createProject();
          setLoaded(true);
        });
    } else {
      if (!project) createProject();
      setLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (!project) return null;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-purple-100 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <a href="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            VibeKid
          </a>
          {project.title && (
            <>
              <span className="text-gray-300">/</span>
              <span className="text-sm font-medium text-gray-600">{project.title}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Language selector */}
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

          {project.versions.length > 0 && (
            <span className="text-xs text-gray-400">
              版本 {project.currentVersion}/{project.versions.length}
            </span>
          )}
          <a
            href="/"
            className="text-xs text-purple-500 hover:text-purple-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-50"
          >
            首页
          </a>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left: Chat */}
        <div className="w-[380px] flex-shrink-0 min-h-0">
          <ChatPanel />
        </div>

        {/* Right: Preview */}
        <div className="flex-1 min-w-0">
          <PreviewPanel />
        </div>
      </div>

      {/* Debug panel — only shown when ?debug=1 */}
      {showDebug && <DebugPanel />}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense>
      <WorkspaceInner />
    </Suspense>
  );
}
