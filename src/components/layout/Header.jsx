import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export default function Header() {
  const openCreateModal = useAppStore((s) => s.openCreateModal);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
      <div className="flex items-center gap-6">
        <span className="font-heading text-lg font-semibold tracking-tight">Portfolio Tracker</span>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Dashboard</Link>
          <Link to="/archive" className="hover:text-foreground">Archive</Link>
        </nav>
      </div>
      <Button onClick={() => openCreateModal("task")} className="gap-2">
        <Plus className="w-4 h-4" />
        Create
      </Button>
    </header>
  );
}