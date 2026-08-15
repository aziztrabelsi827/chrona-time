"use client";

import { useEffect, useRef, useState } from "react";
import { useTimeSync } from "@/hooks/useTimeSync";

interface UseNowOptions {
  /** Tick interval in milliseconds. */
  intervalMs?: number;
  /** When true, use requestAnimationFrame for sub-second precision. */
  highFrequency?: boolean;
}

/**
 * Returns the current **synchronized** timestamp, re-read on every tick.
 *
 * Each tick recomputes from `Date.now() + syncOffset` rather than incrementing a
 * stored value, so timer throttling, tab inactivity and even system-clock
 * changes can't accumulate drift. The tick is aligned to the interval boundary
 * so the seconds don't flicker (e.g. 41 → 41 → 42).
 *
 * The synchronization offset comes from {@link useTimeSync}; while it is 0 the
 * clock shows device time. Returns `null` during SSR and the first client paint
 * so components can render a stable placeholder (no hydration mismatch, no CLS).
 */
export function useNow({ intervalMs = 1000, highFrequency = false }: UseNowOptions = {}): number | null {
  const { offset } = useTimeSync();
  const [now, setNow] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const read = () => Date.now() + offset;

    if (highFrequency) {
      const loop = () => {
        setNow(read());
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } else {
      const tick = () => {
        setNow(read());
        const ms = Date.now();
        const delay = intervalMs - (ms % intervalMs);
        timeoutRef.current = setTimeout(tick, delay);
      };
      tick();
    }

    // Immediately correct when the tab becomes visible again (throttled timers
    // may have stalled while the page was hidden).
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(read());
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs, highFrequency, offset]);

  return now;
}
