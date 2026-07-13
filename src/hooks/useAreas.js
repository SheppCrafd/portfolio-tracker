import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useAreas() {
  return useQuery({ queryKey: ["areas"], queryFn: () => base44.entities.Area.list() });
}

export function useUpdateArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => base44.entities.Area.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["areas"] }),
  });
}