import { create } from "zustand";

// Board data now lives in real Base44 entities, fetched/mutated via the
// React Query hooks in src/hooks. This store only holds transient UI state.
export const useAppStore = create((set) => ({
  isCreateModalOpen: false,
  createModalType: "task", // "task" | "project"
  openCreateModal: (type = "task") => set({ isCreateModalOpen: true, createModalType: type }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
}));