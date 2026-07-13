import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { project_id, description } = body;
    if (!project_id || !description) {
      return Response.json({ error: 'project_id and description are required' }, { status: 400 });
    }

    const task = await base44.entities.Task.create({
      project_id,
      description,
      status: body.status || 'NOT_STARTED',
      quadrant: body.quadrant ?? null,
      type: body.type || 'OTHER',
      is_highly_important: !!body.is_highly_important,
      is_quick_task: !!body.is_quick_task,
      notes: body.notes || '',
      stakeholder_ids: body.stakeholder_ids || [],
      is_weekly_focus: false,
      is_today_top_three: false,
    });

    return Response.json({ task });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});