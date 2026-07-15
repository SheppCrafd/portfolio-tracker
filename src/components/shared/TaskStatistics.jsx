import React from "react";

export default function TaskStatistics({ tasks = [] }) {
  const stats = {
    Done: 0,
    Delegated: 0,
    "In Progress": 0,
    Blocked: 0,
    "Pending Feedback": 0,
    "On Hold": 0,
    "Not Started": 0,
  };

  tasks.forEach((t) => {
    if (t.isArchived || t.status === "DELETED") return;
    
    // Normalize status strings
    const s = (t.status || "").toUpperCase().replace("-", "_");
    
    if (s === "DONE" || s === "DELEGATED_DONE") stats.Done++;
    else if (s === "DELEGATED") stats.Delegated++;
    else if (s === "IN_PROGRESS") stats["In Progress"]++;
    else if (s === "BLOCKED") stats.Blocked++;
    else if (s === "PENDING_FEEDBACK") stats["Pending Feedback"]++;
    else if (s === "ON_HOLD") stats["On Hold"]++;
    else stats["Not Started"]++;
  });

  const maxCount = Math.max(...Object.values(stats), 1);

  const config = [
    { label: "Done", count: stats.Done, color: "bg-[#86E7B0]" },
    { label: "Delegated", count: stats.Delegated, color: "bg-[#93C5FD]" },
    { label: "In Progress", count: stats["In Progress"], color: "bg-[#FDE047]" },
    { label: "Blocked", count: stats.Blocked, color: "bg-muted-foreground" },
    { label: "Pending Feedback", count: stats["Pending Feedback"], color: "bg-[#FDBA74]" },
    { label: "On Hold", count: stats["On Hold"], color: "bg-[#FCA5A5]" },
    { label: "Not Started", count: stats["Not Started"], color: "border-[1.5px] border-muted-foreground bg-transparent" },
  ];

  return (
    <div className="mt-4 pt-3 border-t border-border w-full">
      <h4 className="text-[13px] font-semibold text-foreground mb-3">Task Statistics</h4>
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {config.map((item) => (
          <div key={item.label} className="flex flex-col gap-1 w-full">
            <span className="text-[11px] text-muted-foreground leading-none">
              {item.label} &middot; {item.count}
            </span>
            {item.count > 0 ? (
              <div
                className={`h-2.5 rounded-full ${item.color}`}
                style={{ width: `${Math.max((item.count / maxCount) * 100, 15)}%` }}
              />
            ) : (
              <div className="h-2.5 w-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}