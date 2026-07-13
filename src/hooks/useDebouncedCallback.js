import { useRef, useCallback } from "react";

// Returns a debounced version of `callback` — used for the contenteditable
// inline-edit PATCH pattern (waits `delay`ms of silence before firing).
export function useDebouncedCallback(callback, delay = 500) {
  const timeoutRef = useRef(null);
  return useCallback(
    (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
}