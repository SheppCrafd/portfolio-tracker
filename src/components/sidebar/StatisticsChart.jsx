import { useAllTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import TaskStatistics from "@/components/shared/TaskStatistics";

// Per spec: task status counts broken out "by project" — one compact
// stacked bar per project (reusing TaskStatistics, which already implements
// the spec's exact color legend) rather than a single all-tasks-combined bar.
export default function StatisticsChart() {
  const { data: tasks = [] } = useAllTasks();
  const { data: projects = [] } = useProjects();

  const rows = projects
    .map((project) => ({ project, tasks: tasks.filter((t) => t.project_id === project.id) }))
    .filter((row) => row.tasks.length > 0);

  if (rows.length === 0) {
    return <p className="text-xs text-muted-foreground">No task data available</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map(({ project, tasks: projectTasks }) => (
        <div key={project.id}>
          <p className="text-[11px] font-medium text-muted-foreground truncate">{project.title}</p>
          <TaskStatistics tasks={projectTasks} />
        </div>
      ))}
    </div>
  );
}
