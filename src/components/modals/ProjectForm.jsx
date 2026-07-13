import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAreas } from "@/hooks/useAreas";
import { useProducts } from "@/hooks/useProducts";
import { useCreateProject } from "@/hooks/useProjects";

export default function ProjectForm({ onDone }) {
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState("");
  const [productId, setProductId] = useState("");
  const { data: areas = [] } = useAreas();
  const { data: products = [] } = useProducts();
  const createProject = useCreateProject();

  const availableProducts = products.filter((p) => p.parent_area_id === areaId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !areaId) return;
    createProject.mutate({
      title,
      parent_area_id: areaId,
      parent_product_id: productId || null,
      is_archived: false,
    });
    onDone?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Area</label>
        <select
          value={areaId}
          onChange={(e) => { setAreaId(e.target.value); setProductId(""); }}
          className="w-full text-sm px-3 py-2 bg-background border border-input rounded-md"
        >
          <option value="">Select an area...</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Product (optional — leave blank for standalone)</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full text-sm px-3 py-2 bg-background border border-input rounded-md"
          disabled={!areaId}
        >
          <option value="">No product (standalone)</option>
          {availableProducts.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Project title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Admin Tasks" autoFocus />
      </div>
      <Button type="submit" className="w-full" disabled={!areaId || !title.trim()}>Create Project</Button>
    </form>
  );
}