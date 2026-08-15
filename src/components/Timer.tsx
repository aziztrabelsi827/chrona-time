"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFullscreen } from "@/hooks/useFullscreen";
import { PlayIcon, PauseIcon, ResetIcon, CloseIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type Status = "idle" | "running" | "paused" | "finished";

const PRESETS = [5, 10, 15, 20, 25, 30, 45, 60]; // minutes
const DURATION_KEY = "chrona:timer:duration";
const DEFAULT_MS = 25 * 60 * 1000;

function fmt(ms: number, withHours: boolean): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return withHours ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// Top-level (stable identity) so the digit subtree is NOT remounted on every tick.
function TimerDigits({ value, size, finished }: { value: string; size: string; finished: boolean }) {
  return (
    <div
      className={cn(
        "tabular font-semibold leading-none tracking-tight transition-colors",
        size,
        finished ? "text-accent animate-pulse" : "text-ink"
      )}
      style={{ fontVariantNumeric: "tabular-nums" }}
      role="timer"
      aria-live="off"
    >
      {value}
    </div>
  );
}

function TimerControls({
  status,
  remainingMs,
  onStart,
  onPause,
  onReset,
  big,
}: {
  status: Status;
  remainingMs: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  big: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {status === "running" ? (
        <ToolButton big={big} onClick={onPause} variant="primary">
          <PauseIcon className="h-5 w-5" /> Pause
        </ToolButton>
      ) : (
        <ToolButton big={big} onClick={onStart} variant="primary" disabled={remainingMs <= 0}>
          <PlayIcon className="h-5 w-5" /> {status === "paused" ? "Resume" : "Start"}
        </ToolButton>
      )}
      <ToolButton big={big} onClick={onReset} disabled={status === "idle"}>
        <ResetIcon className="h-5 w-5" /> Reset
      </ToolButton>
    </div>
  );
}

export function Timer() {
  const [durationMs, setDurationMs] = useState(DEFAULT_MS);
  const [remainingMs, setRemainingMs] = useState(DEFAULT_MS);
  const [status, setStatus] = useState<Status>("idle");
  const [soundOn, setSoundOn] = useState(false);
  const [notifyOn, setNotifyOn] = useState(false);

  const endAtRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const fs = useFullscreen();

  // Keep mutable intent/progress in refs so the ticking effect and the start
  // handler always read fresh values without re-subscribing or stale closures.
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;
  const notifyRef = useRef(notifyOn);
  notifyRef.current = notifyOn;
  const remainingRef = useRef(remainingMs);
  remainingRef.current = remainingMs;

  // Hydrate last-used duration.
  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(DURATION_KEY));
      if (Number.isFinite(stored) && stored > 0) {
        setDurationMs(stored);
        setRemainingMs(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const withHours = durationMs >= 3600000;
  const finished = status === "finished";

  const playBeeps = useCallback(() => {
    try {
      const ctx =
        audioRef.current ??
        new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      [0, 0.35, 0.7].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.3, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.25);
        osc.start(now + offset);
        osc.stop(now + offset + 0.26);
      });
    } catch {
      /* audio blocked / unavailable — never break the timer */
    }
  }, []);

  // Ticking engine: recompute remaining from the wall-clock end timestamp so it
  // never drifts (browser throttling, tab switches, sleep all self-correct).
  // Runs only while running; reads intent from refs so deps stay minimal.
  useEffect(() => {
    if (status !== "running") return;
    let finished = false;
    const tick = () => {
      const end = endAtRef.current;
      if (end == null) return;
      const remaining = end - Date.now();
      if (remaining <= 0) {
        if (finished) return; // fire completion once
        finished = true;
        setRemainingMs(0);
        setStatus("finished");
        endAtRef.current = null;
        if (soundRef.current) playBeeps();
        if (notifyRef.current && typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification("Timer finished", { body: "Your Chrona Time countdown has reached zero." });
          } catch {
            /* ignore */
          }
        }
      } else {
        setRemainingMs(remaining);
      }
    };
    tick();
    const id = window.setInterval(tick, 200);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status, playBeeps]);

  const applyDuration = useCallback((ms: number) => {
    const clamped = Math.max(0, Math.min(99 * 3600000, ms));
    setDurationMs(clamped);
    setRemainingMs(clamped);
    setStatus("idle");
    endAtRef.current = null;
    try {
      localStorage.setItem(DURATION_KEY, String(clamped));
    } catch {
      /* ignore */
    }
  }, []);

  const start = useCallback(() => {
    const rem = remainingRef.current;
    if (rem <= 0) return;
    endAtRef.current = Date.now() + rem;
    setStatus("running");
    if (soundRef.current && audioRef.current?.state === "suspended") audioRef.current.resume();
  }, []);

  const pause = useCallback(() => {
    const end = endAtRef.current;
    if (end != null) setRemainingMs(Math.max(0, end - Date.now()));
    endAtRef.current = null;
    setStatus("paused");
  }, []);

  const reset = useCallback(() => {
    endAtRef.current = null;
    setRemainingMs(durationMs);
    setStatus("idle");
  }, [durationMs]);

  // Keyboard shortcuts scoped to the timer panel.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "SELECT") return;
    if (e.code === "Space") {
      e.preventDefault();
      if (status === "running") pause();
      else if (finished) reset();
      else start();
    } else if (e.key.toLowerCase() === "r") {
      e.preventDefault();
      reset();
    }
  };

  const enableNotifications = () => {
    if (typeof Notification === "undefined") return;
    try {
      const p = Notification.requestPermission();
      Promise.resolve(p).then((perm) => setNotifyOn(perm === "granted")).catch(() => {});
    } catch {
      /* ignore */
    }
  };

  const display = fmt(remainingMs, withHours);
  const liveStatus =
    status === "running" ? "Timer running" : status === "paused" ? "Timer paused" : finished ? "Timer finished" : "Timer ready";

  return (
    <>
      <div
        ref={fs.ref}
        className={cn(
          "rounded-2xl border bg-surface p-6 text-center sm:p-8",
          finished ? "border-accent" : "border-line",
          fs.active && "fixed inset-0 z-[60] flex flex-col items-center justify-center bg-canvas"
        )}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-faint">Timer</p>
        <span className="sr-only" aria-live="polite">
          {liveStatus}
        </span>

        <div className="mt-5">
          <TimerDigits value={display} size="text-[clamp(3.5rem,16vw,7rem)]" finished={finished} />
        </div>

        {/* Run controls always available so Start is reachable in idle. */}
        <div className="mt-6">
          <TimerControls
            status={status}
            remainingMs={remainingMs}
            onStart={start}
            onPause={pause}
            onReset={reset}
            big={false}
          />
        </div>

        {status === "idle" && (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => applyDuration(m * 60 * 1000)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    durationMs === m * 60 * 1000
                      ? "border-accent bg-accent/10 text-ink"
                      : "border-line bg-surface-2 text-muted hover:text-ink"
                  )}
                >
                  {m} min
                </button>
              ))}
            </div>
            <CustomEntry durationMs={durationMs} onApply={applyDuration} />
          </>
        )}

        {(status === "paused" || finished) && (
          <p className="mt-4 text-xs text-faint">Press Space to resume · R to reset</p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSoundOn((v) => !v)}
            aria-pressed={soundOn}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              soundOn ? "border-accent text-ink" : "border-line text-muted hover:text-ink"
            )}
          >
            {soundOn ? "Sound on" : "Sound off"}
          </button>
          <button
            type="button"
            onClick={enableNotifications}
            aria-pressed={notifyOn}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              notifyOn ? "border-accent text-ink" : "border-line text-muted hover:text-ink"
            )}
          >
            {notifyOn ? "Alerts on" : "Enable alert"}
          </button>
          <button
            type="button"
            onClick={fs.toggle}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            Fullscreen
          </button>
        </div>
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-faint">Timer</p>
          <div className="mt-6">
            <TimerDigits value={display} size="text-[clamp(4rem,24vw,18rem)]" finished={finished} />
          </div>
          <div className="mt-10">
            <TimerControls
              status={status}
              remainingMs={remainingMs}
              onStart={start}
              onPause={pause}
              onReset={reset}
              big
            />
          </div>
        </div>
      )}
    </>
  );
}

