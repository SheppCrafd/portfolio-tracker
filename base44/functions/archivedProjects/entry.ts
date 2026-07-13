import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { start, end } = await req.json().catch(() => ({}));

    const projects = await base44.entities.Project.filter({ is_archived: true });
    const filtered = projects
      .filter((p) => !p.deleted_at)
      .filter((p) => {
        if (!start && !end) return true;
        const ref = new Date(p.updated_date);
        if (start && ref < new Date(start)) return false;
        if (end && ref > new Date(end)) return false;
        return true;
      });

    // Selective fetching: quadrant counts computed server-side, no nested task arrays returned.
    const withQuadrants = await Promise.all(
      filtered.map(async (p) => {
        const tasks = await base44.entities.Task.filter({ project_id: p.id });
        const activeTasks = tasks.filter((t) => !t.deleted_at);
        const quadrantCounts = [1, 2, 3, 4].map((q) => activeTasks.filter((t) => (t.quadrant || 4) === q).length);
        return {
          id: p.id,
          title: p.title,
          objective: p.objective,
          due_date: p.due_date,
          parent_product_id: p.parent_product_id,
          parent_area_id: p.parent_area_id,
          updated_date: p.updated_date,
          quadrant_counts: quadrantCounts,
        };
      })
    );

    return Response.json({ projects: withQuadrants });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});