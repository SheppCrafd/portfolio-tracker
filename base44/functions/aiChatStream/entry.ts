import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Full-capability chat assistant backend. The client sends the user's
// message (plus recent conversation text); this function gathers complete
// app context (including archived data), asks the LLM to pick one action
// from the full catalog below (using the REAL entity field names, not the
// legacy client-side prompt's guessed ones), and executes it server-side
// under the authenticated request context.
//
// Destructive actions (DELETE_*) are never executed on the first pass: they
// come back as `pending_action` for the client to confirm, then get
// re-submitted with `confirmedAction` set to actually run — mirroring the
// confirm dialog a human gets from the equivalent UI button.

const DESTRUCTIVE_ACTIONS = new Set([
  'DELETE_AREA',
  'DELETE_PRODUCT',
  'DELETE_PROJECT',
  'DELETE_TASK',
  'DELETE_STAKEHOLDER',
  'DELETE_NOTE',
]);

const ACTION_CATALOG = `
[AVAILABLE ACTIONS — use the exact field names shown, they match the real database schema]

- "UNDO_LAST_ACTION" (no args)

- "CREATE_AREA" (args: title, description)
- "UPDATE_AREA" (args: area_id, title, description)
- "DELETE_AREA" (args: area_id) — cascades: also deletes every Product, Project, and Task under this area

- "CREATE_PRODUCT" (args: parent_area_id, title, description)
- "UPDATE_PRODUCT" (args: product_id, title, description)
- "DELETE_PRODUCT" (args: product_id)

- "CREATE_PROJECT" (args: parent_area_id, parent_product_id [optional, null for standalone], title, objective, problem_statement, owner_name, due_date [ISO date], due_date_status ["ESTIMATED" or "COMMITTED"])
- "UPDATE_PROJECT" (args: project_id, title, objective, problem_statement, owner_name, due_date, due_date_status, activity)
- "MOVE_PROJECT" (args: project_id, parent_product_id [null to detach], parent_area_id)
- "ARCHIVE_PROJECT" (args: project_id) — cascades: also archives every task under it
- "RESTORE_PROJECT" (args: project_id)
- "DELETE_PROJECT" (args: project_id) — cascades: also deletes every task under it

- "CREATE_NOTE" (args: project_id, type ["RISK", "QUESTION", or "NOTE"], content, reporter [optional name], stakeholder_ids [optional array])
- "UPDATE_NOTE" (args: note_id, content)
- "DELETE_NOTE" (args: note_id)

- "CREATE_TASK" (args: project_id, description, quadrant [1-4 or null], type ["COMMUNICATION","OPEN_QUESTIONS","SCRUM_NEEDS","EMPLOYEE_NEEDS","OTHER"], is_highly_important [bool], is_quick_task [bool], stakeholder_ids [array])
- "UPDATE_TASK" (args: task_id, description, quadrant, type, is_highly_important, is_quick_task, stakeholder_ids, notes)
- "UPDATE_TASK_STATUS" (args: task_id, status ["NOT_STARTED","IN_PROGRESS","DELEGATED","PENDING_FEEDBACK","ON_HOLD","BLOCKED","DONE","DELEGATED_DONE"])
- "TOGGLE_WEEKLY_FOCUS" (args: task_id)
- "TOGGLE_TOP_THREE" (args: task_id) — max 3 per project, will error if exceeded
- "ARCHIVE_TASK" (args: task_id)
- "DELETE_TASK" (args: task_id)

- "CREATE_STAKEHOLDER" (args: name, department)
- "UPDATE_STAKEHOLDER" (args: stakeholder_id, name, department)
- "DELETE_STAKEHOLDER" (args: stakeholder_id)

- "SET_CUSTOM_FIELD" (args: entity_type ["project","product","area"], entity_id, label, value, show_on_card [bool]) — adds or updates a custom field's value directly on that one entity (chat-created fields are always scoped to the single entity, not registered app/area-wide — that broader scope is only settable from the UI)

- "CHAT_ONLY" (args: none — just respond conversationally)
- "UNKNOWN" (args: none — couldn't map the request to an action)
`;

