import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import ChatBox from "@/components/ai/ChatBox";

// Locks the app into a CSS grid-template-areas layout: header spans the top,
// stakeholders sit left, main content center, focus/stats sit right.
export default function AppShell({ children }) {
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
    </div>
  );
}