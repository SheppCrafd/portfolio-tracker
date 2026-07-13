import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useProducts() {
  return useQuery({ queryKey: ["products"], queryFn: () => base44.entities.Product.list() });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}