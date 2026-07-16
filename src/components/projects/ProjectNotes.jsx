const TYPE_ICON = { RISK: "⚠️", QUESTION: "❓", NOTE: "📝" };

// Renders risks (⚠️), questions (❓), and general notes (📝) attached to a
// project, fetched from ProjectNote records.
export default function ProjectNotes({ notes, allStakeholders = [] }) {
  if (!notes?.length) return null;

  return (
    <ul className="space-y-2 mt-2">
      {notes.map((note) => {
        const stakeholderNames = (note.stakeholder_ids || [])
          .map((id) => allStakeholders.find((s) => s.id === id)?.name)
          .filter(Boolean);

        return (
          <li key={note.id} className="text-xs flex flex-col gap-1">
            <div className="flex items-start gap-1.5">
              <span aria-hidden="true">{TYPE_ICON[note.type] || "📝"}</span>
              <span className="text-muted-foreground">
                {note.content}
                {note.reporter && <span className="font-medium text-foreground"> — Reported by {note.reporter}</span>}
              </span>
            </div>
            {(stakeholderNames.length > 0 || note.created_date) && (
              <div className="pl-5 flex items-center gap-2 text-[10px] text-muted-foreground/80">
                {note.created_date && <span>{new Date(note.created_date).toLocaleString()}</span>}
                {note.created_date && stakeholderNames.length > 0 && <span>•</span>}
                {stakeholderNames.length > 0 && <span>Stakeholders: {stakeholderNames.join(", ")}</span>}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
