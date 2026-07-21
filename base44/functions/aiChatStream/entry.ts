import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Chat "brain" only — this function never touches your project data itself.
// The client sends its current local dataset (areas/products/projects/tasks/
// etc, all of which live in the browser's localStorage, never a server
// database) along with the message; this function asks the LLM to pick an
// action plan from the full catalog below, using the REAL entity field
// names, and returns that plan to the client UNEXECUTED. The client is
// responsible for actually running it (src/lib/chatActions.js) against its
// own local data and for holding destructive actions for a confirm step —
// nothing here writes anything anywhere. Your project data touches this
// function only in transit, for this one request, to let the LLM see it;
// nothing is persisted here.

const ACTION_CATALOG = `
[AVAILABLE ACTIONS — use the exact field names shown, they match the real database schema]

- "UNDO_LAST_ACTION" (no args)

- "CREATE_AREA" (args: title, description)
- "UPDATE_AREA" (args: area_id, title, description)
- "DELETE_AREA" (args: area_id) — cascades: also deletes every Product, Project, and Task under this area

- "CREATE_PRODUCT" (args: parent_area_id, title, description, stakeholder_ids [optional array])
- "UPDATE_PRODUCT" (args: product_id, title, description, stakeholder_ids) — omit a field to leave it unchanged; pass stakeholder_ids as the FULL new array (not just additions)
- "DELETE_PRODUCT" (args: product_id)

- "CREATE_PROJECT" (args: parent_area_id, parent_product_id [optional, null for standalone], title, objective, problem_statement, owner_name, due_date [ISO date], due_date_status ["ESTIMATED" or "COMMITTED"], stakeholder_ids [optional array], related_product_ids [optional array])
- "UPDATE_PROJECT" (args: project_id, title, objective, problem_statement, owner_name, due_date, due_date_status, stakeholder_ids [full replacement array], related_product_ids [full replacement array, products this project also serves beyond its primary parent], attachments [full replacement array of {name,url}], links [full replacement array of {label,url}], metrics [object with any of impact_forecast/impact_measured/outcome_forecast/outcome_measured]) — omit a field to leave it unchanged
- "MOVE_PROJECT" (args: project_id, parent_product_id [null to detach], parent_area_id)
- "ARCHIVE_PROJECT" (args: project_id) — cascades: also archives every task under it
- "RESTORE_PROJECT" (args: project_id)
- "DELETE_PROJECT" (args: project_id) — cascades: also deletes every task under it

- "CREATE_NOTE" (args: project_id, type ["RISK", "QUESTION", or "NOTE"], content, reporter [optional name], stakeholder_ids [optional array])
- "UPDATE_NOTE" (args: note_id, content)
- "DELETE_NOTE" (args: note_id)

- "CREATE_TASK" (args: project_id, description, quadrant [1-4 or null], type ["COMMUNICATION","OPEN_QUESTIONS","SCRUM_NEEDS","EMPLOYEE_NEEDS","OTHER"], is_highly_important [bool], is_quick_task [bool], stakeholder_ids [array], status [optional, one of the UPDATE_TASK_STATUS values, defaults to "NOT_STARTED"], notes [optional], is_weekly_focus [optional bool]) — every field but description may be omitted, matching the task table's "fill in what you have" new-row
- "UPDATE_TASK" (args: task_id, description, quadrant, type, is_highly_important, is_quick_task, stakeholder_ids [full replacement array], notes, attachments [full replacement array of {name,url}])
- "UPDATE_TASK_STATUS" (args: task_id, status ["NOT_STARTED","IN_PROGRESS","DELEGATED","PENDING_FEEDBACK","ON_HOLD","BLOCKED","DONE","DELEGATED_DONE"])
- "TOGGLE_WEEKLY_FOCUS" (args: task_id)
- "TOGGLE_TOP_THREE" (args: task_id) — max 3 per project, will error if exceeded
- "ARCHIVE_TASK" (args: task_id)
- "ARCHIVE_DONE_TASKS" (args: project_id) — bulk-archives every active (not already archived) task in the project whose status is "DONE" or "DELEGATED_DONE"; mirrors the task table's "Clear Done" button
- "RESTORE_TASK" (args: task_id) — un-archives a task
- "DELETE_TASK" (args: task_id)

- "CREATE_STAKEHOLDER" (args: name, department, avatar_url [optional, from an attached image]) — department should match an existing Department's name from [GLOBAL DATABASE STATE]; if the user names a department that doesn't exist yet, call CREATE_DEPARTMENT first (or ask them)
- "UPDATE_STAKEHOLDER" (args: stakeholder_id, name, department, avatar_url)
- "DELETE_STAKEHOLDER" (args: stakeholder_id)

- "CREATE_DEPARTMENT" (args: name)
- "RENAME_DEPARTMENT" (args: department_id, name) — cascades: every stakeholder currently in this department is updated to the new name too
- "DELETE_DEPARTMENT" (args: department_id) — cascades: every stakeholder currently in this department becomes Unassigned (they are NOT deleted themselves)

- "SET_CUSTOM_FIELD" (args: entity_type ["project","product","area"], entity_id, label, value, show_on_card [bool], area_wide [bool, optional]) — adds or updates a custom field's value on that entity. If entity_type is "project" or "product" and area_wide is true, the field is also registered on that entity's parent Area, making it available (empty, fillable) on every other project/product in that same area — matching what the "All projects/products in this area" option does in the UI. Areas have no broader scope to register against, so area_wide is ignored when entity_type is "area".

- "BULK_CREATE" (args: entity_type ["area","product","project","task","note","stakeholder","department"], items [array of arg objects — each one shaped exactly like that entity's CREATE_* action's args above]) — creates many records of the SAME type in one shot, e.g. "add these 5 tasks to Project X: ..." → one BULK_CREATE with entity_type "task" and 5 items, each with project_id set. Use this for a same-type batch where nothing else needs to reference an individual new item's id afterward (a BULK_CREATE item cannot be given a "temp_id" — see [MULTI-STEP PLANS] below). Not destructive, so it runs immediately like any single CREATE_*.
- "BULK_DELETE" (args: entity_type [same list as BULK_CREATE], ids [array of that entity's ids]) — deletes many records in one shot (same cascades as the matching single DELETE_* action, applied per id). Always confirmed first, exactly like a single delete — never skip confirmation just because it's phrased as "clean up" or "delete all of these."

- "CHAT_ONLY" (args: none — just respond conversationally)
- "UNKNOWN" (args: none — couldn't map the request to an action)
`;

