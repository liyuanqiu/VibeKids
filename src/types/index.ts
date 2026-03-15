export interface Version {
  id: string;
  number: number;
  code: string;
  description: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: "kid" | "assistant";
  content: string;
  codeGenerated: boolean;
  versionId?: string;
  timestamp: string;
}

export interface Project {
  id: string;
  title: string;
  versions: Version[];
  currentVersion: number;
  conversation: Message[];
  /** Responses API: server-side stored response ID for multi-turn chaining */
  lastResponseId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The structured output from AI */
export interface AIResponse {
  message: string;
  code?: string;
  projectTitle?: string;
}

/** Usage info returned from API alongside AIResponse */
export interface UsageInfo {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
}
