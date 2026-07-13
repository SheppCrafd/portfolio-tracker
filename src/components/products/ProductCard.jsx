import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Expand } from "lucide-react";
import { useHighlight } from "@/lib/HighlightContext";
import { useFilter } from "@/lib/FilterContext";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useProjects } from "@/hooks/useProjects";
import { useAllTasks } from "@/hooks/useTasks";
import AvatarStack from "@/components/products/AvatarStack";
import ConnectionLines from "@/components/products/ConnectionLines";
import ProjectCard from "@/components/projects/ProjectCard";
import ProductDetailModal from "@/components/products/ProductDetailModal";

export default function ProductCard({ product }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { data: allStakeholders = [] } = useStakeholders();
  const { data: allProjects = [] } = useProjects();
  const { data: allTasks = [] } = useAllTasks();
  const { excludedIds } = useFilter();

  const stakeholders = allStakeholders.filter((st) => product.stakeholder_ids?.includes(st.id));
  const projects = allProjects.filter((p) => p.parent_product_id === product.id && !excludedIds.includes(p.id));
  const { setNodeRef, isOver } = useDroppable({ id: product.id });
  const { highlightedIds } = useHighlight();
  const isDimmed = highlightedIds.length > 0 && !(product.stakeholder_ids || []).some((id) => highlightedIds.includes(id));

  const projectIds = projects.map((p) => p.id);
  const productTasks = allTasks.filter((t) => projectIds.includes(t.project_id));
  const doneCount = productTasks.filter((t) => t.status === "DONE" || t.status === "DELEGATED_DONE").length;
  const completionPct = productTasks.length ? Math.round((doneCount / productTasks.length) * 100) : 0;

  return (
    <div className={`relative bg-card border border-border rounded-xl p-4 overflow-hidden ${isDimmed ? "opacity-30" : ""}`}>
      <ConnectionLines />
      <button
        onClick={() => setIsDetailOpen(true)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        style={{ zIndex: 2 }}
        aria-label="Expand product"
      >
        <Expand className="w-4 h-4" />
      </button>
      <div className="relative" style={{ zIndex: 1 }}>
        <h3 className="font-heading font-semibold pr-6">{product.title}</h3>
        {product.description && <p className="text-xs text-muted-foreground mt-0.5">{product.description}</p>}
      </div>
      <div className="relative mt-2 flex justify-center" style={{ zIndex: 1 }}>
        <AvatarStack stakeholders={stakeholders} />
      </div>

      <div
        ref={setNodeRef}
        className={`relative mt-4 space-y-2 min-h-[80px] rounded-lg p-2 transition-colors ${isOver ? "bg-primary/10 ring-2 ring-primary/40" : "bg-transparent"}`}
        style={{ zIndex: 1 }}
      >
        {projects.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Drop a project here</p>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} stakeholderIds={product.stakeholder_ids} />
          ))
        )}
      </div>

      <p className="relative text-xs text-muted-foreground mt-3" style={{ zIndex: 1 }}>
        {completionPct}% complete
      </p>

      {isDetailOpen && <ProductDetailModal product={product} onClose={() => setIsDetailOpen(false)} />}
    </div>
  );
}