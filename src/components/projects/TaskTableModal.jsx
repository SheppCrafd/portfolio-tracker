import { useState, useRef, useMemo, useEffect } from "react";
import { X, Star } from "lucide-react";
import Portal from "@/lib/Portal";
import { useTasks, useCreateTask, useUpdateTaskStatus, useToggleTopThree } from "@/hooks/useTasks";
import { useToast } from "@/components/ui/use-toast";
import StatusDropdown from "@/components/projects/StatusDropdown";

const MAX_ROWS = 20;

// Live task table — sortable headers, rapid-entry row backed by the createTask
// function, and a Top-3 toggle enforced server-side (max 3 per project).
export default function TaskTableModal({ project, onClose }) {
  const { data: tasks = [] } = useTasks(project.id);
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const toggleTopThree = useToggleTopThree();
  const { toast } = useToast();

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [newDescription, setNewDescription] = useState("");
  const newRowInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedTasks = useMemo(() => {
    if (!sortColumn) return tasks;
    const sorted = [...tasks].sort((a, b) => String(a[sortColumn]).localeCompare(String(b[sortColumn])));
    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [tasks, sortColumn, sortDirection]);

  const handleNewTaskKeyDown = (e) => {
    if (e.key === "Enter" && newDescription.trim()) {
      createTask.mutate({ project_id: project.id, description: newDescription });
      setNewDescription("");
      requestAnimationFrame(() => newRowInputRef.current?.focus());
    }
  };

  const handleToggleTopThree = (task) => {
    toggleTopThree.mutate(
      { id: task.id, project_id: project.id },
      {
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Can't add to Top 3",
            description: err?.response?.data?.error || "Only 3 top-three tasks are allowed per project.",
          });
        },
      }
    );
  };

  const SortHeader = ({ column, label }) => (
    <th className="p-3 font-medium cursor-pointer select-none" onClick={() => handleSort(column)}>
      {label}{sortColumn === column ? (sortDirection === "asc" ? " ▲" : " ▼") : ""}
    </th>
  );

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
        <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-heading font-semibold">{project.title}</h2>
            <button onClick={onClose}><X className="w-4 h-4" /></button>
          </div>
          <div className="overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-muted-foreground border-b border-border">
                  <SortHeader column="description" label="Description" />
                  <SortHeader column="status" label="Status" />
                  <th className="p-3 font-medium">Top 3</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.slice(0, MAX_ROWS).map((task) => (
                  <tr key={task.id} className="border-b border-border last:border-0">
                    <td className="p-3">{task.description}</td>
                    <td className="p-3">
                      <StatusDropdown
                        task={task}
                        onStatusChange={(status) => updateStatus.mutate({ id: task.id, status, project_id: project.id })}
                      />
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleToggleTopThree(task)} aria-label="Toggle top 3">
                        <Star className={`w-4 h-4 ${task.is_top_three ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="p-2" colSpan={3}>
                    <input
                      ref={newRowInputRef}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      onKeyDown={handleNewTaskKeyDown}
                      placeholder="Type a task and press Enter..."
                      className="w-full text-sm px-2 py-1.5 bg-transparent border border-dashed border-border rounded outline-none"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Portal>
  );
}