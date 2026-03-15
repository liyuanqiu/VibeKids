"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useProjectStore } from "@/stores/project-store";
import { useDebugStore } from "@/stores/debug-store";
import { useVoice, speakText } from "@/lib/voice/use-voice";
import type { AIResponse } from "@/types";

interface APIUsage {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
  model: string;
  type: string;
  costUSD: number;
}

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    project,
    isLoading,
    isSpeaking,
    isFixing,
    pendingError,
    addMessage,
    addVersion,
    setProjectTitle,
    setLoading,
    setSpeaking,
    setFixing,
    setPendingError,
    incrementFixAttempt,
    resetFixAttempt,
    setLastResponseId,
  } = useProjectStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [project?.conversation.length, scrollToBottom]);

  const handleAIResponse = useCallback(
    (aiResponse: AIResponse & { responseId?: string }) => {
      if (aiResponse.responseId) {
        setLastResponseId(aiResponse.responseId);
      }

      if (aiResponse.projectTitle) {
        setProjectTitle(aiResponse.projectTitle);
      }

      let versionId: string | undefined;
      if (aiResponse.code) {
        versionId = addVersion(aiResponse.code, aiResponse.message);
      }

      addMessage("assistant", aiResponse.message, !!aiResponse.code, versionId);

      // Auto-save project
      const latestProject = useProjectStore.getState().project;
      if (latestProject && latestProject.title) {
        fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(latestProject),
        }).catch(() => {});
      }
    },
    [addMessage, addVersion, setProjectTitle, setLastResponseId]
  );

  /** Core AI call — used by both sendMessage and auto-fix */
  const callAI = useCallback(
    async (userMessage: string): Promise<(AIResponse & { responseId?: string }) | null> => {
      try {
        const currentProject = useProjectStore.getState().project!;
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage,
            previousResponseId: currentProject.lastResponseId,
          }),
        });

        if (!res.ok) throw new Error("Chat API error");

        const data = await res.json();
        const { responseId, usage, ...aiResponse } = data as AIResponse & {
          responseId?: string;
          usage?: APIUsage;
        };

        // Debug logging — all costs tracked centrally
        if (usage) {
          useDebugStore.getState().addUsage(
            usage.inputTokens, usage.outputTokens, usage.reasoningTokens, usage.model
          );
          useDebugStore.getState().addCost(usage.costUSD);
          useDebugStore.getState().addLog({
            type: "chat",
            message: userMessage.slice(0, 80),
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            reasoningTokens: usage.reasoningTokens,
            model: usage.model,
          });
        }

        return { ...aiResponse, responseId };
      } catch (err) {
        useDebugStore.getState().addLog({ type: "error", message: String(err) });
        return null;
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !project || isLoading) return;

      const userText = text.trim();
      setInput("");

      addMessage("kid", userText);
      setLoading(true);
      resetFixAttempt();

      try {
        const aiResponse = await callAI(userText);
        if (!aiResponse) throw new Error("AI call failed");

        handleAIResponse(aiResponse);

        if (aiResponse.message) {
          useDebugStore.getState().addLog({ type: "tts", message: `Speaking: ${aiResponse.message.slice(0, 50)}...` });
          setSpeaking(true);
          await speakText(aiResponse.message);
          setSpeaking(false);
        }
      } catch (err) {
        console.error("Send message error:", err);
        addMessage("assistant", "哎呀，小V 遇到了一点小问题，再试一次吧！");
      } finally {
        setLoading(false);
      }
    },
    [project, isLoading, addMessage, setLoading, setSpeaking, resetFixAttempt, callAI, handleAIResponse]
  );

  /** Auto-fix loop: when iframe reports an error, send it to AI to fix (max 3 attempts) */
  const MAX_FIX_ATTEMPTS = 3;
  const CUTE_FIX_MESSAGES = [
    "小V 发现了一个小虫子 🐛，正在修修补补...",
    "差一点就好了！小V 再努力一下 💪",
    "小V 在认真检查每一行魔法咒语 🔮...",
  ];

  useEffect(() => {
    if (!pendingError || isLoading || isFixing) return;

    const attempt = incrementFixAttempt();
    if (attempt > MAX_FIX_ATTEMPTS) {
      // Give up gracefully
      addMessage("assistant", "哎呀，小V 试了好几次还是没弄好，你可以换个说法再告诉我一次吗？ 😅");
      resetFixAttempt();
      return;
    }

    // Show cute fixing message (don't show the error to the kid)
    const cuteMsg = CUTE_FIX_MESSAGES[attempt - 1] || CUTE_FIX_MESSAGES[0];
    addMessage("assistant", cuteMsg);

    setFixing(true);
    setPendingError(null); // Clear so we don't re-trigger

    const fixMessage = `[AUTO_FIX] The previously generated code had a runtime error: "${pendingError}". Please fix the code and return the corrected full HTML. Do not mention the error to the user - just say you improved it.`;

    useDebugStore.getState().addLog({
      type: "error",
      message: `Auto-fix attempt ${attempt}: ${pendingError}`,
    });

    (async () => {
      try {
        const aiResponse = await callAI(fixMessage);
        if (aiResponse) {
          handleAIResponse(aiResponse);
          // Record the error for future prevention
          fetch("/api/errors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              error: pendingError,
              summary: `Avoid: ${pendingError.slice(0, 100)}`,
            }),
          }).catch(() => {});
        } else {
          addMessage("assistant", "小V 遇到了点困难，你再说一次试试？");
          resetFixAttempt();
        }
      } catch {
        resetFixAttempt();
      } finally {
        setFixing(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingError]);

  /** Brain button: ask AI to suggest an improvement idea */
  const handleSuggestIdea = useCallback(() => {
    if (!project || isLoading) return;
    sendMessage("[SUGGEST_IDEA] 帮我想想还能加什么有趣的东西？");
  }, [project, isLoading, sendMessage]);

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const { isRecording, toggleRecording } = useVoice({
    onTranscript: handleVoiceTranscript,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const conversation = project?.conversation ?? [];
  const hasCode = project && project.versions.length > 0;

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-2xl border border-purple-100 overflow-hidden relative">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conversation.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm">告诉小V你想做什么吧！</p>
            </div>
          </div>
        )}

        {conversation.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "kid" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "kid"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
                  : "bg-white text-gray-700 border border-purple-100 rounded-bl-md shadow-sm"
              }`}
            >
              {msg.role === "assistant" && (
                <span className="text-xs text-purple-400 font-medium block mb-1">小V</span>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-700 border border-purple-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <span className="text-xs text-purple-400 font-medium block mb-1">小V</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-xs text-gray-400 ml-2">正在思考...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-purple-100 p-3 flex items-end gap-2 bg-white/80"
      >
        {/* Voice button */}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isLoading}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-200"
              : "bg-purple-100 text-purple-600 hover:bg-purple-200"
          } disabled:opacity-50`}
          title={isRecording ? "停止录音" : "语音输入"}
        >
          {isRecording ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        {/* Brain/idea button — only show after first version exists */}
        {hasCode && (
          <button
            type="button"
            onClick={handleSuggestIdea}
            disabled={isLoading}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 text-yellow-600
              hover:bg-yellow-200 flex items-center justify-center transition-all
              disabled:opacity-50 hover:scale-110 active:scale-95"
            title="帮我想想新点子！"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </button>
        )}

        {/* Text input */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="告诉小V你想做什么..."
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none rounded-xl border border-purple-200 px-4 py-2.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent
            bg-white placeholder:text-gray-400 disabled:opacity-50
            max-h-24 overflow-y-auto"
          style={{ minHeight: "2.5rem" }}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
            text-white flex items-center justify-center transition-all
            hover:shadow-lg hover:shadow-purple-200 disabled:opacity-50 disabled:hover:shadow-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.016 3.234a.75.75 0 01.75.75v16.032a.75.75 0 01-1.5 0V3.984a.75.75 0 01.75-.75zM18 7.5a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 0118 7.5zM10.016 6a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V6.75a.75.75 0 01.75-.75zM6 9a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 016 9z" />
          </svg>
          小V 说话中
        </div>
      )}
    </div>
  );
}
