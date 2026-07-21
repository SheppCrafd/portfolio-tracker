import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localDb } from "@/lib/localDb";
import { excludeSoftDeleted } from "@/lib/entityUtils";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const products = await localDb.products.list();
      return excludeSoftDeleted(products);
    },
    // Local-only data — see the matching comment in useAreas.js.
    staleTime: Infinity,
  });
}

export const createProduct = (data) => localDb.products.create(data);

export const updateProduct = ({ id, data }) => localDb.products.update(id, data);

// Soft delete: tags the product deleted_at, and cascades deleted_at to every
// child Project (and every Task under those projects). Exported as a plain
// function so the chat assistant's action executor shares this exact cascade
// logic with the UI's own mutation hook below.
export async function deleteProduct(id) {
  const now = new Date().toISOString();
  const product = await localDb.products.update(id, { deleted_at: now });

  const projects = await localDb.projects.filter({ parent_product_id: id });
  await localDb.projects.updateMany(
    projects.filter((p) => !p.deleted_at).map((p) => p.id),
    { deleted_at: now }
  );

  const tasksByProject = await Promise.all(projects.map((p) => localDb.tasks.filter({ project_id: p.id })));
  await localDb.tasks.updateMany(
    tasksByProject.flat().filter((t) => !t.deleted_at).map((t) => t.id),
    { deleted_at: now }
  );

  return product;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });
}
