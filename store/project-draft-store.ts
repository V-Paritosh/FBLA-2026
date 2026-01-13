import { create } from "zustand"
import type { Project, Module } from "@/lib/types"

interface ProjectDraftStore {
  draft: Partial<Project> | null
  setDraft: (draft: Partial<Project>) => void
  updateDraft: (updates: Partial<Project>) => void
  clearDraft: () => void
  addModule: (module: Module) => void
  removeModule: (index: number) => void
}

export const useProjectDraftStore = create<ProjectDraftStore>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  updateDraft: (updates) =>
    set((state) => ({
      draft: state.draft ? { ...state.draft, ...updates } : updates,
    })),
  clearDraft: () => set({ draft: null }),
  addModule: (module) =>
    set((state) => ({
      draft: state.draft
        ? {
            ...state.draft,
            modules: [...(state.draft.modules || []), module],
          }
        : { modules: [module] },
    })),
  removeModule: (index) =>
    set((state) => ({
      draft: state.draft
        ? {
            ...state.draft,
            modules: state.draft.modules?.filter((_, i) => i !== index) || [],
          }
        : null,
    })),
}))
