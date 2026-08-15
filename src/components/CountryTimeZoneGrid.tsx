"use client";

import Link from "next/link";
import { useNow } from "@/hooks/useClock";
import {
  getOffsetLabel,
  getTimeParts,
  getTimeZoneAbbr,
  getTimeZoneLongName,
  isDST,
} from "@/lib/time";
import { cityUrl } from "@/lib/locations";

export interface CountryZoneEntry {
  zone: string;
  cityName?: string;
  citySlug?: string;
}

/**
 * Live, per-zone time summary for a multi-timezone country. DST and offset are
 * computed independently for each zone, so the country is never presented as
 * having a single national time.
 */
export function CountryTimeZoneGrid({
  entries,
}: {
  entries: CountryZoneEntry[];
}) {
  const now = useNow();
  const date = now ? new Date(now) : null;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <ul className="divide-y divide-line">
        {entries.map((entry) => {
          const longName = date ? getTimeZoneLongName(entry.zone, date) : entry.zone;
          const abbr = date ? getTimeZoneAbbr(entry.zone, date) : "";
          const offset = date ? getOffsetLabel(entry.zone, date) : "";
          const dst = date ? isDST(entry.zone, date) : false;
          const parts = date ? getTimeParts(date, entry.zone) : null;

          return (
            <li key={entry.zone} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-ink">{longName}</span>
                  {abbr ? <span className="shrink-0 text-xs text-faint">{abbr}</span> : null}
                </div>
                <div className="truncate text-xs text-faint">
                  {entry.citySlug && entry.cityName ? (
                    <>
                      {entry.zone} ·{" "}
                      <Link className="hover:text-ink" href={cityUrl(entry.citySlug)}>
                        {entry.cityName}
                      </Link>
                    </>
                  ) : (
                    entry.zone
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div
                  className="tabular text-lg font-semibold text-ink"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {parts ? `${parts.hour}:${parts.minute}` : "—"}
                </div>
                <div className="flex items-center justify-end gap-2 text-[11px] text-faint">
                  <span>{offset}</span>
                  {dst ? <span className="font-medium text-accent">DST</span> : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
