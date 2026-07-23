import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus, Filter, Search, PanelLeft, PanelLeftClose, PanelRight, PanelRightClose, LayoutDashboard, MessageCircle, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import FilterModal from "@/components/modals/FilterModal";
import UserMenu from "@/components/layout/UserMenu";

const TABS = [
  { key: "dashboard", label: "Dashboard", to: "/", Icon: LayoutDashboard, isActive: (path) => path === "/" },
  { key: "chat", label: "Chat", to: "/chat", Icon: MessageCircle, isActive: (path) => path.startsWith("/chat") },
  { key: "settings", label: "Settings", to: "/settings", Icon: SettingsIcon, isActive: (path) => path.startsWith("/settings") },
];

// Rendered once, above every route (App.jsx) rather than inside AppShell —
// the dashboard's sidebar toggles / Create New / Filter only mean anything
// on the dashboard route itself, so those stay gated behind isDashboard;
// the logo, tab bar, search, and settings shortcut are universal.
export default function Header() {
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  const openCreateModal = useAppStore((s) => s.openCreateModal);
  const openCommandPalette = useAppStore((s) => s.openCommandPalette);
  const isLeftSidebarOpen = useAppStore((s) => s.isLeftSidebarOpen);
  const toggleLeftSidebar = useAppStore((s) => s.toggleLeftSidebar);
  const isRightSidebarOpen = useAppStore((s) => s.isRightSidebarOpen);
  const toggleRightSidebar = useAppStore((s) => s.toggleRightSidebar);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-border bg-card shadow-sm relative z-10">
      <div className="flex items-center gap-3">
        {isDashboard && (
          <button
            onClick={toggleLeftSidebar}
            aria-label={isLeftSidebarOpen ? "Collapse stakeholders panel" : "Expand stakeholders panel"}
            className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 -ml-1.5 rounded-md transition-colors">

            {isLeftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        )}
        <span className="text-lg tracking-tight font-bold [font-family:'JetBrains_Mono',_monospace]">Vaea</span>

        <nav className="hidden md:flex items-center gap-1 ml-2">
          {TABS.map(({ key, label, to, Icon, isActive }) => {
            const active = isActive(location.pathname);
            return (
              <Link
                key={key}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${active ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={openCommandPalette}
          aria-label="Search everything"
          className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-md border border-border bg-background hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          Search
          <kbd className="text-[10px] font-mono border border-border rounded px-1 py-0.5">/</kbd>
        </button>
        {isDashboard && (
          <>
            <Button onClick={() => openCreateModal("task")} className="gap-2">
              <Plus className="w-4 h-4" />
              Create New
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsFilterOpen(true)} aria-label="Filter">
              <Filter className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <button
              onClick={toggleRightSidebar}
              aria-label={isRightSidebarOpen ? "Collapse focus panel" : "Expand focus panel"}
              className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded-md transition-colors">

              {isRightSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
            </button>
          </>
        )}
        <UserMenu />
      </div>
      {isFilterOpen && <FilterModal onClose={() => setIsFilterOpen(false)} />}
    </header>
  );
}
