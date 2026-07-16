import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { excludeSoftDeleted } from "@/lib/entityUtils";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const projects = await base44.entities.Project.list();
      return excludeSoftDeleted(projects).filter((p) => !p.is_archived);
    },
  });
}

// Fetches a single full Project record by id — used by the Archive view,
// which otherwise only has the lightweight { id, title, quadrant_counts }
// shape from the archivedProjects function and needs the full record to
// open ProjectDetailModal.
export function useProject(id) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => base44.entities.Project.get(id),
    enabled: !!id,
  });
}

export function useArchivedProjects(start, end) {
  return useQuery({
    queryKey: ["archivedProjects", start, end],
    queryFn: async () => {
      const res = await base44.functions.invoke("archivedProjects", { start, end });
      return res.data; // { projects: [...] }
    },
  });
}

export function useMoveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, parent_product_id }) => base44.entities.Project.update(id, { parent_product_id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => base44.functions.invoke("archiveProject", { projectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["archivedProjects"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => base44.functions.invoke("deleteProject", { projectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["archivedProjects"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });
}

export function useRestoreProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => base44.functions.invoke("restoreProject", { projectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["archivedProjects"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });
}