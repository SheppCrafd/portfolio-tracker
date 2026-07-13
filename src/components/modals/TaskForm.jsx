import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export default function TaskForm({ onDone }) {
  const [description, setDescription] = useState("");
  const addTask = useAppStore((s) => s.addTask);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    addTask({ id: `task-${Date.now()}`, projectId: null, description, status: "todo" });
    onDone?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Task description</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Write API docs" autoFocus />
      </div>
      <Button type="submit" className="w-full">Add Task</Button>
    </form>
  );
}