"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDebugStore } from "@/stores/debug-store";

export default function DebugPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // offset from default (top-right)
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const { logs, totalInputTokens, totalOutputTokens, totalReasoningTokens, model, getCostUSD } = useDebugStore();
  const cost = getCostUSD();

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only drag from the header area
    if (!(e.target as HTMLElement).closest("[data-drag-handle]")) return;
    dragging.current = true;
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    setPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // Initialize position to top-right
  useEffect(() => {
    setPos({ x: 0, y: 0 });
  }, []);

  const style = {
    transform: `translate(${pos.x}px, ${pos.y}px)`,
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={style}
        className="fixed top-2 right-2 z-50 bg-gray-900/90 text-green-400 text-xs px-3 py-1.5 rounded-lg
          font-mono hover:bg-gray-800 border border-gray-700 shadow-lg"
      >
        🐛 ${cost.toFixed(4)}
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      style={style}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="fixed top-2 right-2 z-50 w-96 max-h-[80vh] bg-gray-900/95 text-gray-200 rounded-xl
        border border-gray-700 shadow-2xl font-mono text-xs flex flex-col overflow-hidden backdrop-blur-sm select-none"
    >
      {/* Header — drag handle */}
      <div
        data-drag-handle
        onPointerDown={onPointerDown}
        className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-800/50 cursor-grab active:cursor-grabbing"
      >
        <span className="text-green-400 font-semibold">🐛 Debug</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{model}</span>
          <button
            onClick={() => setCollapsed(true)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 border-b border-gray-700 bg-gray-800/30">
        <div>
          <div className="text-gray-500">Input</div>
          <div className="text-blue-400">{totalInputTokens.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500">Output</div>
          <div className="text-purple-400">{totalOutputTokens.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500">Reasoning</div>
          <div className="text-yellow-400">{totalReasoningTokens.toLocaleString()}</div>
        </div>
      </div>
      <div className="px-3 py-1.5 border-b border-gray-700 bg-gray-800/30 flex justify-between">
        <span className="text-gray-500">Total tokens</span>
        <span className="text-white">{(totalInputTokens + totalOutputTokens).toLocaleString()}</span>
      </div>
      <div className="px-3 py-1.5 border-b border-gray-700 bg-gray-800/30 flex justify-between">
        <span className="text-gray-500">Cost (USD)</span>
        <span className="text-green-400 font-semibold">${cost.toFixed(6)}</span>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto min-h-0 max-h-64">
        {logs.length === 0 && (
          <div className="text-gray-600 text-center py-4">No activity yet</div>
        )}
        {logs.map((log) => (
          <div
            key={log.id}
            className="px-3 py-1.5 border-b border-gray-800 hover:bg-gray-800/50"
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{log.timestamp}</span>
              <span
                className={
                  log.type === "chat"
                    ? "text-blue-400"
                    : log.type === "tts"
                    ? "text-purple-400"
                    : log.type === "stt"
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              >
                [{log.type.toUpperCase()}]
              </span>
              {log.inputTokens !== undefined && (
                <span className="text-gray-500">
                  in:{log.inputTokens} out:{log.outputTokens}
                  {log.reasoningTokens ? ` reason:${log.reasoningTokens}` : ""}
                </span>
              )}
            </div>
            <div className="text-gray-400 mt-0.5 truncate">{log.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
