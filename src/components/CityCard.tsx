"use client";

import Link from "next/link";
import type { City } from "@/data/locations";
import { cityUrl } from "@/lib/locations";
import {
  getOffsetLabel,
  getShortDate,
  getTimeParts,
  getTimeZoneAbbr,
} from "@/lib/time";
import { CloseIcon } from "@/components/icons";

interface CityCardProps {
  city: City;
  now: number | null;
  onRemove?: (slug: string) => void;
}

export function CityCard({ city, now, onRemove }: CityCardProps) {
  const date = now ? new Date(now) : null;
  const parts = date ? getTimeParts(date, city.timezone) : null;

  return (
    <div className="group relative rounded-xl border border-line bg-surface p-4 transition-colors hover:border-faint">
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(city.slug)}
          aria-label={`Remove ${city.name}`}
          className="absolute right-2 top-2 rounded p-1 text-faint opacity-0 transition hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-baseline justify-between gap-2 pr-5">
        <Link
          href={cityUrl(city.slug)}
          className="font-medium text-ink hover:underline"
        >
          {city.name}
        </Link>
        <span className="truncate text-xs text-faint">{city.country}</span>
      </div>
      <div
        className="tabular mt-2 flex items-baseline gap-1"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        <span className="text-2xl font-semibold text-ink">
          {date ? `${parts?.hour}:${parts?.minute}` : "—"}
        </span>
        {date && (
          <>
            <span className="text-sm text-accent">{parts?.second}</span>
            {parts?.dayPeriod ? (
              <span className="ml-1 text-xs text-muted">{parts.dayPeriod}</span>
            ) : null}
          </>
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs text-muted">
        <span>{date ? getShortDate(date, city.timezone) : "\u00A0"}</span>
        <span className="truncate">
          {date
            ? `${getTimeZoneAbbr(city.timezone, date)} · ${getOffsetLabel(city.timezone, date)}`
            : "\u00A0"}
        </span>
      </div>
    </div>
  );
}
