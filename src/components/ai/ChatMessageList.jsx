import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";

// Renders the message list. Scrolling is plain native browser scrolling —
// lazy-loads older messages as the user scrolls near the top.
export default function ChatMessageList({ messages, isComputing, hasMore, onLoadMore, resolvingId, onConfirm, onCancel }) {
  const containerRef = useRef(null);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
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

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 text-sm bg-background/50"
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
  );
}
