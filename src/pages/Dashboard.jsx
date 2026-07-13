import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAreas } from "@/hooks/useAreas";
import { useProducts } from "@/hooks/useProducts";
import { useFilter } from "@/lib/FilterContext";
import AreaCard from "@/components/areas/AreaCard";
import AreaModal from "@/components/areas/AreaModal";
import CreateModal from "@/components/modals/CreateModal";

export default function Dashboard() {
  const { data: areas = [], isLoading: areasLoading } = useAreas();
  const { data: products = [] } = useProducts();
  const { excludedIds } = useFilter();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedArea, setExpandedArea] = useState(null);

  // Deep link: ?areaId={id} reopens the matching area on direct visit.
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
          {visibleAreas.map((area) => (
            <AreaCard
              key={area.id}
              area={area}
              productCount={products.filter((p) => p.parent_area_id === area.id).length}
              onExpand={() => handleExpand(area)}
              stakeholderIds={products.filter((p) => p.parent_area_id === area.id).flatMap((p) => p.stakeholder_ids || [])}
            />
          ))}
        </div>
      )}
      <CreateModal />
      {expandedArea && (
        <AreaModal area={expandedArea} onClose={handleClose} />
      )}
    </div>
  );
}