import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useCreateTask } from "@/hooks/useTasks";

export default function TaskForm({ onDone }) {
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || !projectId) return;
    createTask.mutate({ project_id: projectId, description });
    onDone?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Project</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full text-sm px-3 py-2 bg-background border border-input rounded-md"
        >
          <option value="">Select a project...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Task description</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Write API docs" autoFocus />
      </div>
      <Button type="submit" className="w-full" disabled={!projectId || !description.trim()}>Add Task</Button>
    </form>
  );
}