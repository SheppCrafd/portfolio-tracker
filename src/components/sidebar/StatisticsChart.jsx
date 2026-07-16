import { useAllTasks } from "@/hooks/useTasks";
import { getStatusCounts } from "@/lib/taskUtils";

// Custom horizontal bar chart built with raw SVG <rect> elements — no charting library.
// Colors match the status legend: green=Done/Delegated-Done, blue=Delegated,
// yellow=In Progress, dark grey=Blocked, orange=Pending Feedback, red=On Hold,
// white+border=Not Started.
const FILL_STYLE = {
  DONE: { fill: "#86efac", stroke: null },
  DELEGATED: { fill: "#93c5fd", stroke: null },
  IN_PROGRESS: { fill: "#fde68a", stroke: null },
  BLOCKED: { fill: "#9ca3af", stroke: null },
  PENDING_FEEDBACK: { fill: "#fdba74", stroke: null },
  ON_HOLD: { fill: "#fca5a5", stroke: null },
  NOT_STARTED: { fill: "#ffffff", stroke: "#111827" },
};

export default function StatisticsChart() {
  const { data: tasks = [] } = useAllTasks();

  if (tasks.length === 0) {
    return <p className="text-xs text-muted-foreground">No task data available</p>;
  }

  const total = tasks.length || 1;
  const rows = getStatusCounts(tasks).map((bucket) => ({ ...bucket, ...FILL_STYLE[bucket.key] }));

  const chartWidth = 240;
  const rowHeight = 30;

  return (
    <svg width="100%" height={rows.length * rowHeight} viewBox={`0 0 ${chartWidth} ${rows.length * rowHeight}`}>
      {rows.map((r, idx) => (
        <g key={r.key} transform={`translate(0, ${idx * rowHeight})`}>
          <text x="0" y="10" fontSize="9" fill="hsl(var(--muted-foreground))">
            {r.label} · {r.count}
          </text>
          <rect
            x="0"
            y="14"
            width={Math.max((r.count / total) * chartWidth, r.count > 0 ? 4 : 0)}
            height="8"
            rx="3"
            style={{ fill: r.fill, stroke: r.stroke || "none", strokeWidth: r.stroke ? 1 : 0 }}
          />
        </g>
      ))}
    </svg>
  );
}
