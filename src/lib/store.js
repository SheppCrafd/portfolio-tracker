import { create } from "zustand";

const LEFT_SIDEBAR_STORAGE_KEY = "vaea_left_sidebar_open";
const RIGHT_SIDEBAR_STORAGE_KEY = "vaea_right_sidebar_open";
const OPEN_TABS_STORAGE_KEY = "vaea_open_tabs";

// Header.jsx's TABS list is the source of truth for what a key means (label/
// route/icon) — this is just the default set of keys open on a first visit.
const DEFAULT_TAB_KEYS = ["dashboard", "chat", "settings"];

const loadSidebarOpenState = (key) => {
  try {
    return localStorage.getItem(key) !== "false";
  } catch {
    return true;
  }
};

const loadOpenTabKeys = () => {
  try {
    const raw = localStorage.getItem(OPEN_TABS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEFAULT_TAB_KEYS];
  } catch {
    return [...DEFAULT_TAB_KEYS];
  }
};

const saveOpenTabKeys = (keys) => {
  try {
    localStorage.setItem(OPEN_TABS_STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // best-effort — the tab bar just won't remember this across a reload
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

  // Header's tab bar (Dashboard/Chat/Settings, and whatever gets added
  // later) — closable like real browser tabs, persisted across reloads.
  // Closing one only hides it from the bar; navigating to that route again
  // (a link elsewhere, the command palette's "Open Settings"/"Open full-page
  // chat", typing the URL) reopens it via ensureTabOpen, same as clicking a
  // link that targets an already-closed browser tab's page reopens it.
  // The last remaining open tab can't be closed — there must always be at
  // least one way back into the tab bar itself.
  openTabKeys: loadOpenTabKeys(),
  closeTab: (key) => set((s) => {
    if (s.openTabKeys.length <= 1) return s;
    const next = s.openTabKeys.filter((k) => k !== key);
    saveOpenTabKeys(next);
    return { openTabKeys: next };
  }),
  ensureTabOpen: (key) => set((s) => {
    if (s.openTabKeys.includes(key)) return s;
    const next = [...s.openTabKeys, key];
    saveOpenTabKeys(next);
    return { openTabKeys: next };
  }),
}));