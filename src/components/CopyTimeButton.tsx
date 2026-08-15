"use client";

import { useState } from "react";
import { useNow } from "@/hooks/useClock";
import { getTimeParts, getTimeZoneAbbr } from "@/lib/time";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

/** Copies the live current time (e.g. "20:41:32 CET") for the given zone. */
export function CopyTimeButton({
  timeZone,
  className,
}: {
  timeZone: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const now = useNow();

  const onClick = async () => {
    const date = now ? new Date(now) : new Date();
    const parts = getTimeParts(date, timeZone);
    const abbr = getTimeZoneAbbr(timeZone, date);
    const text = `${parts.hour}:${parts.minute}:${parts.second}${abbr ? ` ${abbr}` : ""}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Copy current time"
      title="Copy current time"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-medium text-muted transition-colors hover:text-ink",
        className
      )}
    >
      {copied ? <CheckIcon className="h-4 w-4 text-accent" /> : <CopyIcon className="h-4 w-4" />}
      <span className="hidden sm:inline">{copied ? "Copied" : "Copy time"}</span>
    </button>
  );
}
