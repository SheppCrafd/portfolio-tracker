import { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

const DUMMY_RESPONSE = "Here's a quick **summary**:\n\n- Workspace Core is 62% complete\n- 2 risks flagged this week\n- 3 tasks due in the next 48 hours\n\nLet me know if you'd like more detail!";

// Floating AI chat simulation: click-outside-to-close, GPU-accelerated launch
// icon animation, and character-by-character mock streaming through react-markdown.
export default function ChatBox() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsChatOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const simulateStream = () => {
    setStreamingText("");
    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      setStreamingText(DUMMY_RESPONSE.slice(0, idx));
      if (idx >= DUMMY_RESPONSE.length) {
        clearInterval(interval);
        setMessages((prev) => [...prev, { role: "assistant", content: DUMMY_RESPONSE }]);
        setStreamingText(null);
      }
    }, 15);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    setTimeout(simulateStream, 300);
  };

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      {isChatOpen ? (
        <div className="w-80 h-96 bg-card border border-border rounded-xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <span className="font-heading font-semibold text-sm">AI Assistant</span>
            <button onClick={() => setIsChatOpen(false)}><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === "user" ? "text-right" : ""}>
                <div className={`inline-block rounded-lg px-3 py-1.5 max-w-[85%] text-left ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {streamingText && (
              <div className="inline-block rounded-lg px-3 py-1.5 max-w-[85%] bg-secondary text-secondary-foreground">
                <ReactMarkdown>{streamingText}</ReactMarkdown>
              </div>
            )}
          </div>
          <form onSubmit={handleSend} className="p-2 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 text-sm px-2 py-1.5 bg-background border border-border rounded outline-none"
            />
            <button type="submit" className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md">Send</button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg chat-launch-pulse"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}