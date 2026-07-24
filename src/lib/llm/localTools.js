// Client-side ports of aiChatStream/entry.ts's two "live" tools that don't
// need any base44-only capability — pure reads over the same dataset
// useChatController.js already gathers for the prompt. Kept in sync by
// hand with entry.ts's searchRecords/buildTools (search_workspace) and
// audit_workspace — different runtime, can't share a module, same
// reasoning as toolCatalog.js.
function searchRecords(query, records, type, fields, titleField) {
  const q = query.toLowerCase();
  const matches = [];
  for (const record of records) {
    const haystack = fields.map((f) => record[f] || "").join(" ").toLowerCase();
    if (haystack.includes(q)) {
      matches.push({
        type,
        id: record.id,
        title: record[titleField] || fields.map((f) => record[f]).find(Boolean) || "(untitled)",
        snippet: fields.map((f) => record[f]).filter(Boolean).join(" — ").slice(0, 300),
      });
    }
  }
  return matches;
}

export function searchWorkspace(dataset, query) {
  const matches = [
    ...searchRecords(query, dataset.areas, "area", ["title", "description"], "title"),
    ...searchRecords(query, dataset.products, "product", ["title", "description"], "title"),
    ...searchRecords(query, dataset.projects, "project", ["title", "objective", "problem_statement"], "title"),
    ...searchRecords(query, dataset.archivedProjects, "archived_project", ["title", "objective", "problem_statement"], "title"),
    ...searchRecords(query, dataset.tasks, "task", ["description", "notes"], "description"),
    ...searchRecords(query, dataset.archivedTasks, "archived_task", ["description", "notes"], "description"),
    ...searchRecords(query, dataset.stakeholders, "stakeholder", ["name", "department"], "name"),
    ...searchRecords(query, dataset.notes, "note", ["content"], "content"),
  ];
  return { count: matches.length, matches: matches.slice(0, 25) };
}

export function auditWorkspace(dataset) {
  const findings = {};

  findings.projects_missing_owner_or_due_date = dataset.projects
    .filter((p) => !p.owner_name || !p.due_date)
    .map((p) => ({ id: p.id, title: p.title, missing: [!p.owner_name && "owner", !p.due_date && "due_date"].filter(Boolean) }));

  const today = new Date().toISOString().slice(0, 10);
  findings.overdue_projects = dataset.projects
    .filter((p) => p.due_date && p.due_date < today)
    .map((p) => ({ id: p.id, title: p.title, due_date: p.due_date }));

  findings.done_tasks_not_yet_archived = dataset.tasks
    .filter((t) => t.status === "DONE" || t.status === "DELEGATED_DONE")
    .map((t) => ({ id: t.id, project_id: t.project_id, description: t.description }));

  const seen = new Map();
  findings.possible_duplicate_tasks = [];
  for (const t of dataset.tasks) {
    const key = `${t.project_id}::${(t.description || "").trim().toLowerCase()}`;
    if (t.description && seen.has(key)) findings.possible_duplicate_tasks.push({ ids: [seen.get(key), t.id], project_id: t.project_id, description: t.description });
    else seen.set(key, t.id);
  }

  findings.stakeholders_missing_department = dataset.stakeholders
    .filter((s) => !s.department)
    .map((s) => ({ id: s.id, name: s.name }));

  const productIdsWithProjects = new Set(dataset.projects.map((p) => p.parent_product_id).filter(Boolean));
  findings.empty_products = dataset.products
    .filter((p) => !productIdsWithProjects.has(p.id))
    .map((p) => ({ id: p.id, title: p.title }));

  const areaIdsWithContent = new Set([...dataset.projects, ...dataset.products].map((x) => x.parent_area_id).filter(Boolean));
  findings.empty_areas = dataset.areas
    .filter((a) => !areaIdsWithContent.has(a.id))
    .map((a) => ({ id: a.id, title: a.title }));

  return findings;
}

// Dispatches one of the catalog's non-staged ("live") tools by name. Staged
// (mutation) tools never reach here — byokChat.js's tool runner queues those
// directly without needing a dataset at all.
export function runLocalTool(name, args, dataset) {
  switch (name) {
    case "search_workspace":
      return searchWorkspace(dataset, args.query);
    case "audit_workspace":
      return auditWorkspace(dataset);
    default:
      return { error: `Unknown tool "${name}"` };
  }
}
