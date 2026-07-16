import { AlertTriangle } from "lucide-react";

// Shared "this fetch failed" state — every primary data-loading view had a
// loading state but nothing for a failed query, which silently rendered
// nothing (or stale/empty data) instead of telling the user anything went
// wrong.
export default function QueryError({ error, onRetry, label = "Couldn't load this data." }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-sm">
      <AlertTriangle className="w-5 h-5 text-destructive" />
      <p className="text-destructive font-medium">{label}</p>
      {error?.message && <p className="text-xs text-muted-foreground max-w-md">{error.message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:opacity-80"
        >
          Retry
        </button>
      )}
    </div>
  );
}
