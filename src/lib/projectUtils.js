export function getProjectOwner(project) {
  return project.owner_name || null;
}

export function getProjectDueDate(project) {
  return project.due_date || null;
}

export function getProjectDueStatus(project) {
  return project.due_date_status || "ESTIMATED";
}

export function getProjectArchiveStatus(project) {
  return !!project.is_archived;
}

// Text color for the due-date badge on a project card. Blue always wins once
// every active task is done; otherwise the schema's due_date_status
// (ESTIMATED/COMMITTED) drives it. COMMITTED currently only ever renders as
// green — the schema has no on-track/at-risk/missed distinction yet.
export function getDueDateColorClass(project, allDone = false) {
  if (allDone) return "text-blue-500 font-bold";
  if (getProjectDueStatus(project) === "COMMITTED") return "text-green-600 font-bold";
  return "text-black dark:text-white";
}

export function formatDueDate(project) {
  const dueDate = getProjectDueDate(project);
  if (!dueDate) return "No due date";
  return new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}