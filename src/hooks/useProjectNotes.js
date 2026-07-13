import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useProjectNotes(projectId) {
  return useQuery({
    queryKey: ["projectNotes", projectId],
    queryFn: () => base44.entities.ProjectNote.filter({ project_id: projectId }),
    enabled: !!projectId,
  });
}

// Used by the stakeholder relational metrics grid (aggregate note counts per stakeholder).
export function useAllProjectNotes() {
  return useQuery({ queryKey: ["allProjectNotes"], queryFn: () => base44.entities.ProjectNote.list() });
}