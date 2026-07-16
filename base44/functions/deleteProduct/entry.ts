import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Soft delete: tags the product deleted_at, and cascades deleted_at to every
// child Project (and every Task under those projects) — matching the same
// cascade pattern used by deleteArea and deleteProject.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return Response.json({ error: 'productId is required' }, { status: 400 });

    const now = new Date().toISOString();
    const product = await base44.entities.Product.update(productId, { deleted_at: now });

    const projects = await base44.entities.Project.filter({ parent_product_id: productId });
    await Promise.all(projects.filter((p) => !p.deleted_at).map((p) => base44.entities.Project.update(p.id, { deleted_at: now })));

    const tasksByProject = await Promise.all(projects.map((p) => base44.entities.Task.filter({ project_id: p.id })));
    await Promise.all(tasksByProject.flat().filter((t) => !t.deleted_at).map((t) => base44.entities.Task.update(t.id, { deleted_at: now })));

    return Response.json({ product });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