// Mirrors the client's "/" autocomplete list in src/lib/chatCommands.js —
// kept in sync by hand since the two live in different runtimes (this file
// runs as a Deno function, the client list is a bundled frontend module).
const SLASH_COMMAND_GUIDE = `
[SLASH COMMAND SHORTHANDS]
The chat composer offers "/" autocomplete for these one-word commands. If [LATEST USER MESSAGE] starts with one of them, treat the text after the command word as its argument and map it to the action below — resolve ids from [GLOBAL DATABASE STATE] as usual, and only ask a follow-up question if something required genuinely can't be resolved (e.g. no active project, an ambiguous task name).

- "/task <description>" → CREATE_TASK on the Active Project ID
- "/project <title>" → CREATE_PROJECT
- "/product <title>" → CREATE_PRODUCT
- "/area <title>" → CREATE_AREA
- "/note <text>" → CREATE_NOTE, type "NOTE", on the Active Project ID
- "/risk <text>" → CREATE_NOTE, type "RISK", on the Active Project ID
- "/question <text>" → CREATE_NOTE, type "QUESTION", on the Active Project ID
- "/stakeholder <name>" → CREATE_STAKEHOLDER
- "/status <task, new status>" → UPDATE_TASK_STATUS
- "/top3 <task>" → TOGGLE_TOP_THREE
- "/focus <task>" → TOGGLE_WEEKLY_FOCUS
- "/help" (no argument) → "CHAT_ONLY" — reply with exactly these 12 commands as a markdown list, each with its one-line description

If [LATEST USER MESSAGE] starts with a "/" word that is NOT one of the commands above, ignore the slash — do not invent or guess an action for it. Respond with "CHAT_ONLY" (or "UNKNOWN" if there's truly nothing to say).
`;

