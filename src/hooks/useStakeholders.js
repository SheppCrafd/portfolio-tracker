import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useStakeholders() {
  return useQuery({ queryKey: ["stakeholders"], queryFn: () => base44.entities.Stakeholder.list() });
}