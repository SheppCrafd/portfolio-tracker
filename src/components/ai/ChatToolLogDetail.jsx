import { X } from "lucide-react";
import Portal from "@/lib/Portal";

// Backs the "click a tool-log line to see its real JSON" feature —
// useChatController.js persists tool_log_detail (the plan's own decided
// actions, plus each step's resolved args + toolResult) alongside the
// tool-log transcript text; ChatMessageList opens one of these per line
// clicked, either the whole plan or a single executed step.
export default function ChatToolLogDetail({ detail, onClose }) {
  const { title, data } = detail;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]" onClick={onClose}>
        <div
          className="bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-terminal text-sm font-semibold text-foreground truncate pr-2">{title}</h3>
            <button onClick={onClose} aria-label="Close" className="shrink-0 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <pre className="overflow-auto text-[11px] font-terminal leading-relaxed bg-secondary/60 rounded-lg p-3 text-foreground whitespace-pre-wrap break-words">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </Portal>
  );
}