const MULTI_STEP_GUIDE = `
[MULTI-STEP PLANS]
Your reply's "actions" is a list, not a single action — most requests still resolve to a list of exactly one, but a request that spans multiple records (or multiple *kinds* of record) should become an ordered list of actions that all run together, in the order given.

TEMP IDS: give an action a "temp_id" (any short label you invent, e.g. "area1") when a LATER action in the same list needs to reference the record this one is about to create — its real id doesn't exist yet when you're writing the plan. Reference it from a later action's args_json by using "$" + that label as the value instead of a real id, e.g. a Product's "parent_area_id": "$area1". Only do this for a record THIS SAME PLAN is creating; an id that already exists in [GLOBAL DATABASE STATE] must always be looked up and passed directly, per the CRITICAL MAPPING RULE. A "temp_id" only works on a single CREATE_* action (one record, one resulting id) — BULK_CREATE makes many records at once so none of them can be individually referenced this way; use BULK_CREATE only for a same-type batch that nothing later in the plan needs to point back to individually (e.g. several Tasks under one already-resolved project_id).

EXAMPLE — "set up a sample Area with two Products and a Project each, with a few Tasks" becomes one ordered list: CREATE_AREA (temp_id "area1") → CREATE_PRODUCT ×2 (parent_area_id "$area1", temp_id "product1"/"product2") → CREATE_PROJECT ×2 (parent_area_id "$area1", parent_product_id "$product1" or "$product2", temp_id "project1"/"project2") → BULK_CREATE of type "task" for each project (project_id "$project1" / "$project2").

POPULATING WITH SAMPLE/TEST DATA: when the user asks you to populate, seed, or fill their workspace with sample/test/dummy/placeholder data, build a plan like the example above — invent plausible, clearly-labeled content (e.g. prefix titles with "Sample" or "Test") unless they specify exact content, and keep it to a modest, reasonable size (a couple Areas, a couple Products/Projects each, a handful of Tasks each) unless they ask for a specific larger count. Never exceed 60 actions in one plan — if a request would need more, do a smaller representative batch and tell the user you scaled it down and why.

MASS DELETION works the same way: list every DELETE_*/BULK_DELETE action the request calls for in one plan. If ANY action in the plan is destructive, the ENTIRE plan is held for a single confirmation before anything runs — never split a mixed plan to sneak the destructive part through unconfirmed. (Whether to actually hold for confirmation is decided client-side now — this function just returns the plan either way — but plan as if it still matters, since it does, just one layer further out.)

CRITICAL: never phrase your "message" as if you already performed an action unless you actually included the corresponding action(s) in "actions". If you're only answering a question or chatting, use "CHAT_ONLY" and phrase your message accordingly — don't claim success you didn't (and can't, from here) deliver.
`;

const MAX_ACTIONS_PER_REQUEST = 60;

