// Live 4-quadrant block — counts are derived from real Task records (task.quadrant 1-4)
// and refresh instantly via the realtime subscription in useTasks.
export default function ProjectQuadrant({ tasks }) {
  const cells = [
    { label: "To Do", value: tasks.filter((t) => t.quadrant === 1).length },
    { label: "In Progress", value: tasks.filter((t) => t.quadrant === 2).length },
    { label: "Review", value: tasks.filter((t) => t.quadrant === 3).length },
    { label: "Done", value: tasks.filter((t) => t.quadrant === 4).length },
  ];

  return (
    <div className="grid grid-cols-2 gap-1 text-center">
      {cells.map((c) => (
        <div key={c.label} className="bg-muted rounded p-1.5">
          <div className="text-sm font-semibold">{c.value}</div>
          <div className="text-[10px] text-muted-foreground">{c.label}</div>
        </div>
      ))}
    </div>
  );
}