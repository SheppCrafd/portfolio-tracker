import { useHighlight } from "@/lib/HighlightContext";

// True when a stakeholder spotlight is active and none of `stakeholderIds`
// are in it — the standard "dim this card/row out" check used across cards
// and tables. Exported as a plain function too, for callers that need to
// check dimming per-row inside a list (where calling a hook per item would
// break the rules of hooks) — call useHighlight() once at the top of the
// component and reuse isDimmedByHighlight(highlightedIds, ...) per row.
export function isDimmedByHighlight(highlightedIds, stakeholderIds = []) {
  return highlightedIds.length > 0 && !stakeholderIds.some((id) => highlightedIds.includes(id));
}

export function useHighlightDim(stakeholderIds = []) {
  const { highlightedIds } = useHighlight();
  return isDimmedByHighlight(highlightedIds, stakeholderIds);
}
