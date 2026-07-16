import { useProjects, useUpdateProject } from "@/hooks/useProjects";
import { useProducts, useUpdateProduct } from "@/hooks/useProducts";
import { useAllTasks, useUpdateTask } from "@/hooks/useTasks";
import { useUpdateStakeholder } from "@/hooks/useStakeholders";

function withStakeholder(currentIds, stakeholderId) {
  const ids = currentIds || [];
  return ids.includes(stakeholderId) ? ids : [...ids, stakeholderId];
}

// Single onDragEnd for the whole app (lives in one DndContext at the
// AppShell root, since the stakeholder drag source in the left sidebar and
// its drop targets in the main dashboard need a shared ancestor). Dispatches
// on active/over `data.type` rather than raw ids, so draggable/droppable
// elements just need to tag themselves with { type, id, ... } and never
// have to know about each other.
export function useGlobalDragEnd() {
  const { data: projects = [] } = useProjects();
  const { data: products = [] } = useProducts();
  const { data: tasks = [] } = useAllTasks();
  const updateProject = useUpdateProject();
  const updateProduct = useUpdateProduct();
  const updateTask = useUpdateTask();
  const updateStakeholder = useUpdateStakeholder();

  return (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current || {};
    const overData = over.data.current || {};

    if (activeData.type === "stakeholder") {
      const stakeholderId = activeData.stakeholderId;

      if (overData.type === "project") {
        const project = projects.find((p) => p.id === overData.id);
        if (!project) return;
        updateProject.mutate({ id: project.id, data: { stakeholder_ids: withStakeholder(project.stakeholder_ids, stakeholderId) } });
      } else if (overData.type === "product") {
        const product = products.find((p) => p.id === overData.id);
        if (!product) return;
        updateProduct.mutate({ id: product.id, data: { stakeholder_ids: withStakeholder(product.stakeholder_ids, stakeholderId) } });
      } else if (overData.type === "task") {
        const task = tasks.find((t) => t.id === overData.id);
        if (!task) return;
        updateTask.mutate({
          id: task.id,
          data: { stakeholder_ids: withStakeholder(task.stakeholder_ids, stakeholderId), project_id: task.project_id },
        });
      } else if (overData.type === "department") {
        updateStakeholder.mutate({ id: stakeholderId, data: { department: overData.name || "" } });
      }
      return;
    }

    if (activeData.type === "project") {
      const project = projects.find((p) => p.id === activeData.id);
      if (!project) return;

      if (overData.type === "product") {
        const targetProduct = products.find((p) => p.id === overData.id);
        if (!targetProduct) return;
        if (project.parent_product_id !== targetProduct.id) {
          updateProject.mutate({
            id: project.id,
            data: { parent_product_id: targetProduct.id, parent_area_id: targetProduct.parent_area_id },
          });
        }
      } else if (overData.type === "area") {
        if (project.parent_product_id !== null || project.parent_area_id !== overData.id) {
          updateProject.mutate({
            id: project.id,
            data: { parent_product_id: null, parent_area_id: overData.id },
          });
        }
      }
    }
  };
}
