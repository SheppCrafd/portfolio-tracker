import { STAGED_TOOL_NAMES, MAX_BULK_ITEMS_PER_CALL } from "@/lib/llm/toolCatalog";
import { runLocalTool } from "@/lib/llm/localTools";

export const MAX_ACTIONS_PER_REQUEST = 60;

// One tool runner per request, closed over that request's own accumulating
// `plan` array — shared by both adapters (anthropicAdapter.js,
// openaiCompatibleAdapter.js) since a tool call's *meaning* (stage vs. run
// for real) doesn't depend on which provider is asking. Mirrors
// aiChatStream/entry.ts's buildTools()' queue() for the staged half.
export function makeToolRunner({ plan, dataset }) {
  return function runTool(name, args) {
    if (STAGED_TOOL_NAMES.has(name)) {
      if (plan.length >= MAX_ACTIONS_PER_REQUEST) {
        return { queued: false, error: `Plan already has ${MAX_ACTIONS_PER_REQUEST} actions queued (the max allowed in one request) — stop adding more and wrap up your reply.` };
      }
      // Checked HERE, at staging time, not just later when the client
      // actually executes the plan (chatActions.js has its own hard copy of
      // this same limit as defense-in-depth) — catching it in this same
      // tool-call round-trip means the model sees the rejection immediately
      // and can retry with a smaller batch itself, before ever telling the
      // user anything, instead of the oversized call sailing through this
      // whole response and only blowing up on the user's own device
      // afterward (or after they've already clicked "Yes, do it").
      if (name === "BULK_CREATE" && Array.isArray(args?.items) && args.items.length > MAX_BULK_ITEMS_PER_CALL) {
        return { queued: false, error: `BULK_CREATE can only create up to ${MAX_BULK_ITEMS_PER_CALL} ${args.entity_type || "records"} per call — split this into multiple BULK_CREATE calls instead.` };
      }
      if (name === "BULK_DELETE" && Array.isArray(args?.ids) && args.ids.length > MAX_BULK_ITEMS_PER_CALL) {
        return { queued: false, error: `BULK_DELETE can only remove up to ${MAX_BULK_ITEMS_PER_CALL} ${args.entity_type || "records"} per call — split this into multiple BULK_DELETE calls instead.` };
      }
      const { temp_id, ...rest } = args || {};
      plan.push({ action: name, args: rest, ...(temp_id ? { temp_id } : {}) });
      return {
        queued: true,
        note: "Staged, not executed yet — this runs on the user's own device after this response is returned (immediately if safe, or after they confirm if destructive). Do not tell the user this already happened.",
        ...(temp_id ? { temp_id_registered: temp_id, hint: `Reference this record later as "$${temp_id}" wherever an id is needed for it.` } : {}),
      };
    }
    return runLocalTool(name, args || {}, dataset);
  };
}
