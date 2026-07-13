import { useEffect } from "react";
import { X } from "lucide-react";
import { DndContext } from "@dnd-kit/core";
import Portal from "@/lib/Portal";
import { useProducts } from "@/hooks/useProducts";
import { useProjects, useMoveProject } from "@/hooks/useProjects";
import { useFilter } from "@/lib/FilterContext";
import ProductCard from "@/components/products/ProductCard";
import ProjectCard from "@/components/projects/ProjectCard";

export default function AreaModal({ area, onClose }) {
  const { data: allProducts = [] } = useProducts();
  const { data: allProjects = [] } = useProjects();
  const { excludedIds } = useFilter();
  const products = allProducts.filter((p) => p.parent_area_id === area.id && !excludedIds.includes(p.id));
  // Standalone projects: belong to this area directly, no parent product.
  const standaloneProjects = allProjects.filter(
    (p) => p.parent_area_id === area.id && !p.parent_product_id && !excludedIds.includes(p.id)
  );
  const moveProject = useMoveProject();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveProject.mutate({ id: active.id, parent_product_id: over.id });
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="font-heading text-xl font-semibold">{area.title}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        {products.length === 0 && standaloneProjects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm">No products or projects yet. Click "Create New" to add one to this area.</p>
          </div>
        ) : (
          <div className="p-6 grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}>
            <DndContext onDragEnd={handleDragEnd}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </DndContext>
            {standaloneProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </Portal>
  );
}