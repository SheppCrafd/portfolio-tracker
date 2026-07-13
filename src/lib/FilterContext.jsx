import { createContext, useContext, useState, useMemo } from "react";

// Global exclusion filter: any Area/Product/Project ID pushed here is hidden
// from the dashboard views.
const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [excludedIds, setExcludedIds] = useState([]);

  const toggleExclude = (id) => {
    setExcludedIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  };

  const value = useMemo(() => ({ excludedIds, toggleExclude }), [excludedIds]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within a FilterProvider");
  return ctx;
}