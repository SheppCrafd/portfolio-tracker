// The AI chat assistant's identity — the in-app analog of a personal
// user.md/soul.md/identity.md set, minus any external vault/CLI/git: a real
// user can write this by hand in Settings, or have the assistant interview
// them for it via the "/setup" chat command (see SET_AI_IDENTITY in
// base44/functions/aiChatStream/entry.ts), same as either path being
// available for the original three-file version. Sent as part of every
// chat message's context in useChatController.js.
const STORAGE_KEY = "vaea_ai_identity";

const DEFAULTS = {
  name: "",
  identity: "",
  soul: "",
  userProfile: "",
};

export function loadAiIdentity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveAiIdentity(identity) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULTS, ...identity }));
  } catch {
    // best-effort — the identity just won't survive a reload
  }
}
