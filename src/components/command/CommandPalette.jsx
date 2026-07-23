import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  Search, FolderKanban, Package, Boxes, ListTodo, User,
  Plus, MessageCircle, Settings, SunMoon,
} from "lucide-react";
import Portal from "@/lib/Portal";
import { useAppStore } from "@/lib/store";
import { useHighlight } from "@/lib/HighlightContext";
import { useCommandPaletteData } from "@/hooks/useCommandPaletteData";

const TYPE_ICON = {
  area: Boxes,
  product: Package,
  project: FolderKanban,
  task: ListTodo,
  stakeholder: User,
};

const MAX_RESULTS = 8;

// Global Ctrl/Cmd+K quick-jump-and-act palette: search across every Area,
// Product, Project, Task, and Stakeholder in the local dataset, or run a
// handful of quick actions, without hunting through three nested card
// levels or opening a form by hand. Mounted once at the App.jsx level (not
// inside AppShell) so the shortcut works from /chat and /settings too, not
// just the dashboard route.
export default function CommandPalette() {
  const isOpen = useAppStore((s) => s.isCommandPaletteOpen);
  const openPalette = useAppStore((s) => s.openCommandPalette);
  const closePalette = useAppStore((s) => s.closeCommandPalette);
  const openCreateModal = useAppStore((s) => s.openCreateModal);
  const { toggleHighlight } = useHighlight();
  // resolvedTheme, not theme — AppearanceSection's ThemeProvider defaults to
  // defaultTheme="system", so theme is literally the string "system" for
  // most visitors; comparing that against "dark" always took the "Switch to
  // dark theme" branch even when the page was already rendering dark via OS
  // preference. resolvedTheme is next-themes' post-system-resolution value.
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const items = useCommandPaletteData();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  // Ctrl/Cmd+K opens from anywhere in the app, including while some other
  // input has focus (e.g. mid-edit on a card field) — that's the whole
  // point of a global quick-jump shortcut. Escape closes only while open,
  // so it doesn't swallow every other component's own Escape handling.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        isOpen ? closePalette() : openPalette();
      } else if (e.key === "Escape" && isOpen) {
        closePalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, openPalette, closePalette]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      // Portal content mounts after this effect's own render pass —
      // deferring focus a tick keeps it from landing before the input exists.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const goHome = (params) => navigate(`/?${new URLSearchParams(params).toString()}`);

  const quickActions = useMemo(() => [
    { key: "create-task", label: "Create Task", Icon: Plus, run: () => { openCreateModal("task"); navigate("/"); } },
    { key: "create-project", label: "Create Project", Icon: Plus, run: () => { openCreateModal("project"); navigate("/"); } },
    { key: "create-product", label: "Create Product", Icon: Plus, run: () => { openCreateModal("product"); navigate("/"); } },
    { key: "create-area", label: "Create Area", Icon: Plus, run: () => { openCreateModal("area"); navigate("/"); } },
    { key: "open-chat", label: "Open full-page chat", Icon: MessageCircle, run: () => navigate("/chat") },
    { key: "open-settings", label: "Open Settings", Icon: Settings, run: () => navigate("/settings") },
    { key: "toggle-theme", label: resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme", Icon: SunMoon, run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark") },
  ], [openCreateModal, navigate, resolvedTheme, setTheme]);

  const jumpTo = (item) => {
    switch (item.type) {
      case "area":
        goHome({ areaId: item.id });
        break;
      case "product":
        goHome({ productId: item.id });
        break;
      case "project":
        goHome({ projectId: item.id });
        break;
      case "task":
        // No standalone task view exists — its parent project's expand
        // modal, embedding the task table, is the closest real "open" state.
        if (item.projectId) goHome({ projectId: item.projectId });
        break;
      case "stakeholder":
        // Best-effort default: light up the projects they're on, the same
        // category clicking their sidebar row's "Projects" checkbox does.
        toggleHighlight(item.id, "projects");
        navigate("/");
        break;
      default:
        break;
    }
  };

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter((item) => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [items, query]);

  const results = query.trim() ? searchResults : quickActions;

  const runResult = (index) => {
    const result = results[index];
    if (!result) return;
    if (result.run) result.run();
    else jumpTo(result);
    closePalette();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runResult(activeIndex);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/40 z-[200] flex items-start justify-center pt-[15vh] px-4" onClick={closePalette}>
        <div
          className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search areas, products, projects, tasks, stakeholders — or run a quick action"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
            />
            <kbd className="shrink-0 text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">Esc</kbd>
          </div>

          <div className="max-h-80 overflow-y-auto py-1.5">
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No matches for "{query}"</p>
            ) : (
              results.map((result, index) => {
                const Icon = result.Icon || TYPE_ICON[result.type] || Search;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={result.key || `${result.type}-${result.id}`}
                    onClick={() => runResult(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${isActive ? "bg-secondary" : "hover:bg-secondary/60"}`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">{result.title || result.label}</span>
                      {result.subtitle && <span className="block text-xs text-muted-foreground truncate">{result.subtitle}</span>}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
