import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

// Locks the app into a CSS grid-template-areas layout: header spans the top,
// main content sits left, sidebar sits right.
export default function AppShell({ children }) {
  return (
    <div
      className="h-screen grid overflow-hidden"
      style={{
        gridTemplateAreas: `"header header" "main sidebar"`,
        gridTemplateColumns: "1fr 320px",
        gridTemplateRows: "64px 1fr",
      }}
    >
      <div style={{ gridArea: "header" }}>
        <Header />
      </div>
      <main style={{ gridArea: "main" }} className="overflow-y-auto p-6 bg-background">
        {children}
      </main>
      <aside style={{ gridArea: "sidebar" }} className="overflow-y-auto border-l border-border bg-card p-4">
        <Sidebar />
      </aside>
    </div>
  );
}