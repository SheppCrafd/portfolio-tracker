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

const AT_RISK_WINDOW_DAYS = 7;

// Text color for the due-date badge on a project card. Blue always wins once
// every active task is done. Otherwise, ESTIMATED projects are always the
// neutral default color, and COMMITTED projects derive on-track/at-risk/missed
// from how close the due date is — there's no separate stored risk field, so
// this is computed fresh every render and updates itself as time passes.
export function getDueDateColorClass(project, allDone = false) {
  if (allDone) return "text-blue-500 font-bold";
  if (getProjectDueStatus(project) !== "COMMITTED") return "text-black dark:text-white";

  const dueDate = getProjectDueDate(project);
  if (!dueDate) return "text-black dark:text-white";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) return "text-red-600 font-bold"; // committed + overdue = missed
  if (daysUntilDue <= AT_RISK_WINDOW_DAYS) return "text-orange-500 font-bold"; // committed + due soon = at risk
  return "text-green-600 font-bold"; // committed + comfortable runway = on track
}

export function formatDueDate(project) {
  const dueDate = getProjectDueDate(project);
  if (!dueDate) return "No due date";
  return new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}