import { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";

// Renders the message list plus an understated scroll-nav rail to its right
// (spec: "scroll when the response is long, or scroll to previous parts of
// the message history"), and lazy-loads older messages as the user scrolls
// near the top.
export default function ChatMessageList({ messages, isComputing, hasMore, onLoadMore, resolvingId, onConfirm, onCancel }) {
  const containerRef = useRef(null);
  const [scrollPct, setScrollPct] = useState(0);

  const updateScrollPct = () => {
    const el = containerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setScrollPct(max > 0 ? el.scrollTop / max : 0);
    if (el.scrollTop < 40 && hasMore) onLoadMore();
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Stay pinned to the bottom on new messages, unless the user has
    // scrolled up to read history.
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const scrollBy = (delta) => {
    containerRef.current?.scrollBy({ top: delta, behavior: "smooth" });
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div
        ref={containerRef}
        onScroll={updateScrollPct}
        className="flex-1 h-[350px] overflow-y-auto p-4 flex flex-col gap-3 text-sm bg-background/50"
      >
        {hasMore && (
          <button onClick={onLoadMore} className="text-[10px] text-muted-foreground hover:text-foreground self-center">
            Load earlier messages
          </button>
        )}

        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
            <div className={`inline-block rounded-lg px-3 py-1.5 max-w-[85%] text-left ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground shadow-sm"}`}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
            {m.pending_action && (
              <div className="mt-1.5 flex gap-2 justify-start">
                <button
                  onClick={() => onConfirm(m)}
                  disabled={resolvingId === m.id}
                  className="text-xs px-2.5 py-1 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  Yes, do it
                </button>
                <button
                  onClick={() => onCancel(m)}
                  disabled={resolvingId === m.id}
                  className="text-xs px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md hover:opacity-80 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}

        {isComputing && (
          <div className="flex justify-start">
            <div className="inline-block rounded-lg px-3 py-1.5 bg-secondary text-secondary-foreground shadow-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Operating Dashboard...</span>
            </div>
          </div>
        )}
      </div>

      <div className="w-4 flex flex-col items-center justify-between py-1 border-l border-border/60">
        <button onClick={() => scrollBy(-120)} aria-label="Scroll up" className="text-muted-foreground/50 hover:text-foreground">
          <ChevronUp className="w-3 h-3" />
        </button>
        <div className="flex-1 w-px bg-border relative my-1">
          <div
            className="absolute w-1.5 h-4 -left-[3px] bg-muted-foreground/40 rounded-full transition-all"
            style={{ top: `${scrollPct * 100}%` }}
          />
        </div>
        <button onClick={() => scrollBy(120)} aria-label="Scroll down" className="text-muted-foreground/50 hover:text-foreground">
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
