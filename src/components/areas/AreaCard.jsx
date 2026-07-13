// Basic Area card — full masonry layout, DND zones, and connection SVGs land in later steps.
export default function AreaCard({ area, productCount }) {
  return (
    <article className="bg-card border border-border rounded-xl p-5 break-inside-avoid">
      <h3 className="font-heading font-semibold text-lg">{area.name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{productCount} products</p>
    </article>
  );
}