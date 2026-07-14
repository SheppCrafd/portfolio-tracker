// Renders risks (⚠️) and questions (❓) attached to a project, fetched from ProjectNote records.
export default function ProjectNotes({ notes }) {
  if (!notes?.length) return null;

  return (
    <ul className="space-y-2 mt-2">
      {notes.map((note) => (
        <li key={note.id} className="text-xs flex flex-col gap-1">
          <div className="flex items-start gap-1.5">
            <span aria-hidden="true">{note.type === "RISK" ? "⚠️" : "❓"}</span>
            <span className="text-muted-foreground">
              {note.content}
              {note.reporter && <span className="font-medium text-foreground"> — Reported by {note.reporter}</span>}
            </span>
          </div>
          {/* NEW: Stakeholder mapping & Datetime tracking */}
          {(note.stakeholders?.length > 0 || note.created_at) && (
            <div className="pl-5 flex items-center gap-2 text-[10px] text-muted-foreground/80">
              {note.created_at && <span>{new Date(note.created_at).toLocaleString()}</span>}
              {note.created_at && note.stakeholders?.length > 0 && <span>•</span>}
              {note.stakeholders?.length > 0 && (
                <span>Stakeholders: {note.stakeholders.map(s => s.name || s).join(', ')}</span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
