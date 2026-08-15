"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Minimal Fullscreen API hook with an overlay fallback for browsers that do
 * not support (or block) native fullscreen. Returns a ref to attach to the
 * element that should fill the screen, plus the current state and toggles.
 */
export function useFullscreen() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const enter = useCallback(() => {
    const el = ref.current;
    if (el && typeof document !== "undefined" && document.fullscreenEnabled) {
      el.requestFullscreen?.().then(
        () => setActive(true),
        () => setActive(true) // blocked → still show overlay fallback
      );
    } else {
      setActive(true); // native fullscreen unavailable → overlay fallback
    }
  }, []);

  const exit = useCallback(() => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setActive(false);
  }, []);

  const toggle = useCallback(() => {
    if (typeof document !== "undefined" && document.fullscreenElement) exit();
    else if (active) exit();
    else enter();
  }, [active, enter, exit]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onChange = () => setActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return { ref, active, enter, exit, toggle };
}
