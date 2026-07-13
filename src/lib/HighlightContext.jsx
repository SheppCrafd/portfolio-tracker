import React, { createContext, useContext, useState, useMemo } from "react";

// Global highlight context: tracks which stakeholder IDs are "highlighted".
// Any card NOT in this array (when it's non-empty) should dim to opacity-30.
const HighlightContext = createContext(null);

export function HighlightProvider({ children }) {
  const [highlightedIds, setHighlightedIds] = useState([]);

  const toggleHighlight = (id) => {
    setHighlightedIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
    );
  };

  const value = useMemo(() => ({ highlightedIds, toggleHighlight }), [highlightedIds]);

  return <HighlightContext.Provider value={value}>{children}</HighlightContext.Provider>;
}

export function useHighlight() {
  const ctx = useContext(HighlightContext);
  if (!ctx) throw new Error("useHighlight must be used within a HighlightProvider");
  return ctx;
}