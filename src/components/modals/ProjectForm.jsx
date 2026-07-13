import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProjectForm({ onDone }) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Phase 1 prototype: creation is simulated, no persistence yet.
    onDone?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Project title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Redesign checkout" autoFocus />
      </div>
      <Button type="submit" className="w-full">Create Project</Button>
    </form>
  );
}