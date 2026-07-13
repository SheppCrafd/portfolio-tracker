import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id, description } = await req.json();
    if (!project_id || !description) {
      return Response.json({ error: 'project_id and description are required' }, { status: 400 });
    }

    const task = await base44.entities.Task.create({
      project_id,
      description,
      status: 'todo',
      is_top_three: false,
      is_weekly_focus: false,
    });

    return Response.json({ task });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});