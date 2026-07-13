import { useAllTasks } from "@/hooks/useTasks";

// Custom horizontal bar chart built with raw SVG <rect> elements — no charting library.
// Colors match the status legend: green=Done/Delegated-Done, blue=Delegated,
// yellow=In Progress, dark grey=Blocked, orange=Pending Feedback, red=On Hold,
// white+border=Not Started.
const STATUS_META = [
  { key: "DONE", label: "Done", match: (s) => s === "DONE" || s === "DELEGATED_DONE", fill: "#86efac", stroke: null },
  { key: "DELEGATED", label: "Delegated", match: (s) => s === "DELEGATED", fill: "#93c5fd", stroke: null },
  { key: "IN_PROGRESS", label: "In Progress", match: (s) => s === "IN_PROGRESS", fill: "#fde68a", stroke: null },
  { key: "BLOCKED", label: "Blocked", match: (s) => s === "BLOCKED", fill: "#9ca3af", stroke: null },
  { key: "PENDING_FEEDBACK", label: "Pending Feedback", match: (s) => s === "PENDING_FEEDBACK", fill: "#fdba74", stroke: null },
  { key: "ON_HOLD", label: "On Hold", match: (s) => s === "ON_HOLD", fill: "#fca5a5", stroke: null },
  { key: "NOT_STARTED", label: "Not Started", match: (s) => s === "NOT_STARTED", fill: "#ffffff", stroke: "#111827" },
];

export default function StatisticsChart() {
  const { data: tasks = [] } = useAllTasks();

  if (tasks.length === 0) {
    return <p className="text-xs text-muted-foreground">No task data available</p>;
  }

  const total = tasks.length || 1;
  const rows = STATUS_META.map((meta) => ({
    ...meta,
    count: tasks.filter((t) => meta.match(t.status)).length,
  }));

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