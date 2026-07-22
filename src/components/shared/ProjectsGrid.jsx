import { useRef } from "react";
import { useCardView } from "@/lib/CardViewContext";
import { useShrinkWrapWidth } from "@/hooks/useShrinkWrapWidth";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectCardFull from "@/components/projects/ProjectCardFull";

// Projects lay out differently per card-view mode, same reasoning as the
// Areas/Products grids: Full Cards' project card is a real, editable card
// that benefits from growing to fill leftover space, so it's a CSS grid
// (auto-fit/minmax) here too — a 420px floor (its old fixed width) below
// which it won't shrink, growing via 1fr when there's room. Mini Cards'
// small square tile is deliberately fixed-size and only needs to cascade,
// so that mode keeps the JS-measured shrink-wrap hook (see its own comment
// for why plain CSS can't shrink-wrap a wrapping container by itself).
// Shared here rather than duplicated in ProductCard/AreaCard, since both
// need the exact same Full-vs-Mini branching.
export default function ProjectsGrid({ projects, stakeholderIds, emptyMessage, gap, className = "" }) {
  const { cardView } = useCardView();
  const shrinkRef = useRef(null);
  useShrinkWrapWidth(shrinkRef, { gap });

  if (projects.length === 0) {
    return emptyMessage ? (
      <p className={`w-full text-xs text-muted-foreground text-center py-4 ${className}`}>{emptyMessage}</p>
    ) : (
      <div className={className} />
    );
  }

  if (cardView === "full") {
    // key="full-grid" forces React to treat this as a distinct element from
    // the mini branch's div below, rather than reusing the same DOM node
    // (both are plain <div>s at the same tree position, which React would
    // otherwise update in place) — without it, the shrink-wrap hook's raw
    // `element.style.width` mutation from a prior Mini-mode render survives
    // the switch, since React's own style-prop diffing only ever
    // reconciles properties it set through that prop in the first place, not
    // ones mutated directly on the DOM node by other code.
    return (
      <div
        key="full-grid"
        className={className}
        style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(420px, 1fr))`, alignItems: "start", gap: `${gap}px` }}
      >
        {projects.map((project) => (
          <ProjectCardFull key={project.id} project={project} stakeholderIds={stakeholderIds} />
        ))}
      </div>
    );
  }

  return (
    <div key="mini-flex" ref={shrinkRef} className={`flex flex-wrap items-start ${className}`} style={{ gap: `${gap}px` }}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} stakeholderIds={stakeholderIds} />
      ))}
    </div>
  );
}
