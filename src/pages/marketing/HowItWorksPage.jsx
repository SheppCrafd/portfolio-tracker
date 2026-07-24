import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import MarketingLayout from "./MarketingLayout";

const STEPS = [
  {
    title: "Sign in",
    body: "Google, Microsoft, Apple, or email — whichever you'd rather use. It only unlocks the AI chat; organizing, editing, and bulk import all work without it.",
  },
  {
    title: "Pick where your data lives",
    body: "On Chrome or Edge desktop, grant a folder once via the File System Access API — your areas, products, projects, and tasks are written there as real files. Elsewhere, export and import by hand. Either way, nothing is stored remotely except your AI chat history.",
  },
  {
    title: "Build out your hierarchy",
    body: "Add an area by hand and work down from there, or bring a spreadsheet — one CSV where each row spells out the full parent path — and let it create areas, products, projects, and tasks in one pass. Or just ask the AI assistant to set it up for you.",
  },
];

export default function HowItWorksPage() {
  useEffect(() => {
    document.title = "How it works | Vaea";
  }, []);

  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-6 pt-16 sm:pt-20 pb-8">
        <p className="font-terminal text-xs uppercase tracking-widest text-muted-foreground mb-4">How it works</p>
        <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
          From nothing to organized in three steps.
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 sm:pb-20">
        {STEPS.map(({ title, body }, i) => (
          <div key={title} className={`flex gap-6 sm:gap-8 py-8 ${i > 0 ? "border-t border-border" : ""}`}>
            <span className="font-heading text-4xl sm:text-5xl font-semibold text-primary/15 select-none leading-none shrink-0 w-12 sm:w-16">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-muted-foreground max-w-lg">{body}</p>
            </div>
          </div>
        ))}

        <div className="pt-8 border-t border-border">
          <p className="text-muted-foreground max-w-lg">
            From there, it's just working — the command palette (Ctrl/Cmd+K) jumps to or acts on
            anything, and the AI chat can take multi-step requests instead of you clicking through
            each change by hand.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">
            Ready when you are.
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