function CustomEntry({
  durationMs,
  onApply,
}: {
  durationMs: number;
  onApply: (ms: number) => void;
}) {
  const initH = Math.floor(durationMs / 3600000);
  const initM = Math.floor((durationMs % 3600000) / 60000);
  const initS = Math.floor((durationMs % 60000) / 1000);
  const [h, setH] = useState(String(initH));
  const [m, setM] = useState(String(initM));
  const [s, setS] = useState(String(initS));

  const apply = () => {
    const ms =
      Math.max(0, Number(h) || 0) * 3600000 +
      Math.max(0, Number(m) || 0) * 60000 +
      Math.max(0, Number(s) || 0) * 1000;
    onApply(ms);
  };

  const field = "h-11 w-16 rounded-lg border border-line bg-canvas px-2 text-center text-base text-ink outline-none focus:border-accent";

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="flex items-end justify-center gap-2" aria-label="Custom duration">
        <label className="text-center">
          <input inputMode="numeric" value={h} onChange={(e) => setH(e.target.value.replace(/\D/g, "").slice(0, 2))} className={field} aria-label="Hours" />
          <span className="mt-1 block text-[10px] uppercase text-faint">Hours</span>
        </label>
        <label className="text-center">
          <input inputMode="numeric" value={m} onChange={(e) => setM(e.target.value.replace(/\D/g, "").slice(0, 2))} className={field} aria-label="Minutes" />
          <span className="mt-1 block text-[10px] uppercase text-faint">Minutes</span>
        </label>
        <label className="text-center">
          <input inputMode="numeric" value={s} onChange={(e) => setS(e.target.value.replace(/\D/g, "").slice(0, 2))} className={field} aria-label="Seconds" />
          <span className="mt-1 block text-[10px] uppercase text-faint">Seconds</span>
        </label>
      </div>
      <ToolButton big={false} onClick={apply} variant="primary">
        Set duration
      </ToolButton>
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  variant = "secondary",
  disabled,
  big,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  big?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-40",
        big ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm",
        variant === "primary"
          ? "bg-ink text-canvas hover:opacity-90"
          : "border border-line bg-surface text-ink hover:border-faint"
      )}
    >
      {children}
    </button>
  );
}
