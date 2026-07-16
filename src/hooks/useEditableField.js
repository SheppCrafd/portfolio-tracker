import { useState, useEffect } from "react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

// Wires up a contentEditable element to a debounced save: keeps local state
// in sync with the source value, and fires `onSave` after `delay`ms of
// silence. Pair with `<Tag contentEditable suppressContentEditableWarning
// onInput={handleInput}>{value}</Tag>`.
export function useEditableField(initialValue, onSave, delay = 500) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => setValue(initialValue), [initialValue]);

  const debouncedSave = useDebouncedCallback(onSave, delay);

  const handleInput = (e) => {
    const next = e.currentTarget.textContent;
    setValue(next);
    debouncedSave(next);
  };

  return { value, handleInput };
}
