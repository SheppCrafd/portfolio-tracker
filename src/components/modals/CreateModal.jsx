import Portal from "@/lib/Portal";
import { X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import TaskForm from "@/components/modals/TaskForm";
import ProjectForm from "@/components/modals/ProjectForm";

// Polymorphic create modal — switches between TaskForm / ProjectForm based on createModalType.
export default function CreateModal() {
  const isOpen = useAppStore((s) => s.isCreateModalOpen);
  const type = useAppStore((s) => s.createModalType);
  const closeCreateModal = useAppStore((s) => s.closeCreateModal);
  const setType = useAppStore.setState;

  if (!isOpen) return null;

  const renderForm = () => {
    switch (type) {
      case "project":
        return <ProjectForm onDone={closeCreateModal} />;
      case "task":
      default:
        return <TaskForm onDone={closeCreateModal} />;
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={closeCreateModal}>
        <div
          className="bg-card rounded-xl shadow-xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                className={`text-sm px-3 py-1 rounded-full ${type === "task" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                onClick={() => setType({ createModalType: "task" })}
              >
                Task
              </button>
              <button
                className={`text-sm px-3 py-1 rounded-full ${type === "project" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                onClick={() => setType({ createModalType: "project" })}
              >
                Project
              </button>
            </div>
            <button onClick={closeCreateModal}>
              <X className="w-4 h-4" />
            </button>
          </div>
          {renderForm()}
        </div>
      </div>
    </Portal>
  );
}