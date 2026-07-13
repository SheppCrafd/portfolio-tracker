import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCreateProject } from "@/hooks/useProjects";

export default function ProjectForm({ onDone }) {
  const [title, setTitle] = useState("");
  const [productId, setProductId] = useState("");
  const { data: products = [] } = useProducts();
  const createProject = useCreateProject();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !productId) return;
    createProject.mutate({ parent_product_id: productId, title, is_archived: false });
    onDone?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Product</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full text-sm px-3 py-2 bg-background border border-input rounded-md"
        >
          <option value="">Select a product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Project title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Redesign checkout" autoFocus />
      </div>
      <Button type="submit" className="w-full" disabled={!productId || !title.trim()}>Create Project</Button>
    </form>
  );
}