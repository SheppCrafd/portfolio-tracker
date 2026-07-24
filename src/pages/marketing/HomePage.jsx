import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bot, Fingerprint, Command, LockKeyhole, ArrowRight } from "lucide-react";
import MarketingLayout from "./MarketingLayout";

const HIGHLIGHTS = [
  {
    icon: Bot,
    title: "An AI that acts, not just answers",
    body: "A real tool-calling agent that plans multi-step changes, then executes them against your workspace — searches the web, reads attachments, reorganizes your hierarchy.",
  },
  {
    icon: Fingerprint,
    title: "Give it a name and a personality",
    body: "Vaea Chat's identity — its name, its role, its tone — is yours to write, by hand in Settings or by letting it interview you with /setup.",
  },
  {
    icon: Command,
    title: "A command palette for everything",
    body: "Ctrl/Cmd+K searches and acts on anything in the app — no hunting through menus.",
  },
  {
    icon: LockKeyhole,
    title: "Local-first data",
    body: "Your project data lives on your own device, not in a database in the cloud. Signing in only unlocks Vaea Chat.",
  },
];

// The hero's signature visual: a real transcript shape, not a chat-bubble
// mockup — this is what the agent actually does (plan, then a run of typed
// tool calls, then a plain-language result), rendered in the same terminal
// font/register the app already reserves for real command output (see
// --font-terminal in index.css). Static, not an animation loop — it reads
// once, correctly, rather than looping like a marketing gif.
function AgentTranscript() {
  return (
    <div className="w-full max-w-md mx-auto rounded-xl border border-border bg-card shadow-lg overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
        <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
        <span className="ml-2 font-terminal text-[11px] text-muted-foreground">Vaea Chat</span>
      </div>
      <div className="p-4 font-terminal text-[13px] leading-relaxed">
        <p className="text-foreground">
          <span className="text-primary">{'>'}</span> tidy up Marketing, archive anything stale
        </p>
        <div className="mt-3 space-y-1 text-muted-foreground">
          <p>plan · reviewing 14 projects across 3 products</p>
          <p>tool call · archive_project("Q1 Newsletter")</p>
          <p>tool call · move_project("Landing Page Copy" → Growth)</p>
          <p>tool call · archive_project("Old Brand Deck")</p>
        </div>
        <p className="mt-3 text-foreground">
          Archived 2, moved 1. Marketing's down to 11 active projects —
          want the same pass on Ops?
          <span className="inline-block w-[7px] h-[13px] bg-primary/70 align-middle ml-0.5" />
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  useEffect(() => {
    document.title = "Vaea Chat — an AI that acts on your work";
  }, []);

  return (
    <MarketingLayout>
      <div className="max-w-6xl mx-auto px-6 pt-16 sm:pt-24">
        <div className="grid md:grid-cols-[1.15fr_1fr] gap-12 md:gap-16 items-center pb-16 sm:pb-24">
          <div>
            <p className="font-terminal text-xs uppercase tracking-widest text-primary mb-4">
              Vaea Chat
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
              An AI that acts on your work, not just around it.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-md">
              Give Vaea Chat a name and a personality, then ask it to reorganize, create,
              or clean up. It plans the steps and executes them against your real areas,
              products, projects, and tasks — a tool-calling agent, not a search box.
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

          <AgentTranscript />
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
