import { useState, useCallback, useRef, useEffect } from "react";

const STORAGE_KEY = "vaea_chat_geometry";
const MIN_WIDTH = 280;
const MIN_HEIGHT = 260;

function defaultGeometry() {
  const width = 384;
  // Roughly the same "lower fifth of the page, clamped" sizing the panel
  // used before it became user-resizable — only matters for a first-ever
  // open, since any real drag/resize immediately overrides and persists.
  const height = Math.min(480, Math.max(320, Math.round(window.innerHeight * 0.2)));
  return {
    width,
    height,
    x: window.innerWidth - width - 24,
    y: window.innerHeight - height - 24,
  };
}

// Keeps the panel fully on screen even if the saved geometry no longer fits
// (browser window shrunk, switched to a smaller monitor, etc. since the
// last session) — shrinks it to fit before repositioning, rather than just
// leaving a sliver grabbable off-edge.
function clampToViewport(geometry) {
  const width = Math.min(geometry.width, window.innerWidth);
  const height = Math.min(geometry.height, window.innerHeight);
  const x = Math.min(Math.max(geometry.x, 0), window.innerWidth - width);
  const y = Math.min(Math.max(geometry.y, 0), window.innerHeight - height);
  return { ...geometry, x, y, width, height };
}

// In an embedded context (e.g. the base44 editor's own preview iframe) the
// frame's layout can still be settling at the exact instant this module's
// very first render runs, so window.innerWidth/innerHeight can briefly read
// back as ~0 rather than the frame's real size. Clamping against that isn't
// "fitting a too-small screen," it's corrupting a perfectly good saved
// position into a 0x0 box — invisible, but still "open" (so the launcher
// button is gone with nothing replacing it). Anything smaller than the
// panel's own resize floor isn't a real viewport, so treat it as unsettled
// rather than authoritative.
function hasSaneViewport() {
  return window.innerWidth >= MIN_WIDTH && window.innerHeight >= MIN_HEIGHT;
}

function loadGeometry() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.x === "number" && typeof saved.width === "number") {
      // Trust the saved geometry as-is when the viewport looks unsettled —
      // the resize listener (and the one-time settle check below) will
      // re-clamp it once the real size is known, instead of clobbering it now.
      return hasSaneViewport() ? clampToViewport(saved) : saved;
    }
  } catch {
    // fall through to default
  }
  return defaultGeometry();
}

// Drag-to-reposition (via the panel's header) and drag-the-edges-to-resize
// for the floating chat panel, almost like a real desktop window — position
// and size are tracked in pixels (not Tailwind classes, since free-form
// window geometry isn't expressible as a fixed utility class) and persisted
// to localStorage so they survive across sessions.
export function useWindowGeometry() {
  const [geometry, setGeometry] = useState(loadGeometry);
  const dragRef = useRef(null);

  useEffect(() => {
    // One-time correction for the unsettled-viewport case loadGeometry()
    // guards against above: re-clamp once the browser has actually finished
    // laying out the frame (a frame after mount is enough in practice), so a
    // load that landed mid-settle still ends up fully on screen rather than
    // just trusting the raw saved position forever.
    const id = requestAnimationFrame(() => {
      if (hasSaneViewport()) setGeometry((current) => clampToViewport(current));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    // Clamped in real time (not just at drag-end) so the panel can never be
    // dragged or resized fully off-screen even mid-gesture — it just stops
    // at the edge instead of continuing to follow the cursor past it.
    const handleMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (drag.mode === "move") {
        setGeometry(clampToViewport({ ...drag.start, x: drag.start.x + dx, y: drag.start.y + dy }));
        return;
      }

      let { x, y, width, height } = drag.start;
      if (drag.edges.includes("e")) width = Math.max(MIN_WIDTH, drag.start.width + dx);
      if (drag.edges.includes("s")) height = Math.max(MIN_HEIGHT, drag.start.height + dy);
      if (drag.edges.includes("w")) {
        width = Math.max(MIN_WIDTH, drag.start.width - dx);
        x = drag.start.x + (drag.start.width - width);
      }
      if (drag.edges.includes("n")) {
        height = Math.max(MIN_HEIGHT, drag.start.height - dy);
        y = drag.start.y + (drag.start.height - height);
      }
      setGeometry(clampToViewport({ x, y, width, height }));
    };

    const handleUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setGeometry((current) => {
        const clamped = clampToViewport(current);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
        } catch {
          // best-effort — the position just won't survive a reload
        }
        return clamped;
      });
    };

    // Re-clamp on viewport resize too, not just after a drag — otherwise
    // shrinking the browser window (or rotating/resizing on a smaller
    // screen) can leave an already-open panel stranded off-screen with no
    // drag having happened yet.
    const handleWindowResize = () => setGeometry((current) => clampToViewport(current));

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  // Callers should only invoke this from a mousedown on the header's own
  // background (e.g. guard with `e.target === e.currentTarget`), not from
  // one of the header's buttons, or clicking those would also nudge the
  // panel by a few pixels.
  const startMove = useCallback((e) => {
    e.preventDefault();
    dragRef.current = { mode: "move", startX: e.clientX, startY: e.clientY, start: geometry };
  }, [geometry]);

  const startResize = useCallback((edges) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { mode: "resize", edges, startX: e.clientX, startY: e.clientY, start: geometry };
  }, [geometry]);

  return { geometry, startMove, startResize };
}
