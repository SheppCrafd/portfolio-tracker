// Connection details for an external, git-backed Obsidian vault (a
// personal GitHub repo) that the Vaea assistant can read from and write
// to — the real analog of what a Claude Code + Obsidian vault setup does,
// brought into the app itself instead of living in a CLI. Local-only,
// same as aiPreferences.js: nothing here is a Vaea entity, and the token
// is sent to aiChatStream transiently, per-request, only when a vault
// tool actually needs it — never stored server-side. See
// ExternalVaultSection.jsx for the disclosure shown where this is set.
const STORAGE_KEY = "vaea_external_vault";

const DEFAULTS = {
  owner: "",
  repo: "",
  branch: "main",
  token: "",
};

export function loadVaultConnection() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveVaultConnection(connection) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULTS, ...connection }));
  } catch {
    // best-effort — the connection just won't survive a reload
  }
}

export function clearVaultConnection() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // best-effort
  }
}

export function isVaultConnected(connection) {
  return !!(connection?.owner && connection?.repo && connection?.token);
}