function buildPrompt({ activeProjectId, areas, products, projects, archivedProjects, tasks, archivedTasks, stakeholders, notes, conversationHistory, userText }) {
  return `[SYSTEM INSTRUCTIONS]
You are the admin routing engine for a portfolio-tracking dashboard, acting on behalf of the manager using it. You have full read/write access to every object described below, including archived ones — you can answer questions about archived projects/tasks just as well as active ones.

CRITICAL: Respond ONLY with valid JSON, no text outside the JSON object.

CRITICAL MAPPING RULE: When an action needs an id (area_id, product_id, project_id, task_id, note_id, stakeholder_id), look up the correct id from [GLOBAL DATABASE STATE] using the name/title the user gave. Never invent an id or pass a name where an id is expected.
${ACTION_CATALOG}
[GLOBAL DATABASE STATE]
Active Project ID (if the user is chatting from within a specific project): ${activeProjectId || 'None'}
Areas: ${JSON.stringify(areas.map((a) => ({ id: a.id, title: a.title, description: a.description })))}
Products: ${JSON.stringify(products.map((p) => ({ id: p.id, title: p.title, parent_area_id: p.parent_area_id, description: p.description })))}
Active Projects: ${JSON.stringify(projects.map((p) => ({ id: p.id, title: p.title, parent_area_id: p.parent_area_id, parent_product_id: p.parent_product_id, objective: p.objective, owner_name: p.owner_name, due_date: p.due_date, due_date_status: p.due_date_status })))}
Archived Projects: ${JSON.stringify(archivedProjects.map((p) => ({ id: p.id, title: p.title })))}
Active Tasks: ${JSON.stringify(tasks.map((t) => ({ id: t.id, project_id: t.project_id, description: t.description, status: t.status, quadrant: t.quadrant, type: t.type, stakeholder_ids: t.stakeholder_ids })))}
Archived Tasks: ${JSON.stringify(archivedTasks.map((t) => ({ id: t.id, project_id: t.project_id, description: t.description, status: t.status })))}
Stakeholders: ${JSON.stringify(stakeholders.map((s) => ({ id: s.id, name: s.name, department: s.department })))}
Project Notes: ${JSON.stringify(notes.map((n) => ({ id: n.id, project_id: n.project_id, type: n.type, content: n.content })))}

[CONVERSATION HISTORY]
${conversationHistory || '(none yet)'}

[LATEST USER MESSAGE]
${userText}

[EXPECTED JSON OUTPUT]
{ "action": "ACTION_NAME", "args": { ... }, "message": "your reply to the user, matching their tone, in markdown" }`;
}

