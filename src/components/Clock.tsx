"use client";

import { useNow } from "@/hooks/useClock";
import { getTimeParts, getLongDate, getOffsetLabel } from "@/lib/time";

export interface ClockProps {
  timeZone: string;
  /** Tailwind text-size class for the digits, e.g. "text-7xl". */
  sizeClass?: string;
  hour12?: boolean;
  showSeconds?: boolean;
  showMilliseconds?: boolean;
  showDate?: boolean;
  showOffset?: boolean;
  label?: string;
}

export function Clock({
  timeZone,
  sizeClass = "text-7xl",
  hour12 = false,
  showSeconds = true,
  showMilliseconds = false,
  showDate = false,
  showOffset = false,
  label = "Current time",
}: ClockProps) {
  const now = useNow({ highFrequency: showMilliseconds });

  // `now` is null during SSR + first paint → render a stable, invisible
  // placeholder of identical dimensions to avoid hydration mismatch and CLS.
  const date = now !== null ? new Date(now) : null;
  const parts = date ? getTimeParts(date, timeZone, hour12) : null;
  const widthHint = showSeconds ? "00:00:00" : "00:00";
  const placeholder = showMilliseconds ? `${widthHint}.000` : widthHint;

  return (
    <div className="flex flex-col items-center text-center" aria-label={label}>
      <div
        className={`tabular font-semibold leading-none tracking-tight ${sizeClass}`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {date ? (
          <span className="inline-flex items-baseline">
            <span>{parts?.hour}</span>
            <Colon />
            <span>{parts?.minute}</span>
            {showSeconds ? (
              <>
                <Colon />
                <span className="text-accent">{parts?.second}</span>
              </>
            ) : null}
            {showMilliseconds ? (
              <span className="text-2xl text-muted">.{parts?.millisecond}</span>
            ) : null}
            {hour12 && parts?.dayPeriod ? (
              <span className="ml-3 text-2xl font-medium text-muted">{parts.dayPeriod}</span>
            ) : null}
          </span>
        ) : (
          <span aria-hidden className="opacity-0">
            {placeholder}
          </span>
        )}
      </div>

      {showDate && (
        <p className="mt-3 text-sm text-muted sm:text-base">
          {date ? getLongDate(date, timeZone) : "\u00A0"}
        </p>
      )}
      {showOffset && (
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-faint">
          {date ? getOffsetLabel(timeZone, date) : "\u00A0"}
        </p>
      )}
    </div>
  );
}

function Colon() {
  return <span className="px-[0.02em] text-faint">:</span>;
}
