import { create } from "zustand";
import {
  mockAreas,
  mockProducts,
  mockProjects,
  mockTasks,
  mockStakeholders,
  mockArchivedItems,
} from "@/lib/mockData";

// Lightweight in-memory store for the Phase 1 prototype.
// No backend calls — every mutation just updates local state.
export const useAppStore = create((set) => ({
  areas: mockAreas,
  products: mockProducts,
  projects: mockProjects,
  tasks: mockTasks,
  stakeholders: mockStakeholders,
  archivedItems: mockArchivedItems,

  isCreateModalOpen: false,
  createModalType: "task", // "task" | "project"
  openCreateModal: (type = "task") =>
    set({ isCreateModalOpen: true, createModalType: type }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  moveProjectToProduct: (projectId, targetProductId) =>
    set((state) => ({
      products: state.products.map((p) => ({
        ...p,
        projectIds: p.projectIds.filter((id) => id !== projectId),
      })).map((p) =>
        p.id === targetProductId ? { ...p, projectIds: [...p.projectIds, projectId] } : p
      ),
    })),

  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  // Mocks "hydration": removes the item from the archive array and pushes a
  // matching record back into the active projects/products arrays.
  restoreArchivedItem: (item) =>
    set((state) => {
      const archivedItems = state.archivedItems.filter((i) => i.id !== item.id);

      if (item.type === "project") {
        return {
          archivedItems,
          projects: [
            ...state.projects,
            { id: item.id, productId: item.productId, title: item.title, quadrant: item.quadrant, dueDate: item.dueDate, notes: item.notes, taskIds: item.taskIds },
          ],
          products: state.products.map((p) =>
            p.id === item.productId ? { ...p, projectIds: [...p.projectIds, item.id] } : p
          ),
        };
      }

      if (item.type === "product") {
        return {
          archivedItems,
          products: [
            ...state.products,
            { id: item.id, areaId: item.areaId, name: item.title, stakeholderIds: item.stakeholderIds, completionPct: item.completionPct, projectIds: item.projectIds },
          ],
        };
      }

      return { archivedItems };
    }),
}));