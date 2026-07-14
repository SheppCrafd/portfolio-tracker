// src/components/projects/ProjectCard.jsx
import { useState, useEffect } from "react";
import { Expand, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import ProjectQuadrant from "@/components/projects/ProjectQuadrant";
import ProjectNotes from "@/components/projects/ProjectNotes";
import DueDateBadge from "@/components/projects/DueDateBadge";
import TaskTableModal from "@/components/projects/TaskTableModal";
import ProjectDetailModal from "@/components/projects/ProjectDetailModal";
import { useHighlight } from "@/lib/HighlightContext";
import { useTasks } from "@/hooks/useTasks";
import { useProjectNotes } from "@/hooks/useProjectNotes";
import { useUpdateProject } from "@/hooks/useProjects"; // <-- For inline editing
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

export default function ProjectCard({ project, stakeholderIds = [] }) {
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { highlightedIds } = useHighlight();
  const isDimmed = highlightedIds.length > 0 && !stakeholderIds.some((id) => highlightedIds.includes(id));
  const { data: tasks = [] } = useTasks(project.id);
  const { data: notes = [] } = useProjectNotes(project.id);
  const updateProject = useUpdateProject();

  const [title, setTitle] = useState(project.title);
  useEffect(() => setTitle(project.title), [project.title]);

  const debouncedSave = useDebouncedCallback(
    (value) => updateProject.mutate({ id: project.id, data: { title: value } }),
    500
  );

  const handleInput = (e) => {
    const value = e.currentTarget.textContent;
    setTitle(value);
    debouncedSave(value);
  };

  // DRAG AND DROP HOOK
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 10,
    opacity: isDragging ? 0.8 : 1,
  };

  const allDone = tasks.length > 0 && tasks.every((t) => t.status === "DONE" || t.status === "DELEGATED_DONE");

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`relative bg-background border border-border rounded-lg p-3 transition-colors ${isDimmed ? "opacity-30" : ""} ${isDragging ? "shadow-2xl scale-105 border-primary" : "shadow-sm"}`}
    >
      {/* Grab Handle for Dragging */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 left-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 z-20"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <button
        onClick={() => setIsDetailOpen(true)}
        className="absolute top-2 right-2 z-20 text-muted-foreground hover:text-foreground"
        aria-label="Expand project"
      >
        <Expand className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-5 pl-5">
        <button onClick={() => setIsTableOpen(true)} className="shrink-0 mt-1">
          <ProjectQuadrant tasks={tasks} />
        </button>

        <div className="flex-1 text-center px-1 min-w-0">
          {/* INLINE EDITING: Title */}
          <h4 
            className="font-heading font-semibold text-sm break-words outline-none focus:ring-1 focus:ring-primary/40 rounded cursor-text"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
          >
            {title}
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 break-words">{project.objective}</p>
        </div>

        <DueDateBadge project={project} allDone={allDone} />
      </div>

      <div className="mt-2 pl-5">
        <ProjectNotes notes={notes} />
      </div>

      {isTableOpen && (
        <TaskTableModal project={project} onClose={() => setIsTableOpen(false)} />
      )}
      {isDetailOpen && (
        <ProjectDetailModal project={project} onClose={() => setIsDetailOpen(false)} />
      )}
    </div>
  );
}
