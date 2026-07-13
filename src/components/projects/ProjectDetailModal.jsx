import { useEffect, useState } from "react";
import { X, Archive, RotateCcw } from "lucide-react";
import Portal from "@/lib/Portal";
import { useProjectNotes } from "@/hooks/useProjectNotes";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useArchiveProject, useRestoreProject, useUpdateProject } from "@/hooks/useProjects";
import TaskTable from "@/components/projects/TaskTable";

// Full-screen expanded project view: problem statement, metrics, activity,
// notes, stakeholders by department, archive/restore, and the full task table.
export default function ProjectDetailModal({ project, onClose }) {
  const { data: notes = [] } = useProjectNotes(project.id);
  const { data: allStakeholders = [] } = useStakeholders();
  const archiveProject = useArchiveProject();
  const restoreProject = useRestoreProject();
  const updateProject = useUpdateProject();
  const [objective, setObjective] = useState(project.objective || "");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const stakeholders = allStakeholders.filter((s) => (project.stakeholder_ids || []).includes(s.id));
  const departments = [...new Set(stakeholders.map((s) => s.department))];
  const metrics = project.metrics || {};

  const handleArchiveToggle = () => {
    if (project.is_archived) restoreProject.mutate(project.id);
    else archiveProject.mutate(project.id);
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="font-heading text-xl font-semibold">{project.title}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleArchiveToggle}
              className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md"
            >
              {project.is_archived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
              {project.is_archived ? "Restore Project" : "Archive Project"}
            </button>
            <button onClick={onClose}><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Objective</label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              onBlur={() => updateProject.mutate({ id: project.id, data: { objective } })}
              className="w-full text-sm bg-card border border-border rounded-md p-2"
              rows={2}
            />
          </div>

          {project.problem_statement && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Problem Statement</p>
              <p className="text-sm">{project.problem_statement}</p>
            </div>
          )}

          {project.activity && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Activity</p>
              <p className="text-sm">{project.activity}</p>
            </div>
          )}

          {(metrics.forecast || metrics.measured) && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Metrics</p>
              <div className="flex gap-6 text-sm">
                <span>Forecast: {metrics.forecast ?? "—"}</span>
                <span>Measured: {metrics.measured ?? "—"}</span>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Risks & Open Questions</p>
            <ul className="space-y-1">
              {notes.map((note) => (
                <li key={note.id} className="text-sm flex items-start gap-1.5">
                  <span>{note.type === "RISK" ? "⚠️" : "❓"}</span>
                  <span>{note.content}{note.reporter ? <span className="text-muted-foreground"> — {note.reporter}</span> : null}</span>
                </li>
              ))}
              {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Stakeholders</p>
            {departments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stakeholders assigned.</p>
            ) : (
              departments.map((dept) => (
                <div key={dept} className="mb-2">
                  <p className="text-xs text-muted-foreground">{dept}</p>
                  <p className="text-sm">{stakeholders.filter((s) => s.department === dept).map((s) => s.name).join(", ")}</p>
                </div>
              ))
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Tasks</p>
            <div className="border border-border rounded-lg overflow-x-auto">
              <TaskTable project={project} />
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}