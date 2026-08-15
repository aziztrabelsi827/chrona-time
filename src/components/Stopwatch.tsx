"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFullscreen } from "@/hooks/useFullscreen";
import { PlayIcon, PauseIcon, ResetIcon, FlagIcon, CloseIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type Status = "idle" | "running" | "stopped";
interface Lap {
  lapMs: number;
  totalMs: number;
}

function formatStopwatch(ms: number): { main: string; hundredths: string } {
  const total = Math.max(0, ms);
  const hundredths = String(Math.floor(total / 10) % 100).padStart(2, "0");
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / 60000) % 60;
  const hours = Math.floor(total / 3600000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const main = hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
  return { main, hundredths };
}

// Top-level (stable identity) so these subtrees are NOT remounted on every tick.
function StopwatchDigits({ main, hundredths, size }: { main: string; hundredths: string; size: string }) {
  return (
    <div className="tabular font-semibold leading-none tracking-tight text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
      <span className={size}>{main}</span>
      <span className={cn(size, "text-muted")}>.{hundredths}</span>
    </div>
  );
}

function StopwatchControls({
  status,
  onStart,
  onStop,
  onLap,
  onReset,
}: {
  status: Status;
  onStart: () => void;
  onStop: () => void;
  onLap: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {status === "running" ? (
        <ToolButton onClick={onStop} variant="primary">
          <PauseIcon className="h-5 w-5" /> Stop
        </ToolButton>
      ) : (
        <ToolButton onClick={onStart} variant="primary">
          <PlayIcon className="h-5 w-5" /> {status === "stopped" ? "Resume" : "Start"}
        </ToolButton>
      )}
      <ToolButton onClick={onLap} disabled={status !== "running"}>
        <FlagIcon className="h-5 w-5" /> Lap
      </ToolButton>
      <ToolButton onClick={onReset} disabled={status === "idle"}>
        <ResetIcon className="h-5 w-5" /> Reset
      </ToolButton>
    </div>
  );
}

/** Elapsed is measured from `performance.now()` timestamps — never incremented,
 *  so throttling/backgrounding cannot accumulate drift. */
export function Stopwatch() {
  const [elapsed, setElapsed] = useState(0); // ms accumulated while not running
  const [status, setStatus] = useState<Status>("idle");
  const [now, setNow] = useState(0); // live performance.now() while running
  const [laps, setLaps] = useState<Lap[]>([]);
  const startedRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsed;
  const fs = useFullscreen();

  useEffect(() => {
    if (status !== "running") return;
    const tick = () => setNow(performance.now());
    tick();
    const id = window.setInterval(tick, 50);
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(performance.now());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status]);

  const displayed = status === "running" && startedRef.current != null ? elapsed + (now - startedRef.current) : elapsed;

  const start = useCallback(() => {
    startedRef.current = performance.now();
    setNow(performance.now());
    setStatus("running");
  }, []);

  const stop = useCallback(() => {
    if (startedRef.current == null) return;
    setElapsed((e) => e + (performance.now() - startedRef.current!));
    startedRef.current = null;
    setStatus("stopped");
  }, []);

  const lap = useCallback(() => {
    if (startedRef.current == null) return;
    const total = elapsedRef.current + (performance.now() - startedRef.current);
    setLaps((l) => {
      const prev = l.length ? l[l.length - 1].totalMs : 0;
      return [...l, { lapMs: total - prev, totalMs: total }];
    });
  }, []);

  const reset = useCallback(() => {
    startedRef.current = null;
    setElapsed(0);
    setLaps([]);
    setStatus("idle");
  }, []);

  const clearLaps = useCallback(() => setLaps([]), []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT") return;
    if (e.code === "Space") {
      e.preventDefault();
      if (status === "running") stop();
      else start();
    } else if (e.key.toLowerCase() === "l") {
      e.preventDefault();
      lap();
    } else if (e.key.toLowerCase() === "r") {
      e.preventDefault();
      reset();
    }
  };

  // Lap stats
  let best = -1;
  let worst = -1;
  if (laps.length > 1) {
    const lapTimes = laps.map((l) => l.lapMs);
    best = lapTimes.indexOf(Math.min(...lapTimes));
    worst = lapTimes.indexOf(Math.max(...lapTimes));
  }

  const display = formatStopwatch(displayed);

  return (
    <>
      <div
        ref={fs.ref}
        className={cn(
          "rounded-2xl border border-line bg-surface p-6 text-center sm:p-8",
          fs.active && "fixed inset-0 z-[60] flex flex-col items-center justify-center bg-canvas"
        )}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-faint">Stopwatch</p>
        <span className="sr-only" aria-live="polite">
          {status === "running" ? "Stopwatch running" : status === "stopped" ? "Stopwatch stopped" : "Stopwatch ready"}
        </span>

        <div className="mt-5" role="timer">
          <StopwatchDigits main={display.main} hundredths={display.hundredths} size="text-[clamp(3rem,15vw,6.5rem)]" />
        </div>

        <div className="mt-6">
          <StopwatchControls status={status} onStart={start} onStop={stop} onLap={lap} onReset={reset} />
        </div>
        <p className="mt-4 text-xs text-faint">Space start/stop · L lap · R reset</p>

        <div className="mt-4">
          <button
            type="button"
            onClick={fs.toggle}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            Fullscreen
          </button>
        </div>

        {laps.length > 0 && (
          <div className="mt-6 text-left">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Laps</h3>
              <button type="button" onClick={clearLaps} className="text-xs text-faint hover:text-ink">
                Clear laps
              </button>
            </div>
            <ol className="max-h-64 overflow-y-auto rounded-xl border border-line bg-canvas">
              {laps
                .slice()
                .reverse()
                .map((l, i) => {
                  const idx = laps.length - i;
                  const isBest = best === laps.length - 1 - i;
                  const isWorst = worst === laps.length - 1 - i;
                  const lapFmt = formatStopwatch(l.lapMs);
                  const totFmt = formatStopwatch(l.totalMs);
                  return (
                    <li key={idx} className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 last:border-b-0">
                      <span className="text-sm text-muted">Lap {idx}</span>
                      <span
                        className={cn(
                          "tabular text-sm font-medium",
                          isBest && "text-emerald-600",
                          isWorst && "text-amber-600",
                          !isBest && !isWorst && "text-ink"
                        )}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {lapFmt.main}.{lapFmt.hundredths}
                      </span>
                      <span className="tabular text-xs text-faint" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {totFmt.main}.{totFmt.hundredths}
                      </span>
                    </li>
                  );
                })}
            </ol>
          </div>
        )}
      </div>

      {fs.active && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-canvas px-4">
          <button
            type="button"
            onClick={fs.exit}
            aria-label="Exit fullscreen"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted hover:text-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-faint">Stopwatch</p>
          <div className="mt-6" role="timer">
            <StopwatchDigits main={display.main} hundredths={display.hundredths} size="text-[clamp(3.5rem,22vw,16rem)]" />
          </div>
          <div className="mt-10">
            <StopwatchControls status={status} onStart={start} onStop={stop} onLap={lap} onReset={reset} />
          </div>
        </div>
      )}
    </>
  );
}

function ToolButton({
  children,
  onClick,
  variant = "secondary",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-40",
        variant === "primary" ? "bg-ink text-canvas hover:opacity-90" : "border border-line bg-surface text-ink hover:border-faint"
      )}
    >
      {children}
    </button>
  );
}
