import { create } from "zustand";
import type { Project, Message, Version } from "@/types";
import { nanoid } from "nanoid";

interface ProjectStore {
  project: Project | null;
  isLoading: boolean;
  isSpeaking: boolean;
  isFixing: boolean;
  fixAttempt: number;
  /** Error from iframe, triggers auto-fix */
  pendingError: string | null;

  createProject: () => void;
  setLoading: (loading: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setFixing: (fixing: boolean) => void;
  setPendingError: (error: string | null) => void;
  incrementFixAttempt: () => number;
  resetFixAttempt: () => void;
  addMessage: (role: "kid" | "assistant", content: string, codeGenerated?: boolean, versionId?: string) => void;
  addVersion: (code: string, description: string) => string;
  setProjectTitle: (title: string) => void;
  setCurrentVersion: (versionNumber: number) => void;
  setLastResponseId: (id: string) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: null,
  isLoading: false,
  isSpeaking: false,
  isFixing: false,
  fixAttempt: 0,
  pendingError: null,

  createProject: () => {
    const now = new Date().toISOString();
    set({
      project: {
        id: nanoid(),
        title: "",
        versions: [],
        currentVersion: 0,
        conversation: [],
        lastResponseId: null,
        createdAt: now,
        updatedAt: now,
      },
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setSpeaking: (speaking) => set({ isSpeaking: speaking }),
  setFixing: (fixing) => set({ isFixing: fixing }),
  setPendingError: (error) => set({ pendingError: error }),
  incrementFixAttempt: () => {
    const next = get().fixAttempt + 1;
    set({ fixAttempt: next });
    return next;
  },
  resetFixAttempt: () => set({ fixAttempt: 0, pendingError: null }),

  addMessage: (role, content, codeGenerated = false, versionId) => {
    const { project } = get();
    if (!project) return;
    const msg: Message = {
      id: nanoid(),
      role,
      content,
      codeGenerated,
      versionId,
      timestamp: new Date().toISOString(),
    };
    set({
      project: {
        ...project,
        conversation: [...project.conversation, msg],
        updatedAt: new Date().toISOString(),
      },
    });
  },

  addVersion: (code, description) => {
    const { project } = get();
    if (!project) return "";
    const versionNumber = project.versions.length + 1;
    const version: Version = {
      id: nanoid(),
      number: versionNumber,
      code,
      description,
      createdAt: new Date().toISOString(),
    };
    set({
      project: {
        ...project,
        versions: [...project.versions, version],
        currentVersion: versionNumber,
        updatedAt: new Date().toISOString(),
      },
    });
    return version.id;
  },

  setProjectTitle: (title) => {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, title, updatedAt: new Date().toISOString() } });
  },

  setCurrentVersion: (versionNumber) => {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, currentVersion: versionNumber, updatedAt: new Date().toISOString() } });
  },

  setLastResponseId: (id) => {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, lastResponseId: id } });
  },

  reset: () => set({ project: null, isLoading: false, isSpeaking: false, isFixing: false, fixAttempt: 0, pendingError: null }),
}));
