import { createPortal } from "react-dom";

// Generic portal utility — mounts children at the root of document.body,
// used for full-screen modals and dropdowns that must escape clipped containers.
export default function Portal({ children }) {
  return createPortal(children, document.body);
}