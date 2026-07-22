// One-time migration from the app's pre-rename localStorage key names
// (portfolio_tracker_*, from when this app was called Portfolio Tracker)
// to the current vaea_* names. Copies forward rather than moving — old keys
// are left in place, so this stays a safe no-op on every run after the
// first (new key already exists) rather than something that could lose
// data if it ever ran twice.
const KEY_RENAMES = [
  ["portfolio_tracker_accent_theme", "vaea_accent_theme"],
  ["portfolio_tracker_left_sidebar_open", "vaea_left_sidebar_open"],
  ["portfolio_tracker_right_sidebar_open", "vaea_right_sidebar_open"],
  ["portfolio_tracker_chat_icon", "vaea_chat_icon"],
  ["portfolio_tracker_chat_active_session", "vaea_chat_active_session"],
  ["portfolio_tracker_card_view", "vaea_card_view"],
  ["portfolio_tracker_chat_geometry", "vaea_chat_geometry"],
];

const DB_COLLECTIONS = ["areas", "products", "projects", "tasks", "stakeholders", "departments", "projectNotes"];
const OLD_DB_PREFIX = "portfolio_tracker_db_";
const NEW_DB_PREFIX = "vaea_db_";

function copyIfMissing(oldKey, newKey) {
  if (localStorage.getItem(newKey) === null && localStorage.getItem(oldKey) !== null) {
    localStorage.setItem(newKey, localStorage.getItem(oldKey));
  }
}

// Must run before anything reads a vaea_* key for the first time (localDb's
// per-collection reads, and every useState(loadX) initializer across the
// hooks/context in this list) — called synchronously at the top of
// main.jsx, before the app renders, so there's no ordering gap.
export function migrateLegacyStorageKeys() {
  try {
    KEY_RENAMES.forEach(([oldKey, newKey]) => copyIfMissing(oldKey, newKey));
    DB_COLLECTIONS.forEach((name) => copyIfMissing(OLD_DB_PREFIX + name, NEW_DB_PREFIX + name));
  } catch {
    // best-effort — private browsing/storage-disabled environments just skip migration
  }
}