async function executeAction(base44, action, args) {
  switch (action) {
    case 'CREATE_AREA': {
      const area = await base44.entities.Area.create({ title: args.title, description: args.description });
      return { toolResult: { area } };
    }
    case 'UPDATE_AREA': {
      const area = await base44.entities.Area.update(args.area_id, { title: args.title, description: args.description });
      return { toolResult: { area } };
    }
    case 'DELETE_AREA': {
      const now = new Date().toISOString();
      const area = await base44.entities.Area.update(args.area_id, { deleted_at: now });
      const products = await base44.entities.Product.filter({ parent_area_id: args.area_id });
      await Promise.all(products.filter((p) => !p.deleted_at).map((p) => base44.entities.Product.update(p.id, { deleted_at: now })));
      const projects = await base44.entities.Project.filter({ parent_area_id: args.area_id });
      await Promise.all(projects.filter((p) => !p.deleted_at).map((p) => base44.entities.Project.update(p.id, { deleted_at: now })));
      const tasksByProject = await Promise.all(projects.map((p) => base44.entities.Task.filter({ project_id: p.id })));
      await Promise.all(tasksByProject.flat().filter((t) => !t.deleted_at).map((t) => base44.entities.Task.update(t.id, { deleted_at: now })));
      return { toolResult: { area } };
    }

    case 'CREATE_PRODUCT': {
      const product = await base44.entities.Product.create({ parent_area_id: args.parent_area_id, title: args.title, description: args.description });
      return { toolResult: { product } };
    }
    case 'UPDATE_PRODUCT': {
      const product = await base44.entities.Product.update(args.product_id, { title: args.title, description: args.description });
      return { toolResult: { product } };
    }
    case 'DELETE_PRODUCT': {
      const product = await base44.entities.Product.update(args.product_id, { deleted_at: new Date().toISOString() });
      return { toolResult: { product } };
    }

    case 'CREATE_PROJECT': {
      const project = await base44.entities.Project.create({
        parent_area_id: args.parent_area_id,
        parent_product_id: args.parent_product_id || null,
        title: args.title,
        objective: args.objective,
        problem_statement: args.problem_statement,
        owner_name: args.owner_name,
        due_date: args.due_date,
        due_date_status: args.due_date_status || 'ESTIMATED',
      });
      return { toolResult: { project } };
    }
    case 'UPDATE_PROJECT': {
      const { project_id, ...rest } = args;
      const project = await base44.entities.Project.update(project_id, rest);
      return { toolResult: { project } };
    }
    case 'MOVE_PROJECT': {
      const project = await base44.entities.Project.update(args.project_id, {
        parent_product_id: args.parent_product_id ?? null,
        parent_area_id: args.parent_area_id,
      });
      return { toolResult: { project } };
    }
    case 'ARCHIVE_PROJECT': {
      const project = await base44.entities.Project.update(args.project_id, { is_archived: true });
      const tasks = await base44.entities.Task.filter({ project_id: args.project_id });
      const now = new Date().toISOString();
      await Promise.all(tasks.map((t) => base44.entities.Task.update(t.id, { archived_at: now })));
      return { toolResult: { project } };
    }
    case 'RESTORE_PROJECT': {
      const project = await base44.entities.Project.update(args.project_id, { is_archived: false });
      const tasks = await base44.entities.Task.filter({ project_id: args.project_id });
      await Promise.all(tasks.filter((t) => t.archived_at).map((t) => base44.entities.Task.update(t.id, { archived_at: null })));
      return { toolResult: { project } };
    }
    case 'DELETE_PROJECT': {
      const now = new Date().toISOString();
      const project = await base44.entities.Project.update(args.project_id, { deleted_at: now });
      const tasks = await base44.entities.Task.filter({ project_id: args.project_id });
      await Promise.all(tasks.filter((t) => !t.deleted_at).map((t) => base44.entities.Task.update(t.id, { deleted_at: now })));
      return { toolResult: { project } };
    }

    case 'CREATE_NOTE': {
      const note = await base44.entities.ProjectNote.create({
        project_id: args.project_id,
        type: args.type || 'NOTE',
        content: args.content,
        reporter: args.reporter,
        stakeholder_ids: args.stakeholder_ids || [],
      });
      return { toolResult: { note } };
    }
    case 'UPDATE_NOTE': {
      const note = await base44.entities.ProjectNote.update(args.note_id, { content: args.content });
      return { toolResult: { note } };
    }
    case 'DELETE_NOTE': {
      await base44.entities.ProjectNote.delete(args.note_id);
      return { toolResult: {} };
    }

    case 'CREATE_TASK': {
      const task = await base44.entities.Task.create({
        project_id: args.project_id,
        description: args.description,
        quadrant: args.quadrant ?? null,
        type: args.type || 'OTHER',
        is_highly_important: !!args.is_highly_important,
        is_quick_task: !!args.is_quick_task,
        stakeholder_ids: args.stakeholder_ids || [],
      });
      return { toolResult: { task } };
    }
    case 'UPDATE_TASK': {
      const { task_id, ...rest } = args;
      const task = await base44.entities.Task.update(task_id, rest);
      return { toolResult: { task } };
    }
    case 'UPDATE_TASK_STATUS': {
      const previous = await base44.entities.Task.get(args.task_id);
      const task = await base44.entities.Task.update(args.task_id, { status: args.status });
      return { toolResult: { task, previousStatus: previous?.status, undo: { type: 'UPDATE_TASK_STATUS', task_id: args.task_id, status: previous?.status } } };
    }
    case 'TOGGLE_WEEKLY_FOCUS': {
      const previous = await base44.entities.Task.get(args.task_id);
      const task = await base44.entities.Task.update(args.task_id, { is_weekly_focus: !previous?.is_weekly_focus });
      return { toolResult: { task, undo: { type: 'TOGGLE_WEEKLY_FOCUS', task_id: args.task_id } } };
    }
    case 'TOGGLE_TOP_THREE': {
      const previous = await base44.entities.Task.get(args.task_id);
      if (!previous) throw new Error('Task not found');
      const nextValue = !previous.is_today_top_three;
      if (nextValue) {
        const projectTasks = await base44.entities.Task.filter({ project_id: previous.project_id, is_today_top_three: true });
        if (projectTasks.filter((t) => t.id !== args.task_id).length >= 3) {
          throw new Error('Only 3 "Top 3" tasks are allowed per project');
        }
      }
      const task = await base44.entities.Task.update(args.task_id, { is_today_top_three: nextValue });
      return { toolResult: { task, undo: { type: 'TOGGLE_TOP_THREE', task_id: args.task_id } } };
    }
    case 'ARCHIVE_TASK': {
      const task = await base44.entities.Task.update(args.task_id, { archived_at: new Date().toISOString() });
      return { toolResult: { task } };
    }
    case 'DELETE_TASK': {
      const task = await base44.entities.Task.update(args.task_id, { deleted_at: new Date().toISOString() });
      return { toolResult: { task } };
    }

    case 'CREATE_STAKEHOLDER': {
      const stakeholder = await base44.entities.Stakeholder.create({ name: args.name, department: args.department });
      return { toolResult: { stakeholder } };
    }
    case 'UPDATE_STAKEHOLDER': {
      const stakeholder = await base44.entities.Stakeholder.update(args.stakeholder_id, { name: args.name, department: args.department });
      return { toolResult: { stakeholder } };
    }
    case 'DELETE_STAKEHOLDER': {
      const stakeholder = await base44.entities.Stakeholder.update(args.stakeholder_id, { deleted_at: new Date().toISOString() });
      return { toolResult: { stakeholder } };
    }

    case 'SET_CUSTOM_FIELD': {
      const entityMap = { project: base44.entities.Project, product: base44.entities.Product, area: base44.entities.Area };
      const entityApi = entityMap[args.entity_type];
      if (!entityApi) throw new Error(`Unknown entity_type "${args.entity_type}"`);
      const entity = await entityApi.get(args.entity_id);
      if (!entity) throw new Error('Entity not found');
      const key = String(args.label).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'field';
      const custom_data = { ...entity.custom_data, [key]: { label: args.label, value: args.value } };
      const display_on_card_fields = args.show_on_card
        ? [...new Set([...(entity.display_on_card_fields || []), key])]
        : entity.display_on_card_fields || [];
      const updated = await entityApi.update(args.entity_id, { custom_data, display_on_card_fields });
      return { toolResult: { entity: updated } };
    }

    default:
      throw new Error(`Unknown action "${action}"`);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { confirmedAction } = body;

    // Second round-trip: the client already showed a confirm prompt and the
    // user accepted, so just run the action — no LLM call needed.
    if (confirmedAction) {
      const { action, args } = confirmedAction;
      const result = await executeAction(base44, action, args);
      return Response.json({ reply: confirmedAction.confirmMessage || 'Done.', toolResult: result.toolResult, action });
    }

    const { message, conversationHistory, activeProjectId } = body;
    if (!message) return Response.json({ error: 'message is required' }, { status: 400 });

    const [areas, products, allProjects, allTasksRaw, stakeholders, notes] = await Promise.all([
      base44.entities.Area.list(),
      base44.entities.Product.list(),
      base44.entities.Project.list(),
      base44.entities.Task.list(),
      base44.entities.Stakeholder.list(),
      base44.entities.ProjectNote.list(),
    ]);

    const projects = allProjects.filter((p) => !p.is_archived && !p.deleted_at);
    const archivedProjects = allProjects.filter((p) => p.is_archived && !p.deleted_at);
    const tasks = allTasksRaw.filter((t) => !t.archived_at && !t.deleted_at);
    const archivedTasks = allTasksRaw.filter((t) => t.archived_at && !t.deleted_at);

    const prompt = buildPrompt({
      activeProjectId,
      areas: areas.filter((a) => !a.deleted_at),
      products: products.filter((p) => !p.deleted_at),
      projects,
      archivedProjects,
      tasks,
      archivedTasks,
      stakeholders: stakeholders.filter((s) => !s.deleted_at),
      notes,
      conversationHistory,
      userText: message,
    });

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          args: { type: 'object' },
          message: { type: 'string' },
        },
        required: ['action', 'message'],
      },
    });

    const rawText = typeof response === 'string' ? response : response?.text || JSON.stringify(response);
    let decision;
    try {
      const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      decision = JSON.parse(clean);
    } catch {
      return Response.json({ reply: "Hit a bump parsing that request. Try again?" });
    }

    const { action, args, message: reply } = decision;

    if (!action || action === 'CHAT_ONLY' || action === 'UNKNOWN') {
      return Response.json({ reply: reply || "I couldn't map that to an action — could you rephrase?" });
    }

    if (action === 'UNDO_LAST_ACTION') {
      // The undo target lives in the client's local history (last mutation
      // it applied), so just tell the client to handle it.
      return Response.json({ reply, action: 'UNDO_LAST_ACTION' });
    }

    if (DESTRUCTIVE_ACTIONS.has(action)) {
      return Response.json({
        reply,
        pending_action: { action, args, confirmMessage: reply },
      });
    }

    const result = await executeAction(base44, action, args);
    return Response.json({ reply, toolResult: result.toolResult, action });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
