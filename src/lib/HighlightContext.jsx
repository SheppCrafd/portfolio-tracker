import React, { createContext, useContext, useState } from "react";

const HighlightContext = createContext();

export function HighlightProvider({ children }) {
  const [highlightedIds, setHighlightedIds] = useState([]);

  // Toggles a stakeholder ID in or out of the active highlight array
  const toggleHighlight = (id) => {
    setHighlightedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <HighlightContext.Provider value={{ highlightedIds, toggleHighlight }}>
      {children}
    </HighlightContext.Provider>
  );
}

export function useHighlight() {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error("useHighlight must be used within a HighlightProvider");
  }
  return context;
}
