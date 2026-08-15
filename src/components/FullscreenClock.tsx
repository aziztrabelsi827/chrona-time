"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "@/components/Clock";
import { CloseIcon, ExpandIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

interface FullscreenClockProps {
  timeZone: string;
  label: string;
  className?: string;
}

/** A small button that opens a full-viewport, distraction-free clock. */
export function FullscreenClock({ timeZone, label, className }: FullscreenClockProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    const el = ref.current;
    if (el && typeof document.fullscreenEnabled === "boolean" && document.fullscreenEnabled) {
      el.requestFullscreen?.().catch(() => {
        /* native fullscreen unavailable — overlay still covers the viewport */
      });
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open fullscreen clock"
        title="Fullscreen clock"
        className={cn(
          "inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-ink",
          className
        )}
      >
        <ExpandIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          ref={ref}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-canvas px-4"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Exit fullscreen"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted hover:text-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <Clock
            timeZone={timeZone}
            showSeconds
            sizeClass="text-[clamp(4rem,22vw,17rem)]"
            label={label}
          />
          <p className="mt-8 max-w-md text-center text-sm text-muted sm:text-base">{label}</p>
        </div>
      )}
    </>
  );
}
