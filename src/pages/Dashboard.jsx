import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAreas } from "@/hooks/useAreas";
import { useProducts } from "@/hooks/useProducts";
import { useProjects } from "@/hooks/useProjects";
import { useFilter } from "@/lib/FilterContext";
import AreaCard from "@/components/areas/AreaCard";
import AreaModal from "@/components/areas/AreaModal";
import CreateModal from "@/components/modals/CreateModal";
import ProductConnectionLines from "@/components/products/ProductConnectionLines";
import QueryError from "@/components/shared/QueryError";

export default function Dashboard() {
  const { data: areas = [], isLoading: areasLoading, isError: areasError, error: areasErrorObj, refetch: refetchAreas } = useAreas();
  const { data: products = [], isError: productsError, error: productsErrorObj, refetch: refetchProducts } = useProducts();
  const { data: projects = [], isError: projectsError, error: projectsErrorObj, refetch: refetchProjects } = useProjects();
  const { excludedIds } = useFilter();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedArea, setExpandedArea] = useState(null);

  useEffect(() => {
    const areaId = searchParams.get("areaId");
    if (areaId && areas.length && !expandedArea) {
      const match = areas.find((a) => a.id === areaId);
      if (match) setExpandedArea(match);
    }
  }, [searchParams, areas, expandedArea]);

  const handleExpand = (area) => {
    setExpandedArea(area);
    setSearchParams({ areaId: area.id });
  };

  const handleClose = () => {
    setExpandedArea(null);
    searchParams.delete("areaId");
    setSearchParams(searchParams);
  };

  if (areasLoading) {
    return <div className="text-sm text-muted-foreground">Loading areas...</div>;
  }

  if (areasError || productsError || projectsError) {
    const firstError = areasErrorObj || productsErrorObj || projectsErrorObj;
    const retry = () => {
      if (areasError) refetchAreas();
      if (productsError) refetchProducts();
      if (projectsError) refetchProjects();
    };
    return <QueryError error={firstError} onRetry={retry} label="Couldn't load the dashboard." />;
  }

  const visibleAreas = areas.filter((a) => !excludedIds.includes(a.id));

  return (
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

            // Areas have no stakeholder_ids of their own, so an Area's
            // highlight state is entirely inherited from its subtree. This
            // must include every level underneath it — not just direct
            // products — or a stakeholder assigned to a nested project (or
            // an orphan project with no product parent) would dim the Area
            // card while the very card containing them stays undimmed.
            const areaStakeholderIds = [
              ...areaProducts.flatMap((p) => p.stakeholder_ids || []),
              ...productsWithProjects.flatMap((p) => p.projects.flatMap((proj) => proj.stakeholder_ids || [])),
              ...orphanProjects.flatMap((p) => p.stakeholder_ids || []),
            ];

            return (
              <AreaCard
                key={area.id}
                area={area}
                products={productsWithProjects}
                orphanProjects={orphanProjects}
                onExpand={() => handleExpand(area)}
                stakeholderIds={areaStakeholderIds}
              />
            );
          })}
        </div>
      )}
      <CreateModal />
      {expandedArea && (
        <AreaModal area={expandedArea} onClose={handleClose} />
      )}
      <ProductConnectionLines projects={projects} />
    </div>
  );
}
