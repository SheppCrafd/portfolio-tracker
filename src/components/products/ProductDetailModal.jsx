import { useEffect } from "react";
import { X } from "lucide-react";
import Portal from "@/lib/Portal";
import { useStakeholders } from "@/hooks/useStakeholders";

export default function ProductDetailModal({ product, onClose }) {
  const { data: allStakeholders = [] } = useStakeholders();
  const stakeholders = allStakeholders.filter((s) => (product.stakeholder_ids || []).includes(s.id));
  const departments = [...new Set(stakeholders.map((s) => s.department))];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <Portal>
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="font-heading text-xl font-semibold">{product.title}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 max-w-2xl mx-auto space-y-4">
          {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Stakeholders</p>
            {departments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stakeholders assigned.</p>
            ) : (
              departments.map((dept) => (
                <div key={dept} className="mb-2">
                  <p className="text-xs text-muted-foreground">{dept}</p>
                  <p className="text-sm">{stakeholders.filter((s) => s.department === dept).map((s) => s.name).join(", ")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}