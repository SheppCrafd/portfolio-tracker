// Live 4-quadrant widget — unassigned tasks count toward Q4. A quadrant's count
// turns emerald/bold if any task inside it is marked as this week's focus.
export default function ProjectQuadrant({ tasks }) {
  const inQuadrant = (q) => tasks.filter((t) => (t.quadrant || 4) === q);
  const cells = [1, 2, 3, 4].map((q) => {
    const qTasks = inQuadrant(q);
    return { q, count: qTasks.length, focus: qTasks.some((t) => t.is_weekly_focus) };
  });

  return (
    <div className="grid grid-cols-2 gap-1 w-14 shrink-0">
      {cells.map((c) => (
        <div key={c.q} className="bg-muted rounded p-1.5 text-center">
          <div className={`text-sm ${c.focus ? "text-emerald-700 font-extrabold" : "font-semibold"}`}>{c.count}</div>
        </div>
      ))}
    </div>
  );
}