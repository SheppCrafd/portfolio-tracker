import { useState } from "react";
import { X } from "lucide-react";
import Portal from "@/lib/Portal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateStakeholder } from "@/hooks/useStakeholders";
import { base44 } from "@/api/base44Client";

export default function AddStakeholderModal({ onClose }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState(null);
  const createStakeholder = useCreateStakeholder();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !department.trim()) return;
    let avatar_url;
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      avatar_url = file_url;
    }
    createStakeholder.mutate({ name, department, avatar_url });
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-card rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">Add Stakeholder</h3>
            <button onClick={onClose}><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Department</label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs" />
            </div>
            <Button type="submit" className="w-full" disabled={!name.trim() || !department.trim()}>Add Stakeholder</Button>
          </form>
        </div>
      </div>
    </Portal>
  );
}