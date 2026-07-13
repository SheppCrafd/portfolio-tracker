import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { taskId } = await req.json();
    if (!taskId) return Response.json({ error: 'taskId is required' }, { status: 400 });

    const task = await base44.entities.Task.get(taskId);
    if (!task) return Response.json({ error: 'Task not found' }, { status: 404 });

    const nextValue = !task.is_today_top_three;

    if (nextValue) {
      const projectTasks = await base44.entities.Task.filter({ project_id: task.project_id, is_today_top_three: true });
      const otherTopThree = projectTasks.filter((t) => t.id !== taskId);
      if (otherTopThree.length >= 3) {
        return Response.json({ error: 'Only 3 "Top 3" tasks are allowed per project' }, { status: 400 });
      }
    }

    const updated = await base44.entities.Task.update(taskId, { is_today_top_three: nextValue });
    return Response.json({ task: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});