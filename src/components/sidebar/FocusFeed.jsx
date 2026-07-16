import { useAllTasks, useUpdateTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useHighlight } from "@/lib/HighlightContext";
import { isDimmedByHighlight } from "@/hooks/useHighlightDim";

const STATUS_OPTIONS = ["NOT_STARTED", "IN_PROGRESS", "DELEGATED", "PENDING_FEEDBACK", "ON_HOLD", "BLOCKED", "DONE", "DELEGATED_DONE"];

// Live feed: today's Top 3 first, then this week's focus items grouped by project.
export default function FocusFeed() {
  const { data: tasks = [] } = useAllTasks();
  const { data: projects = [] } = useProjects();
  const updateTask = useUpdateTask();
  const { highlightedIds } = useHighlight();

  const projectTitle = (id) => projects.find((p) => p.id === id)?.title || "Untitled";
  const topThree = tasks.filter((t) => t.is_today_top_three);
  const weeklyFocus = tasks.filter((t) => t.is_weekly_focus);

  const groupedWeekly = weeklyFocus.reduce((acc, t) => {
    acc[t.project_id] = acc[t.project_id] || [];
    acc[t.project_id].push(t);
    return acc;
  }, {});

  const isDimmed = (task) => isDimmedByHighlight(highlightedIds, task.stakeholder_ids || []);

  const renderRow = (task) => (
    <div key={task.id} className={`flex items-center justify-between gap-2 text-xs bg-muted rounded p-2 ${isDimmed(task) ? "opacity-30" : ""}`}>
      <span className="truncate">{task.description}</span>
      <select
        value={task.status}
        onChange={(e) => updateTask.mutate({ id: task.id, data: { status: e.target.value } })}
        className="text-[10px] bg-background border border-border rounded px-1 py-0.5 shrink-0"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading font-semibold text-sm mb-2">Today's Top 3</p>
        <div className="space-y-1.5">
          {topThree.length === 0 ? <p className="text-xs text-muted-foreground">None set</p> : topThree.map(renderRow)}
        </div>
      </div>
      <div>
        <p className="font-heading font-semibold text-sm mb-2">Weekly Focus</p>
        <div className="space-y-3">
          {Object.entries(groupedWeekly).map(([projectId, projectTasks]) => (
            <div key={projectId}>
              <p className="text-[11px] text-muted-foreground mb-1">{projectTitle(projectId)}</p>
              <div className="space-y-1.5">{projectTasks.map(renderRow)}</div>
            </div>
          ))}
          {weeklyFocus.length === 0 && <p className="text-xs text-muted-foreground">None set</p>}
        </div>
      </div>
    </div>
  );
}