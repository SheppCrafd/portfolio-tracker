// Thin invisible strips along each edge (resize one dimension) plus small
// squares at each corner (resize two dimensions diagonally) — the standard
// "drag the edges of a window" affordance. Rendered as absolutely-positioned
// children of the panel, which is itself position:fixed (a valid containing
// block for absolute children regardless).
export default function ChatResizeHandles({ startResize }) {
  return (
    <>
      <div onMouseDown={startResize(["n"])} className="absolute top-0 left-2 right-2 h-1.5 cursor-ns-resize" />
      <div onMouseDown={startResize(["s"])} className="absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize" />
      <div onMouseDown={startResize(["w"])} className="absolute left-0 top-2 bottom-2 w-1.5 cursor-ew-resize" />
      <div onMouseDown={startResize(["e"])} className="absolute right-0 top-2 bottom-2 w-1.5 cursor-ew-resize" />
      <div onMouseDown={startResize(["n", "w"])} className="absolute top-0 left-0 w-2.5 h-2.5 cursor-nwse-resize" />
      <div onMouseDown={startResize(["n", "e"])} className="absolute top-0 right-0 w-2.5 h-2.5 cursor-nesw-resize" />
      <div onMouseDown={startResize(["s", "w"])} className="absolute bottom-0 left-0 w-2.5 h-2.5 cursor-nesw-resize" />
      <div onMouseDown={startResize(["s", "e"])} className="absolute bottom-0 right-0 w-2.5 h-2.5 cursor-nwse-resize" />
    </>
  );
}