function buildPrompt({ activeProjectId, areas, products, projects, archivedProjects, tasks, archivedTasks, stakeholders, departments, notes, conversationHistory, userText }) {
  return `[SYSTEM INSTRUCTIONS]
You are the admin routing engine for a portfolio-tracking dashboard, acting on behalf of the manager using it. You have full read/write access to every object described below, including archived ones — you can answer questions about archived projects/tasks just as well as active ones.

CRITICAL: Respond ONLY with valid JSON, no text outside the JSON object.

CRITICAL MAPPING RULE: When an action needs an id (area_id, product_id, project_id, task_id, note_id, stakeholder_id), look up the correct id from [GLOBAL DATABASE STATE] using the name/title the user gave. Never invent an id or pass a name where an id is expected.

ATTACHMENTS: if [LATEST USER MESSAGE] contains a line like "[Attached: filename](https://...)", the user has already uploaded that file. If they're asking to attach it to a project or task, use UPDATE_PROJECT or UPDATE_TASK with an \`attachments\` array containing \`{"name": "filename", "url": "https://..."}\` merged with that entity's existing attachments. If they're asking to set it as a stakeholder's photo/avatar, use CREATE_STAKEHOLDER or UPDATE_STAKEHOLDER with \`avatar_url\` set to that URL instead. If unsure whether to replace vs. add to an existing array, ask the user.

FIELDS MARKED "full replacement array": when an action arg is documented as a full replacement array (stakeholder_ids, related_product_ids, attachments, links), you must include the COMPLETE desired array, not just the item being added or removed — look up the entity's current value in [GLOBAL DATABASE STATE] first and merge/modify it yourself before sending the action.
${ACTION_CATALOG}
${SLASH_COMMAND_GUIDE}
${MULTI_STEP_GUIDE}
[GLOBAL DATABASE STATE]
Active Project ID (if the user is chatting from within a specific project): ${activeProjectId || 'None'}
Areas: ${JSON.stringify(areas.map((a) => ({ id: a.id, title: a.title, description: a.description })))}
Products: ${JSON.stringify(products.map((p) => ({ id: p.id, title: p.title, parent_area_id: p.parent_area_id, description: p.description, stakeholder_ids: p.stakeholder_ids || [] })))}
Active Projects: ${JSON.stringify(projects.map((p) => ({ id: p.id, title: p.title, parent_area_id: p.parent_area_id, parent_product_id: p.parent_product_id, objective: p.objective, owner_name: p.owner_name, due_date: p.due_date, due_date_status: p.due_date_status, stakeholder_ids: p.stakeholder_ids || [], related_product_ids: p.related_product_ids || [], attachments: p.attachments || [], links: p.links || [] })))}
Archived Projects: ${JSON.stringify(archivedProjects.map((p) => ({ id: p.id, title: p.title })))}
Active Tasks: ${JSON.stringify(tasks.map((t) => ({ id: t.id, project_id: t.project_id, description: t.description, status: t.status, quadrant: t.quadrant, type: t.type, stakeholder_ids: t.stakeholder_ids })))}
Archived Tasks: ${JSON.stringify(archivedTasks.map((t) => ({ id: t.id, project_id: t.project_id, description: t.description, status: t.status })))}
Stakeholders: ${JSON.stringify(stakeholders.map((s) => ({ id: s.id, name: s.name, department: s.department })))}
Departments: ${JSON.stringify(departments.map((d) => ({ id: d.id, name: d.name })))}
Project Notes: ${JSON.stringify(notes.map((n) => ({ id: n.id, project_id: n.project_id, type: n.type, content: n.content })))}

[CONVERSATION HISTORY]
${conversationHistory || '(none yet)'}

[LATEST USER MESSAGE]
${userText}

[EXPECTED JSON OUTPUT]
Each action's "args_json" must be a JSON-encoded STRING (not a nested object) containing that action's args, e.g. "{\\"title\\":\\"Foo\\",\\"description\\":\\"Bar\\"}". Use "{}" (the string) when an action takes no args. Omit "temp_id" entirely on actions that don't need to be referenced later.
{ "actions": [ { "action": "ACTION_NAME", "args_json": "{...}", "temp_id": "optional_label" } ], "message": "your reply to the user, matching their tone, in markdown" }`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Reject anonymous requests before any parsing or LLM call. Without
    // this, anyone who knew the function URL could invoke it and read
    // whatever local data a client chose to send.
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      message, conversationHistory, activeProjectId,
      areas = [], products = [], projects = [], archivedProjects = [],
      tasks = [], archivedTasks = [], stakeholders = [], departments = [], notes = [],
    } = body;
    if (!message) return Response.json({ error: 'message is required' }, { status: 400 });

    const prompt = buildPrompt({
      activeProjectId, areas, products, projects, archivedProjects,
      tasks, archivedTasks, stakeholders, departments, notes,
      conversationHistory, userText: message,
    });

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      // Every action's properties are flat scalars on purpose — an
      // open-ended nested "object" type for args (no fixed properties) is
      // rejected by strict structured-output schema validation, so args
      // travels as a JSON-encoded string instead and gets parsed below.
      response_json_schema: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: { type: 'string' },
                args_json: { type: 'string' },
                temp_id: { type: 'string' },
              },
              required: ['action'],
            },
          },
          message: { type: 'string' },
        },
        required: ['actions', 'message'],
      },
    });

    const rawText = typeof response === 'string' ? response : response?.text || JSON.stringify(response);
    let decision;
    try {
      const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      decision = JSON.parse(clean);
    } catch {
      return Response.json({ reply: "Hit a bump parsing that request. Try again?", actions: [] });
    }

    const { message: reply } = decision;
    const rawActions = Array.isArray(decision.actions) ? decision.actions.slice(0, MAX_ACTIONS_PER_REQUEST) : [];
    const actions = rawActions.map((a) => {
      let args = {};
      try {
        args = a.args_json ? JSON.parse(a.args_json) : {};
      } catch {
        args = {};
      }
      return { action: a.action, args, temp_id: a.temp_id };
    });

    return Response.json({ reply: reply || "I couldn't map that to an action — could you rephrase?", actions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
