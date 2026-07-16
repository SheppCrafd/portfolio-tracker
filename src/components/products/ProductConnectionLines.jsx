import { useEffect, useState, useCallback } from "react";

// Draws real connector lines from a Project card to each Product it's
// related to (project.related_product_ids), beyond the primary product it's
// nested in. Rendered once, fixed over the whole viewport, so lines can span
// cards that live in different parts of the dashboard.
//
// Card DOM nodes are found via data-project-card / data-product-card
// attributes (set on ProjectCard/ProductCard's root elements) rather than
// refs, since projects and their related products are rendered in
// completely separate component subtrees.
export default function ProductConnectionLines({ projects = [] }) {
  const [lines, setLines] = useState([]);

  const recompute = useCallback(() => {
    const next = [];

    for (const project of projects) {
      const relatedIds = (project.related_product_ids || []).filter(
        (id) => id !== project.parent_product_id
      );
      if (relatedIds.length === 0) continue;

      const projectEl = document.querySelector(`[data-project-card="${project.id}"]`);
      if (!projectEl) continue;
      const projectRect = projectEl.getBoundingClientRect();
      const from = { x: projectRect.left, y: projectRect.top + projectRect.height / 2 };

      for (const productId of relatedIds) {
        const productEl = document.querySelector(`[data-product-card="${productId}"]`);
        if (!productEl) continue;
        const productRect = productEl.getBoundingClientRect();
        const to = { x: productRect.right, y: productRect.top + 24 };
        next.push({ key: `${project.id}-${productId}`, from, to });
      }
    }

    setLines(next);
  }, [projects]);

  useEffect(() => {
    recompute();
    // Layout can still be settling (fonts, images) right after mount/data
    // change, so take one more pass on the next frame.
    const raf = requestAnimationFrame(recompute);

    window.addEventListener("resize", recompute);
    // Capture phase: scroll events don't bubble, but capture still sees
    // scrolling on any descendant (e.g. the dashboard's <main> panel).
    window.addEventListener("scroll", recompute, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute, true);
    };
  }, [recompute]);

  if (lines.length === 0) return null;

  return (
    <svg className="fixed inset-0 pointer-events-none z-[5]" width="100vw" height="100vh">
      {lines.map((line) => {
        const midX = (line.from.x + line.to.x) / 2;
        return (
          <path
            key={line.key}
            d={`M ${line.from.x} ${line.from.y} C ${midX} ${line.from.y}, ${midX} ${line.to.y}, ${line.to.x} ${line.to.y}`}
            stroke="hsl(var(--primary))"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            fill="none"
          />
        );
      })}
    </svg>
  );
}
