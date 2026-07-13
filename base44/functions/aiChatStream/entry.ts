import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, projectId } = await req.json();
    if (!message) return Response.json({ error: 'message is required' }, { status: 400 });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a portfolio management assistant. The user said: "${message}". If they are clearly asking to create a task, set tool_call_name to "create_task" and tool_call_description to the task text. Otherwise leave tool_call_name empty and just reply helpfully in markdown (use bold/lists where useful).`,
      response_json_schema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          tool_call_name: { type: 'string' },
          tool_call_description: { type: 'string' },
        },
        required: ['reply'],
      },
    });

    let toolResult = null;
    if (result.tool_call_name === 'create_task' && projectId) {
      const task = await base44.entities.Task.create({
        project_id: projectId,
        description: result.tool_call_description || 'New task',
        status: 'todo',
        is_top_three: false,
        is_weekly_focus: false,
      });
      toolResult = { name: 'create_task', task };
    }

    return Response.json({ reply: result.reply, toolResult });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});