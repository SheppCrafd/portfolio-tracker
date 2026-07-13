import { X } from "lucide-react";
import Portal from "@/lib/Portal";
import { useAreas } from "@/hooks/useAreas";
import { useProducts } from "@/hooks/useProducts";
import { useProjects } from "@/hooks/useProjects";
import { useFilter } from "@/lib/FilterContext";

// Master predicate filter: unchecking an item pushes its ID into the global
// exclusion array, causing downstream cards to unmount instantly.
export default function FilterModal({ onClose }) {
  const { data: areas = [] } = useAreas();
  const { data: products = [] } = useProducts();
  const { data: projects = [] } = useProjects();
  const { excludedIds, toggleExclude } = useFilter();

  const Section = ({ title, items }) => (
    <div className="mb-4">
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!excludedIds.includes(item.id)}
              onChange={() => toggleExclude(item.id)}
            />
            {item.title}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-card rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">Filter</h3>
            <button onClick={onClose}><X className="w-4 h-4" /></button>
          </div>
          <Section title="Areas" items={areas} />
          <Section title="Products" items={products} />
          <Section title="Projects" items={projects} />
        </div>
      </div>
    </Portal>
  );
}