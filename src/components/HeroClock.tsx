"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CITIES } from "@/data/locations";
import { Clock } from "@/components/Clock";
import { FullscreenClock } from "@/components/FullscreenClock";
import { SearchTrigger } from "@/components/SearchTrigger";
import { useNow } from "@/hooks/useClock";
import {
  detectTimeZone,
  getLongDate,
  getOffsetLabel,
  getTimeZoneAbbr,
} from "@/lib/time";
import { search } from "@/lib/search";
import { SyncStatus } from "@/components/SyncStatus";
import { cn } from "@/lib/cn";

function cityForZone(zone: string) {
  const matches = CITIES.filter((c) => c.timezone === zone);
  return matches.sort((a, b) => (b.population ?? 0) - (a.population ?? 0))[0];
}

const LOCATION_KEY = "chrona:location";

export function HeroClock() {
  const [zone, setZone] = useState<string | null>(null);
  const [citySlug, setCitySlug] = useState<string | null>(null);
  const [hour12, setHour12] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const now = useNow();

  useEffect(() => {
    setZone(detectTimeZone());
    try {
      const f = localStorage.getItem("chrona:format");
      if (f === "12") setHour12(true);
      else if (f === "24") setHour12(false);
      const s = localStorage.getItem("chrona:seconds");
      if (s === "off") setShowSeconds(false);
      const loc = localStorage.getItem(LOCATION_KEY);
      if (loc && CITIES.some((c) => c.slug === loc)) setCitySlug(loc);
    } catch {
      /* ignore */
    }
  }, []);

  const detectedCity = zone ? cityForZone(zone) : undefined;
  const city = (citySlug ? CITIES.find((c) => c.slug === citySlug) : undefined) ?? detectedCity;
  const clockZone = city?.timezone ?? zone ?? "UTC";
  const date = now ? new Date(now) : null;

  const setFormat = (v: boolean) => {
    setHour12(v);
    try {
      localStorage.setItem("chrona:format", v ? "12" : "24");
    } catch {
      /* ignore */
    }
  };
  const toggleSeconds = () =>
    setShowSeconds((v) => {
      const next = !v;
      try {
        localStorage.setItem("chrona:seconds", next ? "on" : "off");
      } catch {
        /* ignore */
      }
      return next;
    });

  const pickResults = useMemo(
    () => (picking ? search(query, 6).filter((r) => r.group === "Cities") : []),
    [query, picking]
  );
  const chooseLocation = (slug: string) => {
    setCitySlug(slug);
    try {
      localStorage.setItem(LOCATION_KEY, slug);
    } catch {
      /* ignore */
    }
    setPicking(false);
    setQuery("");
  };
  const clearLocation = () => {
    setCitySlug(null);
    try {
      localStorage.removeItem(LOCATION_KEY);
    } catch {
      /* ignore */
    }
  };

  const label = city
    ? `${city.name}, ${city.country}`
    : zone
      ? `Your local time`
      : "Current time";

  return (
    <section className="text-center" aria-label="Current time">
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-faint">
        Live World Time
      </p>
      <h1 className="mt-3 text-lg font-medium tracking-tight text-muted sm:text-xl">
        Current Time
      </h1>

      <div className="mt-6">
        <Clock
          timeZone={clockZone}
          hour12={hour12}
          showSeconds={showSeconds}
          sizeClass="text-[clamp(3rem,14vw,8.5rem)]"
          label={label}
        />
      </div>

      <p className="mt-6 text-sm text-muted sm:text-base">
        {date ? getLongDate(date, clockZone) : "\u00A0"}
      </p>

      {/* Location */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        {city ? (
          <>
            <span className="text-lg font-semibold text-ink">{city.name}</span>
            <span className="text-sm text-faint">{city.country}</span>
          </>
        ) : zone ? (
          <span className="text-base font-medium text-ink">Your local time</span>
        ) : (
          <span className="text-base text-faint">Detecting…</span>
        )}
        <button
          type="button"
          onClick={() => setPicking((v) => !v)}
          className="text-xs font-medium text-accent hover:underline"
        >
          {picking ? "Cancel" : "Change"}
        </button>
      </div>

      {/* Offset + zone pills */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {date && <Pill>{getOffsetLabel(clockZone, date)}</Pill>}
        {date && <Pill>{getTimeZoneAbbr(clockZone, date) || clockZone}</Pill>}
      </div>

      {/* Accuracy status */}
      <div className="mt-3 flex justify-center">
        <SyncStatus />
      </div>

      {/* Inline location picker */}
      {picking && (
        <div className="mx-auto mt-4 max-w-sm text-left">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a city…"
              className="h-10 w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
              aria-label="Choose a city for your clock"
            />
          </div>
          {pickResults.length > 0 && (
            <ul className="mt-1 max-h-56 overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-soft">
              {pickResults.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => chooseLocation(r.slug)}
                    className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-surface-2"
                  >
                    <span className="font-medium text-ink">{r.label}</span>
                    <span className="text-xs text-muted">{r.entity} · {r.meta}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {citySlug && (
            <button
              type="button"
              onClick={clearLocation}
              className="mt-2 text-xs text-faint hover:text-ink"
            >
              Use detected location instead
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="mt-7 flex justify-center">
        <SearchTrigger />
      </div>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Segmented ariaLabel="Time format">
          <SegButton active={!hour12} onClick={() => setFormat(false)}>
            24h
          </SegButton>
          <SegButton active={hour12} onClick={() => setFormat(true)}>
            12h
          </SegButton>
        </Segmented>
        <button
          type="button"
          onClick={toggleSeconds}
          aria-pressed={showSeconds}
          className={cn(
            "rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium transition-colors hover:text-ink",
            showSeconds ? "text-ink" : "text-muted"
          )}
        >
          Seconds
        </button>
        <FullscreenClock timeZone={clockZone} label={label} />
      </div>
    </section>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-muted">
      {children}
    </span>
  );
}

function Segmented({ children, ariaLabel }: { children: ReactNode; ariaLabel: string }) {
  return (
    <span
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center rounded-full border border-line bg-surface-2 p-0.5"
    >
      {children}
    </span>
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
