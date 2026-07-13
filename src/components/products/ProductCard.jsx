import { useDroppable } from "@dnd-kit/core";
import { useHighlight } from "@/lib/HighlightContext";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useProjects } from "@/hooks/useProjects";
import { useAllTasks } from "@/hooks/useTasks";
import AvatarStack from "@/components/products/AvatarStack";
import ConnectionLines from "@/components/products/ConnectionLines";
import ProjectCard from "@/components/projects/ProjectCard";

export default function ProductCard({ product }) {
  const { data: allStakeholders = [] } = useStakeholders();
  const { data: allProjects = [] } = useProjects();
  const { data: allTasks = [] } = useAllTasks();

  const stakeholders = allStakeholders.filter((st) => product.stakeholder_ids?.includes(st.id));
  const projects = allProjects.filter((p) => p.parent_product_id === product.id);
  const { setNodeRef, isOver } = useDroppable({ id: product.id });
  const { highlightedIds } = useHighlight();
  const isDimmed = highlightedIds.length > 0 && !(product.stakeholder_ids || []).some((id) => highlightedIds.includes(id));

  const projectIds = projects.map((p) => p.id);
  const productTasks = allTasks.filter((t) => projectIds.includes(t.project_id));
  const doneCount = productTasks.filter((t) => t.status === "done").length;
  const completionPct = productTasks.length ? Math.round((doneCount / productTasks.length) * 100) : 0;

  return (
    <div className={`relative bg-card border border-border rounded-xl p-4 overflow-hidden ${isDimmed ? "opacity-30" : ""}`}>
      <ConnectionLines />
      <div className="relative flex items-center justify-between" style={{ zIndex: 1 }}>
        <h3 className="font-heading font-semibold">{product.title}</h3>
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
    </div>
  );
}