import { useState } from "react";
import { Archive } from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import ChatBox from "@/components/ai/ChatBox";
import ArchivePanel from "@/components/archive/ArchivePanel";

// Locks the app into a CSS grid-template-areas layout: header spans the top,
// stakeholders sit left, main content center, focus/stats sit right.
export default function AppShell({ children }) {
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  return (
    <div
      className="h-screen grid overflow-hidden"
      style={{
        gridTemplateAreas: `"header header header" "leftsidebar main sidebar"`,
        gridTemplateColumns: "280px 1fr 320px",
        gridTemplateRows: "64px 1fr",
      }}
    >
      <div style={{ gridArea: "header" }}>
        <Header />
      </div>
      <aside style={{ gridArea: "leftsidebar" }} className="overflow-y-auto border-r border-border bg-card p-4">
        <LeftSidebar />
      </aside>
      <main style={{ gridArea: "main" }} className="overflow-y-auto p-6 bg-background">
        {children}
      </main>
      <aside style={{ gridArea: "sidebar" }} className="overflow-y-auto border-l border-border bg-card p-4">
        <Sidebar />
      </aside>
      <ChatBox />

      <button
        onClick={() => setIsArchiveOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-card border border-border shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-sm font-medium text-foreground"
      >
        <Archive className="w-4 h-4" />
        View Archive
      </button>
      {isArchiveOpen && <ArchivePanel onClose={() => setIsArchiveOpen(false)} />}
    </div>
  );
}