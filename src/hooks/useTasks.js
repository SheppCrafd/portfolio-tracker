import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useTasks(projectId) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const tasks = await base44.entities.Task.filter({ project_id: projectId });
      return tasks.filter((t) => !t.archived_at && !t.deleted_at);
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    if (!projectId) return;
    const unsubscribe = base44.entities.Task.subscribe((event) => {
      if (event.data?.project_id === projectId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      }
    });
    return unsubscribe;
  }, [projectId, queryClient]);

  return query;
}

export function useAllTasks() {
  return useQuery({
    queryKey: ["allTasks"],
    queryFn: async () => {
      const tasks = await base44.entities.Task.list();
      return tasks.filter((t) => !t.archived_at && !t.deleted_at);
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => base44.entities.Task.update(id, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => base44.entities.Task.update(id, { deleted_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });
}

export function useToggleTopThree() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => base44.functions.invoke("toggleTaskTopThree", { taskId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });
}