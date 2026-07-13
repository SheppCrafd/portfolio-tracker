import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export default function Header() {
  const openCreateModal = useAppStore((s) => s.openCreateModal);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
      <span className="font-heading text-lg font-semibold tracking-tight">Portfolio Tracker</span>
      <Button onClick={() => openCreateModal("task")} className="gap-2">
        <Plus className="w-4 h-4" />
        Create
      </Button>
    </header>
  );
}