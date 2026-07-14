// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { useAreas } from "@/hooks/useAreas";
import { useProducts } from "@/hooks/useProducts";
import { useProjects, useUpdateProject } from "@/hooks/useProjects"; // <-- Added Update Hook
import { useFilter } from "@/lib/FilterContext";
import AreaCard from "@/components/areas/AreaCard";
import AreaModal from "@/components/areas/AreaModal";
import CreateModal from "@/components/modals/CreateModal";

export default function Dashboard() {
  const { data: areas = [], isLoading: areasLoading } = useAreas();
  const { data: products = [] } = useProducts();
  const { data: projects = [] } = useProjects();
  const updateProject = useUpdateProject(); // <-- Initialize the mutation
  const { excludedIds } = useFilter();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedArea, setExpandedArea] = useState(null);

  // ... (Keep your existing useEffect, handleExpand, and handleClose functions here)

  // THE MAGIC: What happens when you drop a project
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    // If you dropped it outside a valid drop zone, do nothing
    if (!over) return;

    const projectId = active.id;
    const newParentProductId = over.id; 

    // Find the project being moved to check if it actually changed locations
    const project = projects.find(p => p.id === projectId);
    if (project && project.parent_product_id !== newParentProductId) {
      updateProject.mutate({
        id: projectId,
        data: { parent_product_id: newParentProductId } // Move to new product
      });
    }
  };

  if (areasLoading) {
    return <div className="text-sm text-muted-foreground">Loading areas...</div>;
  }

  const visibleAreas = areas.filter((a) => !excludedIds.includes(a.id));

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div>
        <h1 className="font-heading text-2xl font-semibold mb-6">Areas of Responsibility</h1>
        {visibleAreas.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm">No areas found. Click "Create New" to add your first Area of Responsibility.</p>
          </div>
        ) : (
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))" }}
          >
            {visibleAreas.map((area) => {
              const areaProducts = products.filter((p) => p.parent_area_id === area.id);
              
              const productsWithProjects = areaProducts.map((product) => ({
                ...product,
                projects: projects.filter((proj) => proj.parent_product_id === product.id)
              }));

              const orphanProjects = projects.filter(
                (proj) => proj.parent_area_id === area.id && !proj.parent_product_id
              );

              return (
                <AreaCard
                  key={area.id}
                  area={area}
                  products={productsWithProjects}
                  orphanProjects={orphanProjects}
                  onExpand={() => handleExpand(area)}
                  productCount={areaProducts.length}
                  stakeholderIds={areaProducts.flatMap((p) => p.stakeholder_ids || [])}
                />
              );
            })}
          </div>
        )}
        <CreateModal />
        {expandedArea && (
          <AreaModal area={expandedArea} onClose={handleClose} />
        )}
      </div>
    </DndContext>
  );
}
