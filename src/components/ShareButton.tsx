"use client";

import { useState } from "react";
import { CheckIcon, ShareIcon } from "@/components/icons";
import { formatInZone, getOffsetLabel } from "@/lib/time";
import { cn } from "@/lib/cn";

interface ShareButtonProps {
  label: string;
  timeZone: string;
  className?: string;
}

/** Shares the current time via the Web Share API, falling back to clipboard. */
export function ShareButton({ label, timeZone, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const now = new Date();
    const time = formatInZone(now, timeZone, { hour: "2-digit", minute: "2-digit", hour12: false });
    const text = `${label} — ${time} (${getOffsetLabel(timeZone, now)})`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: label, text });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Share the current time in ${label}`}
      title="Share current time"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-medium text-muted transition-colors hover:text-ink",
        className
      )}
    >
      {copied ? <CheckIcon className="h-4 w-4 text-accent" /> : <ShareIcon className="h-4 w-4" />}
      <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
    </button>
  );
}
