import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import { useHighlight } from "@/lib/HighlightContext";
import { useUpdateArea } from "@/hooks/useAreas";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

export default function AreaCard({ area, productCount, onExpand, stakeholderIds = [] }) {
  const { highlightedIds } = useHighlight();
  const isDimmed = highlightedIds.length > 0 && !stakeholderIds.some((id) => highlightedIds.includes(id));
  const updateArea = useUpdateArea();
  const [title, setTitle] = useState(area.title);

  useEffect(() => setTitle(area.title), [area.title]);

  const debouncedSave = useDebouncedCallback(
    (value) => updateArea.mutate({ id: area.id, data: { title: value } }),
    500
  );

  const handleInput = (e) => {
    const value = e.currentTarget.textContent;
    setTitle(value);
    debouncedSave(value);
  };

  return (
    <article className={`relative bg-card border border-border rounded-xl p-5 break-inside-avoid ${isDimmed ? "opacity-30" : ""}`}>
      <button
        onClick={onExpand}
        style={{ position: "absolute", top: 16, right: 16 }}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Expand area"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
      <h3
        className="font-heading font-semibold text-lg pr-6 outline-none focus:ring-1 focus:ring-primary/40 rounded"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
      >
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{productCount} products</p>
    </article>
  );
}