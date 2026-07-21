import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localDb } from "@/lib/localDb";

export function useProjectNotes(projectId) {
  return useQuery({
    queryKey: ["projectNotes", projectId],
    queryFn: () => localDb.projectNotes.filter({ project_id: projectId }),
    enabled: !!projectId,
    // Local-only data — see the matching comment in useAreas.js.
    staleTime: Infinity,
  });
}

export function useAllProjectNotes() {
  return useQuery({
    queryKey: ["allProjectNotes"],
    queryFn: () => localDb.projectNotes.list(),
    // Local-only data — see the matching comment in useAreas.js.
    staleTime: Infinity,
  });
}

export const createProjectNote = (data) => localDb.projectNotes.create(data);

export const updateProjectNote = ({ id, data }) => localDb.projectNotes.update(id, data);

export const deleteProjectNote = (id) => localDb.projectNotes.delete(id);

export function useCreateProjectNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProjectNote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projectNotes", variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ["allProjectNotes"] });
    },
  });
}

export function useUpdateProjectNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProjectNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectNotes"] });
      queryClient.invalidateQueries({ queryKey: ["allProjectNotes"] });
    },
  });
}

export function useDeleteProjectNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProjectNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectNotes"] });
      queryClient.invalidateQueries({ queryKey: ["allProjectNotes"] });
    },
  });
}
