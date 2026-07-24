import { STAGED_TOOL_NAMES } from "@/lib/llm/toolCatalog";
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
