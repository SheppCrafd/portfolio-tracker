import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useStakeholders() {
  return useQuery({ queryKey: ["stakeholders"], queryFn: () => base44.entities.Stakeholder.list() });
}

export function useCreateStakeholder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.Stakeholder.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stakeholders"] }),
  });
}