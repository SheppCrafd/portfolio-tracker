import { useState } from "react";
import { Expand, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import ProjectNotes from "@/components/projects/ProjectNotes";
import TaskTableModal from "@/components/projects/TaskTableModal";
import ProjectDetailModal from "@/components/projects/ProjectDetailModal";
import TaskStatistics from "@/components/shared/TaskStatistics";
import { useTasks } from "@/hooks/useTasks";
import { useProjectNotes } from "@/hooks/useProjectNotes";
import { useUpdateProject } from "@/hooks/useProjects";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useEditableField } from "@/hooks/useEditableField";
import { useHighlightDim } from "@/hooks/useHighlightDim";
import { filterActiveTasks, getQuadrantCounts, isTaskDone } from "@/lib/taskUtils";
import { getProjectOwner, getDueDateColorClass, formatDueDate } from "@/lib/projectUtils";

export default function ProjectCard({ project, stakeholderIds = [] }) {
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const cardStakeholderIds = project.stakeholder_ids || stakeholderIds || [];
  const isDimmed = useHighlightDim(cardStakeholderIds);

  const { data: tasks = [] } = useTasks(project.id);
  const { data: notes = [] } = useProjectNotes(project.id);
  const updateProject = useUpdateProject();

  const { value: title, handleInput: handleTitleInput } = useEditableField(
    project.title,
    (value) => updateProject.mutate({ id: project.id, data: { title: value } })
  );

  // Deliberately left as-is: writes to `project.risks`, which isn't a real
  // schema field. This overlaps with the ProjectNote-backed risks/questions
  // list rendered below and needs a real design decision, not a rename.
  const debouncedSaveRisks = useDebouncedCallback(
    (value) => updateProject.mutate({ id: project.id, data: { risks: value } }),
    500
  );

  const handleRisksInput = (e) => {
    debouncedSaveRisks(e.currentTarget.textContent);
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 10,
    opacity: isDragging ? 0.8 : 1,
  };

  const doneTasks = tasks.filter(isTaskDone);
  const projectProgress = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
  const quadrants = getQuadrantCounts(tasks);

  const activeTasks = filterActiveTasks(tasks);
  const allDone = activeTasks.length > 0 && activeTasks.every(isTaskDone);

  const dateColorClass = getDueDateColorClass(project, allDone);
  const formattedDate = formatDueDate(project);
  const owner = getProjectOwner(project) || "Unassigned";

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`relative bg-background border border-border rounded-lg p-3 transition-colors ${isDimmed ? "opacity-30" : ""} ${isDragging ? "shadow-2xl scale-105 border-primary" : "shadow-sm"}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 left-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 z-20"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <button
        onClick={() => setIsDetailOpen(true)}
        className="absolute top-2 right-2 z-20 text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors"
        aria-label="Expand project"
      >
        <Expand className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-5 pl-5">
        <button 
          onClick={() => setIsTableOpen(true)} 
          className="shrink-0 mt-1 grid grid-cols-2 gap-0.5 border border-border rounded overflow-hidden w-9 h-9 text-[10px] z-20 select-none"
          title="Open Task Table"
        >
          {quadrants.map((q) => (
            <div
              key={q.quadrant}
              className={`flex items-center justify-center transition-colors ${
                q.hasFocus ? "bg-green-800 text-white font-bold" : "bg-muted/40 text-muted-foreground"
              }`}
            >
              {q.count}
            </div>
          ))}
        </button>

        <div className="flex-1 text-center px-1 min-w-0 flex flex-col items-center">
          <h4 
            className="font-heading font-semibold text-sm break-words outline-none focus:ring-1 focus:ring-primary/40 rounded cursor-text w-full px-1"
            contentEditable
            suppressContentEditableWarning
            onInput={handleTitleInput}
          >
            {title}
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 break-words w-full px-1">
            {project.objective || "No objective defined"}
          </p>

          <div className="mt-2 w-full max-w-[95%] bg-destructive/5 border border-destructive/15 rounded px-2 py-0.5 z-20">
            <p className="text-[8px] font-bold text-destructive/60 uppercase tracking-wider text-left">Risks & Questions</p>
            <p
              className="text-[10px] text-muted-foreground text-left line-clamp-1 outline-none focus:ring-1 focus:ring-primary/40 rounded cursor-text px-0.5"
              contentEditable
              suppressContentEditableWarning
              onInput={handleRisksInput}
              placeholder="Add risks or open questions..."
            >
              {project.risks || ""}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 min-w-[75px] select-none mt-0.5">
          <p className="text-[10px] font-semibold text-muted-foreground truncate" title={owner}>
            {owner}
          </p>
          <p className={`text-[11px] mt-0.5 ${dateColorClass}`}>
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="pl-5 pr-1 mt-2">
        <TaskStatistics tasks={tasks} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2 px-1 ml-5">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Progress</span>
          <span className="text-xs font-bold text-primary">{projectProgress}%</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Tasks</span>
          <span className="text-xs font-semibold text-foreground">{doneTasks.length} <span className="text-muted-foreground font-normal">/ {tasks.length}</span></span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Notes</span>
          <span className="text-xs font-semibold text-foreground">{notes.length}</span>
        </div>
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