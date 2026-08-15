"use client";

import { useTimeSync } from "@/hooks/useTimeSync";
import { useNow } from "@/hooks/useClock";
import { cn } from "@/lib/cn";

function agoLabel(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

/**
 * Subtle accuracy indicator shown beside the main clock. Communicates whether
 * the displayed time is synchronized with the server or falling back to device
 * time — never alarming, never the visual focus.
 */
export function SyncStatus({ className }: { className?: string }) {
  const { status, lastSyncAt, offset } = useTimeSync();
  // Re-render every second so "Xs ago" stays fresh.
  const now = useNow({ intervalMs: 1000 });

  if (status === "syncing") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-[11px] text-faint", className)}>
        <Dot className="bg-faint animate-pulse" />
        Synchronizing…
      </span>
    );
  }

  if (status === "synced") {
    // `now` is trusted time; convert the device-time `lastSyncAt` to trusted
    // terms by adding the offset before comparing (no Date.now() in render).
    const ago = lastSyncAt && now !== null ? agoLabel(now - offset - lastSyncAt) : null;
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-[11px] text-faint", className)}>
        <Dot className="bg-emerald-500" />
        <span>Synchronized</span>
        {ago ? <span>· {ago}</span> : null}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] text-faint", className)}>
      <Dot className="bg-amber-500" />
      Using device time
    </span>
  );
}

function Dot({ className }: { className?: string }) {
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", className)} />;
}
