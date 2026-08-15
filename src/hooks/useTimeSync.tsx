"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type SyncStatus = "syncing" | "synced" | "local";

export interface TimeSyncState {
  /**
   * Clock offset in ms: `trustedNow ≈ Date.now() + offset`.
   * Add this to the device clock to get the synchronized time.
   */
  offset: number;
  status: SyncStatus;
  /** Device timestamp of the last successful synchronization. */
  lastSyncAt: number | null;
  /** Last measured network round-trip time, in ms. */
  rtt: number | null;
  resync: () => void;
}

const TimeSyncContext = createContext<TimeSyncState>({
  offset: 0,
  status: "local",
  lastSyncAt: null,
  rtt: null,
  resync: () => {},
});

export function useTimeSync(): TimeSyncState {
  return useContext(TimeSyncContext);
}

const RESYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_PLAUSIBLE_OFFSET = 24 * 60 * 60 * 1000; // reject offsets > 1 day

/**
 * Estimates and maintains the offset between the device clock and trusted
 * server time. Strategy:
 *
 *   t0 = device time at request send
 *   t1 = device time at response receive   (round-trip = t1 - t0)
 *   serverTimestamp was generated during the round trip.
 *
 * We assume the server timestamp corresponds to the network midpoint, so the
 * trusted time at t1 is `serverTimestamp + roundTrip/2`, giving
 * `offset = trustedNow - t1`.
 *
 * On failure (offline / error / implausible result) the previously measured
 * offset is retained so the clock keeps running smoothly; only when we have
 * never synchronized do we fall back to raw device time. It resynchronizes
 * periodically and whenever the tab becomes visible again (covers sleep/wake).
 */
export function TimeSyncProvider({ children }: { children: ReactNode }) {
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState<SyncStatus>("local");
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [rtt, setRtt] = useState<number | null>(null);

  const hasSyncedRef = useRef(false);
  const mountedRef = useRef(true);

  const sync = useCallback(async () => {
    const t0 = Date.now();
    let res: Response;
    try {
      res = await fetch("/api/time", { cache: "no-store" });
    } catch {
      if (mountedRef.current) setStatus(hasSyncedRef.current ? "synced" : "local");
      return;
    }
    const t1 = Date.now();
    const roundTrip = t1 - t0;

    try {
      if (!res.ok) throw new Error("bad status");
      const data = (await res.json()) as { timestamp?: unknown };
      const server = Number(data?.timestamp);
      if (!Number.isFinite(server)) throw new Error("bad payload");

      const trustedNowAtReceive = server + roundTrip / 2;
      const newOffset = trustedNowAtReceive - t1;

      if (!mountedRef.current) return;
      // Reject implausible offsets (misconfigured clock / corrupt data).
      if (Math.abs(newOffset) > MAX_PLAUSIBLE_OFFSET) {
        setStatus("local");
        return;
      }

      setOffset(newOffset);
      setRtt(roundTrip);
      setLastSyncAt(t1);
      hasSyncedRef.current = true;
      setStatus("synced");
    } catch {
      if (mountedRef.current) setStatus(hasSyncedRef.current ? "synced" : "local");
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setStatus("syncing");
    sync();
    const interval = window.setInterval(sync, RESYNC_INTERVAL);
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    const onOnline = () => sync();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      mountedRef.current = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, [sync]);

  return (
    <TimeSyncContext.Provider value={{ offset, status, lastSyncAt, rtt, resync: sync }}>
      {children}
    </TimeSyncContext.Provider>
  );
}
