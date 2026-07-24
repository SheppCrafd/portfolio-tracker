import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Boxes, LayoutGrid, Command, FileSpreadsheet, Bot, Search,
  Paperclip, ClipboardCheck, FolderCog, LockKeyhole, HardDrive, ArrowRight,
} from "lucide-react";
import MarketingLayout from "./MarketingLayout";

const GROUPS = [
  {
    title: "Organize",
    lede: "One structure for everything you're working on, at whatever level it actually lives at.",
    items: [
      { icon: Boxes, title: "Areas, products, projects, tasks", body: "A hierarchy that scales from a single project up to a full personal or team operation." },
      { icon: LayoutGrid, title: "Mini and Full card views", body: "Switch density per screen — cards grow to fill leftover space in Full mode via a squeeze-fit layout." },
      { icon: FolderCog, title: "Nested detail modals", body: "Open an area or product and its products/projects expand in place, not a separate page each time." },
    ],
  },
  {
    title: "Move faster",
    lede: "Ways to get things done without hunting through menus.",
    items: [
      { icon: Command, title: "Command palette", body: "Ctrl/Cmd+K (or just \"/\") searches every area, product, project, task, and stakeholder, or runs a quick action." },
      { icon: FileSpreadsheet, title: "Hierarchical CSV import", body: "One spreadsheet where each row spells out the full parent path — bulk-creates the whole structure in one pass." },
    ],
  },
  {
    title: "An AI assistant that acts",
    lede: "Not a chatbot that describes what to do — a tool-calling agent that actually does it.",
    items: [
      { icon: Bot, title: "Multi-step execution", body: "Per-action, typed tools plan and execute real changes against your workspace, not a single blind reply." },
      { icon: Search, title: "Web search", body: "Looks things up when a task needs outside information." },
      { icon: Paperclip, title: "Attachment reading", body: "Reads files you drop into the chat as part of planning what to do." },
      { icon: ClipboardCheck, title: "Workspace search + tidy audit", body: "Searches your own data, and can run a hygiene pass (\"/tidy\") to flag things worth cleaning up." },
    ],
  },
  {
    title: "Your data, your device",
    lede: "Local-first by design, not as an afterthought.",
    items: [
      { icon: HardDrive, title: "No browser storage for real data", body: "A folder on this device (granted once via Chrome's file access), or manual export/import elsewhere." },
      { icon: LockKeyhole, title: "Sign-in unlocks only the AI chat", body: "Everything else — organizing, editing, bulk import, the command palette — works with or without signing in." },
    ],
  },
];

export default function FeaturesPage() {
  useEffect(() => {
    document.title = "Features | Vaea";
  }, []);

  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-6 pt-16 sm:pt-20 pb-8">
        <p className="font-terminal text-xs uppercase tracking-widest text-muted-foreground mb-4">Features</p>
        <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
          Everything your work needs, kept in one place.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-xl">
          No pricing tiers, no seat limits to worry about — this is a personal workspace,
          built to stay out of your way.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16 sm:pb-24">
        {GROUPS.map((group, i) => (
          <div key={group.title} className={`py-10 sm:py-12 ${i > 0 ? "border-t border-border" : ""}`}>
            <div className="sm:grid sm:grid-cols-[220px_1fr] sm:gap-10">
              <div className="mb-6 sm:mb-0">
                <h2 className="font-heading text-xl font-semibold tracking-tight">{group.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{group.lede}</p>
              </div>
              <div className="space-y-6">
                {group.items.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-4">
                    <div className="shrink-0 w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center">
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">
            See it come together
          </h2>
          <p className="mt-3 text-muted-foreground">Three steps from nothing to organized.</p>
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-1.5 text-sm px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md transition-colors"
            >
              How it works
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Or sign in directly
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
