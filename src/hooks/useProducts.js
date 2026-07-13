import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useProducts() {
  return useQuery({ queryKey: ["products"], queryFn: () => base44.entities.Product.list() });
}