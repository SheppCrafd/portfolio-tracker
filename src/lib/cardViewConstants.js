// Shared between src/lib/CardViewContext.jsx (the React provider) and
// src/lib/chatActions.js (a plain, React-free module — the AI chat's
// SET_CARD_VIEW action needs to change this same state from outside any
// component tree). Kept in their own module so chatActions.js doesn't have
// to import a .jsx file just for two string constants.
export const CARD_VIEW_STORAGE_KEY = "vaea_card_view";
export const CARD_VIEW_CHANGE_EVENT = "vaea:cardview-change";
