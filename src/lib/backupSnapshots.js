// A same-day rollback safety net for local data — the in-app analog of the
// git-branch backup taken before risky vault changes. Local data has no
// version control of its own, and the existing UNDO_LAST_ACTION only pops a
// single action from in-memory state (gone on reload) — nothing protected
// against a bad multi-step AI plan or a bad CSV bulk-import. This snapshots
// every collection to localStorage before either of those run, and lets a
// user restore one from Settings.
import { localDb } from "@/lib/localDb";

const COLLECTIONS = ["areas", "products", "projects", "tasks", "stakeholders", "departments", "projectNotes"];
const INDEX_KEY = "vaea_backups_index";
const SNAPSHOT_PREFIX = "vaea_backup_";
const MAX_SNAPSHOTS = 8;

function readIndex() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeIndex(index) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch {
    // best-effort — a failed index write just means this snapshot won't be listed
  }
}

// Snapshots every collection and prepends it to the index, newest first.
// Best-effort throughout: a failure here (storage quota, private browsing)
// must never block the AI action or CSV import it's protecting — losing the
// safety net is better than losing the ability to use the app.
export async function createSnapshot(label) {
  try {
    const entries = await Promise.all(COLLECTIONS.map(async (name) => [name, await localDb[name].list()]));
    const data = Object.fromEntries(entries);
    const counts = Object.fromEntries(entries.map(([name, items]) => [name, items.length]));
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const created_at = new Date().toISOString();

    localStorage.setItem(SNAPSHOT_PREFIX + id, JSON.stringify(data));

    const index = [{ id, label, created_at, counts }, ...readIndex()];
    const kept = index.slice(0, MAX_SNAPSHOTS);
    const dropped = index.slice(MAX_SNAPSHOTS);
    dropped.forEach((entry) => {
      try {
        localStorage.removeItem(SNAPSHOT_PREFIX + entry.id);
      } catch {
        // best-effort — an orphaned snapshot blob just sits unused
      }
    });
    writeIndex(kept);
    return id;
  } catch {
    return null;
  }
}

// Newest first — what Settings' backup list renders directly.
export function listSnapshots() {
  return readIndex();
}

// Restores every collection to exactly the state a snapshot captured. Takes
// a fresh "before restore" snapshot of the *current* state first, so
// restoring is itself undoable instead of a one-way door.
export async function restoreSnapshot(id) {
  const raw = localStorage.getItem(SNAPSHOT_PREFIX + id);
  if (!raw) throw new Error("Backup not found — it may have been pruned.");
  const data = JSON.parse(raw);

  await createSnapshot("Before restore (auto)");

  for (const name of COLLECTIONS) {
    await localDb[name].replaceAll(data[name] || []);
  }
}
