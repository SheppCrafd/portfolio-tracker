import { create } from "zustand";

const LEFT_SIDEBAR_STORAGE_KEY = "vaea_left_sidebar_open";
const RIGHT_SIDEBAR_STORAGE_KEY = "vaea_right_sidebar_open";

const loadSidebarOpenState = (key) => {
  try {
    return localStorage.getItem(key) !== "false";
  } catch {
    return true;
  }
};

// Board data now lives in real Base44 entities, fetched/mutated via the
// React Query hooks in src/hooks. This store only holds transient UI state.
export const useAppStore = create((set) => ({
  isCreateModalOpen: false,
  createModalType: "task", // "task" | "project"
  openCreateModal: (type = "task") => set({ isCreateModalOpen: true, createModalType: type }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  isCommandPaletteOpen: false,
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () => set((s) => ({ isCommandPaletteOpen: !s.isCommandPaletteOpen })),

  // Dashboard-only (AppShell's stakeholders/focus panels) — moved here from
  // AppShell's own useState so Header can toggle them too, now that Header
  // renders once above every route (App.jsx) instead of inside AppShell.
  // Same localStorage-backed persistence AppShell always had.
  isLeftSidebarOpen: loadSidebarOpenState(LEFT_SIDEBAR_STORAGE_KEY),
  isRightSidebarOpen: loadSidebarOpenState(RIGHT_SIDEBAR_STORAGE_KEY),
  toggleLeftSidebar: () => set((s) => {
    const next = !s.isLeftSidebarOpen;
    try { localStorage.setItem(LEFT_SIDEBAR_STORAGE_KEY, String(next)); } catch { /* best-effort */ }
    return { isLeftSidebarOpen: next };
  }),
  toggleRightSidebar: () => set((s) => {
    const next = !s.isRightSidebarOpen;
    try { localStorage.setItem(RIGHT_SIDEBAR_STORAGE_KEY, String(next)); } catch { /* best-effort */ }
    return { isRightSidebarOpen: next };
  }),
}));