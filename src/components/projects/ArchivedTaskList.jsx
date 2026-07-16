import { RotateCcw } from "lucide-react";
import { useArchivedTasks, useUpdateTask } from "@/hooks/useTasks";

// Read-focused list of a project's archived tasks, with a one-click restore.
// Kept intentionally lighter than TaskTable — archived tasks are a
// secondary, occasionally-visited view, not the primary editing surface.
export default function ArchivedTaskList({ projectId }) {
  const { data: tasks = [], isLoading } = useArchivedTasks(projectId);
  const updateTask = useUpdateTask();

  if (isLoading) return <p className="text-xs text-muted-foreground p-2">Loading archived tasks...</p>;
  if (tasks.length === 0) return <p className="text-xs text-muted-foreground p-2">No archived tasks.</p>;

  return (
    <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center justify-between gap-3 p-2 text-xs bg-card">
          <div className="min-w-0">
            <p className="truncate">{task.description}</p>
            <p className="text-[10px] text-muted-foreground">{task.status.replace(/_/g, " ")}</p>
          </div>
          <button
            onClick={() => updateTask.mutate({ id: task.id, data: { archived_at: null, project_id: projectId } })}
            className="shrink-0 flex items-center gap-1.5 text-[11px] px-2 py-1 bg-secondary text-secondary-foreground rounded-md hover:opacity-80"
          >
            <RotateCcw className="w-3 h-3" />
            Restore
          </button>
        </li>
      ))}
    </ul>
  );
}
