import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useArchivedProjects, useRestoreProject } from "@/hooks/useProjects";

// Archive shell: ISO-8601 date range filter hitting the archivedProjects function
// (which strictly omits nested tasks), plus a Restore action that hydrates a
// project back into the active dashboard.
export default function ArchiveView() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const startIso = startDate ? new Date(startDate).toISOString() : undefined;
  const endIso = endDate ? new Date(endDate).toISOString() : undefined;
  const { data, isLoading } = useArchivedProjects(startIso, endIso);
  const restoreProject = useRestoreProject();
  const archivedProjects = data?.projects || [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold mb-4">Archive</h1>

      <div className="flex items-end gap-4 mb-2">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Start date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm px-2 py-1.5 bg-card border border-border rounded" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">End date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-sm px-2 py-1.5 bg-card border border-border rounded" />
        </div>
      </div>
      {(startIso || endIso) && (
        <p className="text-xs text-muted-foreground mb-4">
          Filtering: {startIso || "…"} → {endIso || "…"}
        </p>
      )}

      <div className="space-y-3 mt-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading archive...</p>
        ) : archivedProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No archived items.</p>
        ) : (
          archivedProjects.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">Project · last updated {item.updated_date?.slice(0, 10)}</p>
              </div>
              <button
                onClick={() => restoreProject.mutate(item.id)}
                className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:opacity-80"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}