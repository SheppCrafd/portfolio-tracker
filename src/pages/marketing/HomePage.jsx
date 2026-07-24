import { useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { Bot, FileSpreadsheet, Command, LockKeyhole, ArrowRight, ChevronRight } from "lucide-react";
import MarketingLayout from "./MarketingLayout";

const TIER_NAMES = ["Area", "Product", "Project", "Task"];

const HIGHLIGHTS = [
  {
    icon: Bot,
    title: "An AI assistant that can act",
    body: "A real tool-calling agent that searches the web, reads attachments, searches your workspace, and executes multi-step changes when you ask it to.",
  },
  {
    icon: FileSpreadsheet,
    title: "Bulk import from a spreadsheet",
    body: "Bring in an entire area → product → project → task hierarchy from one CSV instead of building it by hand.",
  },
  {
    icon: Command,
    title: "A command palette for everything",
    body: "Ctrl/Cmd+K searches and acts on anything in the app — no hunting through menus.",
  },
  {
    icon: LockKeyhole,
    title: "Local-first data",
    body: "Your project data lives on your own device, not in a database in the cloud. Signing in only unlocks the AI chat.",
  },
];

// Nested fieldset-style frames, outer to inner: Area contains Product
// contains Project contains Task, exactly matching the app's real data
// model — not a decorative diagram.
function HierarchyDiagram() {
  const tiers = [
    { label: "Area", pad: "p-6", radius: "rounded-2xl" },
    { label: "Product", pad: "p-5", radius: "rounded-xl" },
    { label: "Project", pad: "p-4", radius: "rounded-lg" },
    { label: "Task", pad: "p-4 min-h-11", radius: "rounded-md", isInnermost: true },
  ];

  let node = null;

  for (let i = tiers.length - 1; i >= 0; i--) {
    const t = tiers[i];
    node = (
      <div
        className={`relative border ${t.radius} ${t.pad} ${
          t.isInnermost ? "border-primary/40 bg-primary/10" : "border-foreground/20"
        }`}
      >
        <span
          className={`absolute -top-2.5 left-3 px-1.5 bg-background font-terminal text-[10px] uppercase tracking-widest ${
            t.isInnermost ? "text-primary" : "text-foreground/70"
          }`}
        >
          {t.label}
        </span>
        {node}
      </div>
    );
  }

  return <div className="w-full max-w-xs mx-auto">{node}</div>;
}

export default function HomePage() {
  useEffect(() => {
    document.title = "Vaea — one hierarchy for everything you're working on";
  }, []);

  return (
    <MarketingLayout>
      <div className="max-w-6xl mx-auto px-6 pt-16 sm:pt-24">
        <div className="grid md:grid-cols-[1.15fr_1fr] gap-12 md:gap-16 items-center pb-16 sm:pb-24">
          <div>
            <p className="flex items-center gap-1 font-terminal text-xs uppercase tracking-widest text-muted-foreground mb-4">
              {TIER_NAMES.map((name, i) => (
                <Fragment key={name}>
                  {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
                  {name}
                </Fragment>
              ))}
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
              One hierarchy for everything you're working on.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-md">
              Vaea keeps your areas, products, projects, and tasks in a single structure —
              and an AI assistant that can act on it, not just talk about it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md transition-colors"
              >
                Get started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/how-it-works"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Data stays on your device either way.</p>
          </div>

          <HierarchyDiagram />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Built for real work</h2>
            <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              See all features →
            </Link>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 gap-8">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
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

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">
            Ready to see it laid out?
          </h2>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md transition-colors"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
