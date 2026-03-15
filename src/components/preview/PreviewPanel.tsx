"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useProjectStore } from "@/stores/project-store";
import { buildIframeHTML, createBlobURL, revokeBlobURL } from "@/lib/runtime/iframe-engine";

export default function PreviewPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"empty" | "loading" | "running" | "error">("empty");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const project = useProjectStore((s) => s.project);
  const isFixing = useProjectStore((s) => s.isFixing);

  // Get code for current version
  const currentCode = project?.versions.length
    ? project.versions[project.currentVersion - 1]?.code
    : null;

  const loadCode = useCallback((code: string) => {
    // Revoke old blob
    if (blobUrlRef.current) revokeBlobURL(blobUrlRef.current);

    setStatus("loading");
    setErrorMsg("");

    const html = buildIframeHTML(code);
    const url = createBlobURL(html);
    blobUrlRef.current = url;

    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  }, []);

  // Listen for messages from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "VIBEKID_LOADED") {
        setStatus("running");
        // Successful load — reset fix state
        useProjectStore.getState().resetFixAttempt();
      } else if (e.data?.type === "VIBEKID_ERROR") {
        const errMsg = e.data.error?.message || "Unknown error";
        setStatus("error");
        setErrorMsg(errMsg);
        // Report error to store for auto-fix
        useProjectStore.getState().setPendingError(errMsg);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Auto-load when version changes
  useEffect(() => {
    if (currentCode) {
      loadCode(currentCode);
    } else {
      setStatus("empty");
    }
  }, [currentCode, loadCode]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) revokeBlobURL(blobUrlRef.current);
    };
  }, []);

  const handleRerun = () => {
    if (currentCode) loadCode(currentCode);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-2xl overflow-hidden border border-purple-200/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isFixing
                ? "bg-orange-400 animate-pulse"
                : status === "running"
                ? "bg-green-400"
                : status === "loading"
                ? "bg-yellow-400 animate-pulse"
                : status === "error"
                ? "bg-red-400"
                : "bg-gray-500"
            }`}
          />
          <span className="text-xs text-gray-400">
            {isFixing
              ? "小V 正在修修补补..."
              : status === "running"
              ? "运行中"
              : status === "loading"
              ? "加载中..."
              : status === "error"
              ? "出错啦"
              : "等待开始"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Version selector */}
          {project && project.versions.length > 1 && (
            <select
              value={project.currentVersion}
              onChange={(e) =>
                useProjectStore.getState().setCurrentVersion(Number(e.target.value))
              }
              className="text-xs bg-gray-700 text-gray-300 rounded px-2 py-1 border border-gray-600"
            >
              {project.versions.map((v) => (
                <option key={v.id} value={v.number}>
                  版本 {v.number}
                </option>
              ))}
            </select>
          )}

          {/* Rerun button */}
          <button
            onClick={handleRerun}
            disabled={!currentCode}
            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-lg
              disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            运行
          </button>
        </div>
      </div>

      {/* iframe area */}
      <div className="flex-1 relative">
        {status === "empty" ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-500 text-sm">你的作品会在这里出现</p>
              <p className="text-gray-600 text-xs mt-1">告诉小V你想做什么吧！</p>
            </div>
          </div>
        ) : null}

        {isFixing && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="text-5xl mb-3 animate-bounce">🔧</div>
              <p className="text-white text-sm font-medium">小V 正在努力修修补补...</p>
              <p className="text-gray-400 text-xs mt-1">马上就好！</p>
            </div>
          </div>
        )}

        {status === "error" && !isFixing && (
          <div className="absolute top-2 left-2 right-2 bg-red-500/90 text-white text-xs px-3 py-2 rounded-lg z-10">
            ⚠️ {errorMsg}
            <button onClick={handleRerun} className="ml-2 underline">
              重试
            </button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          sandbox="allow-scripts"
          className="w-full h-full border-0"
          style={{ display: status === "empty" ? "none" : "block", background: "#1a1a2e" }}
          title="作品预览"
        />
      </div>
    </div>
  );
}
