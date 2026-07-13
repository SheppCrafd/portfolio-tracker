import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { start, end } = await req.json().catch(() => ({}));

    const projects = await base44.entities.Project.filter({ is_archived: true });

    // Selective fetching: date-range filter + strip to summary fields only (no nested tasks)
    const filtered = projects
      .filter((p) => !p.deleted_at)
      .filter((p) => {
        if (!start && !end) return true;
        const ref = new Date(p.updated_date);
        if (start && ref < new Date(start)) return false;
        if (end && ref > new Date(end)) return false;
        return true;
      })
      .map((p) => ({
        id: p.id,
        title: p.title,
        objective: p.objective,
        due_date: p.due_date,
        parent_product_id: p.parent_product_id,
        updated_date: p.updated_date,
      }));

    return Response.json({ projects: filtered });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});