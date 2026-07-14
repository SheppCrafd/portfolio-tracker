import React from 'react';

export default function DueDateBadge({ project, allDone }) {
  if (!project.dueDate) {
    return (
      <div className="text-right shrink-0 min-w-[70px]">
        <p className="text-[10px] font-semibold text-muted-foreground truncate">{project.owner || "Unassigned"}</p>
        <p className="text-[10px] text-muted-foreground">No due date</p>
      </div>
    );
  }

  // REQUIREMENT: Date Color Coding
  let dateColor = "text-black dark:text-white"; // Default: Estimated
  
  if (allDone || project.dueDateStatus === "Done") {
    dateColor = "text-blue-500 font-bold";
  } else if (project.dueDateStatus === "Committed - On Track") {
    dateColor = "text-green-600 font-bold";
  } else if (project.dueDateStatus === "Committed - At Risk") {
    dateColor = "text-orange-500 font-bold";
  } else if (project.dueDateStatus === "Committed - Missed") {
    dateColor = "text-red-600 font-bold";
  }

  // Format date to a short string (e.g., "Oct 12")
  const formattedDate = new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="text-right shrink-0 min-w-[70px]">
      <p className="text-[10px] font-semibold text-muted-foreground truncate" title={project.owner}>
        {project.owner || "Unassigned"}
      </p>
      <p className={`text-[11px] ${dateColor}`}>
        {formattedDate}
      </p>
    </div>
  );
}
