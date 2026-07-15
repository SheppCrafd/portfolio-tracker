import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useProjectNotes(projectId) {
  return useQuery({
    queryKey: ["projectNotes", projectId],
    queryFn: () => base44.entities.ProjectNote.filter({ project_id: projectId }),
    enabled: !!projectId,
  });
}

export function useAllProjectNotes() {
  return useQuery({ queryKey: ["allProjectNotes"], queryFn: () => base44.entities.ProjectNote.list() });
}

export function useCreateProjectNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.ProjectNote.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projectNotes", variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ["allProjectNotes"] });
    },
  });
}

export function useUpdateProjectNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectNote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectNotes"] });
      queryClient.invalidateQueries({ queryKey: ["allProjectNotes"] });
    },
  });
}

export function useDeleteProjectNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => base44.entities.ProjectNote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectNotes"] });
      queryClient.invalidateQueries({ queryKey: ["allProjectNotes"] });
    },
  });
}