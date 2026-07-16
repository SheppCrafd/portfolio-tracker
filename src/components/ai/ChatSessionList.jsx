import Portal from "@/lib/Portal";
import { useChatSessions } from "@/hooks/useChatSessions";
import ChatSessionRow from "@/components/ai/ChatSessionRow";

// The "<" caret under the chat icon pops this card out to the left of the
// chat box, floating above the rest of the page, listing previous sessions.
export default function ChatSessionList({ activeSessionId, onSelect, onNewChat, onClose, onDeleted }) {
  const { data: sessions = [] } = useChatSessions();

  return (
    <Portal>
      <div className="fixed inset-0 z-[9998]" onClick={onClose}>
        <div
          className="fixed bottom-24 right-[26rem] w-64 max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-right-2 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-1 py-1.5 border-b border-border mb-1">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Chat History</p>
            <button onClick={onNewChat} className="text-[11px] text-primary hover:underline">
              New chat
            </button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2">No previous sessions yet.</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {sessions.map((s) => (
                <ChatSessionRow
                  key={s.id}
                  session={s}
                  isActive={s.id === activeSessionId}
                  onSelect={onSelect}
                  onDeleted={onDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
