import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { message } = await req.json();
    if (!message) return Response.json({ error: 'message is required' }, { status: 400 });

    const projects = await base44.entities.Project.filter({ is_archived: false });
    const projectList = projects.map((p) => `${p.id}: ${p.title}`).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a portfolio management assistant. Known projects (id: title):\n${projectList}\n\nThe user said: "${message}".\nIf they are clearly asking to create a task on one of the known projects, set tool_call_name to "create_task", tool_call_project_id to the matching project id, and tool_call_description to the task text.\nIf they are clearly asking to log a risk or open question on one of the known projects, set tool_call_name to "add_note", tool_call_project_id to the matching project id, tool_call_note_type to "RISK" or "QUESTION", and tool_call_description to the note content.\nOtherwise leave tool_call_name empty and just reply helpfully in markdown (use bold/lists where useful).`,
      response_json_schema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          tool_call_name: { type: 'string' },
          tool_call_project_id: { type: 'string' },
          tool_call_description: { type: 'string' },
          tool_call_note_type: { type: 'string' },
        },
        required: ['reply'],
      },
    });

    let toolResult = null;
    if (result.tool_call_name === 'create_task' && result.tool_call_project_id) {
      const task = await base44.entities.Task.create({
        project_id: result.tool_call_project_id,
        description: result.tool_call_description || 'New task',
        status: 'NOT_STARTED',
        type: 'OTHER',
        is_today_top_three: false,
        is_weekly_focus: false,
      });
      toolResult = { name: 'create_task', task };
    } else if (result.tool_call_name === 'add_note' && result.tool_call_project_id) {
      const note = await base44.entities.ProjectNote.create({
        project_id: result.tool_call_project_id,
        type: result.tool_call_note_type === 'QUESTION' ? 'QUESTION' : 'RISK',
        content: result.tool_call_description || '',
      });
      toolResult = { name: 'add_note', note };
    }

    return Response.json({ reply: result.reply, toolResult });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});