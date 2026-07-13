import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store";

// Archive shell: date range filter UI (display-only) plus a mocked list of
// archived Projects/Products with a Restore action that hydrates them back into the dashboard.
export default function ArchiveView() {
  const archivedItems = useAppStore((s) => s.archivedItems);
  const restoreArchivedItem = useAppStore((s) => s.restoreArchivedItem);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold mb-4">Archive</h1>

      <div className="flex items-end gap-4 mb-2">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Start date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm px-2 py-1.5 bg-card border border-border rounded" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">End date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-sm px-2 py-1.5 bg-card border border-border rounded" />
        </div>
      </div>
      {(startDate || endDate) && (
        <p className="text-xs text-muted-foreground mb-4">
          Filtering: {startDate ? new Date(startDate).toISOString() : "…"} → {endDate ? new Date(endDate).toISOString() : "…"}
        </p>
      )}

      <div className="space-y-3 mt-4">
        {archivedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No archived items.</p>
        ) : (
          archivedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.type} · archived {item.archivedDate}</p>
              </div>
              <button
                onClick={() => restoreArchivedItem(item)}
                className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:opacity-80"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}