"use client";

import { useEffect, useMemo, useState } from "react";
import { CITIES } from "@/data/locations";
import {
  formatInZone,
  getLongDate,
  getOffsetLabel,
  getTimeZoneAbbr,
  describeDifference,
} from "@/lib/time";
import { ArrowRightLeftIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

function partsToInputValue(date: Date, tz: string): string {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "00";
  let hour = get("hour");
  if (hour === "24") hour = "00";
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

/** Convert a wall-clock time in `tz` into an absolute UTC instant. */
function wallToInstant(y: number, mo: number, d: number, h: number, mi: number, tz: string): number {
  const wallUtc = Date.UTC(y, mo - 1, d, h, mi);
  let guess = wallUtc;
  for (let i = 0; i < 4; i++) {
    const off = tzOffset(tz, guess);
    const real = wallUtc - off * 60000;
    if (real === guess) break;
    guess = real;
  }
  return guess;
}

function tzOffset(tz: string, ms: number): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = dtf.formatToParts(new Date(ms));
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
    let hour = Number(get("hour"));
    if (hour === 24) hour = 0;
    const wallAsUtc = Date.UTC(
      Number(get("year")),
      Number(get("month")) - 1,
      Number(get("day")),
      hour,
      Number(get("minute")),
      Number(get("second"))
    );
    return Math.round((wallAsUtc - ms) / 60000);
  } catch {
    return 0;
  }
}

const sortedCities = CITIES.slice().sort((a, b) => a.name.localeCompare(b.name));

export function Converter() {
  const [fromSlug, setFromSlug] = useState("new-york");
  const [toSlug, setToSlug] = useState("london");
  const [value, setValue] = useState("");
  const [mounted, setMounted] = useState(false);

  const from = CITIES.find((c) => c.slug === fromSlug)!;
  const to = CITIES.find((c) => c.slug === toSlug)!;

  useEffect(() => {
    setMounted(true);
    setValue(partsToInputValue(new Date(), from.timezone));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = useMemo(() => {
    if (!value) return null;
    const [date, time] = value.split("T");
    if (!date || !time) return null;
    const [y, mo, d] = date.split("-").map(Number);
    const [h, mi] = time.split(":").map(Number);
    if (!y || !mo || !d) return null;
    const inst = wallToInstant(y, mo, d, h, mi, from.timezone);
    const instDate = new Date(inst);
    return {
      fromTime: formatInZone(instDate, from.timezone, { hour: "2-digit", minute: "2-digit", hour12: true }),
      fromDate: getLongDate(instDate, from.timezone),
      toTime: formatInZone(instDate, to.timezone, { hour: "2-digit", minute: "2-digit", hour12: true }),
      toDate: getLongDate(instDate, to.timezone),
      toAbbr: getTimeZoneAbbr(to.timezone, instDate),
      toOffset: getOffsetLabel(to.timezone, instDate),
      fromOffset: getOffsetLabel(from.timezone, instDate),
      diff: describeDifference(from.timezone, to.timezone, instDate),
    };
  }, [value, from.timezone, to.timezone]);

  const swap = () => {
    setFromSlug(toSlug);
    setToSlug(fromSlug);
  };

  const useNow = () => setValue(partsToInputValue(new Date(), from.timezone));

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-8">
      <div className="grid items-end gap-5 sm:grid-cols-[1fr_auto_1fr]">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-faint">From</span>
          <select
            value={fromSlug}
            onChange={(e) => setFromSlug(e.target.value)}
            className="h-11 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none focus:border-accent"
          >
            {sortedCities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}, {c.country}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={swap}
          aria-label="Swap cities"
          className="mx-auto mb-0.5 hidden h-11 w-11 items-center justify-center rounded-full border border-line text-muted hover:text-ink sm:flex"
        >
          <ArrowRightLeftIcon className="h-5 w-5" />
        </button>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-faint">To</span>
          <select
            value={toSlug}
            onChange={(e) => setToSlug(e.target.value)}
            className="h-11 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none focus:border-accent"
          >
            {sortedCities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}, {c.country}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-faint">
          Time in {from.name}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-11 rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={useNow}
            className="h-11 rounded-lg border border-line bg-surface-2 px-4 text-sm font-medium text-ink hover:border-faint"
          >
            Use current time
          </button>
          <button
            type="button"
            onClick={swap}
            className="h-11 rounded-lg border border-line bg-surface-2 px-4 text-sm font-medium text-ink hover:border-faint sm:hidden"
          >
            Swap
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-line bg-canvas p-5 sm:p-6">
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="text-center sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-faint">{from.name}</p>
            <p
              className="tabular mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {mounted && result ? result.fromTime : "—"}
            </p>
            <p className="mt-0.5 text-xs text-faint">
              {mounted && result ? result.fromOffset : "\u00A0"}
            </p>
          </div>

          <div aria-hidden className="hidden text-faint sm:block">
            <ArrowRightLeftIcon className="h-5 w-5" />
          </div>

          <div className="text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-faint">{to.name}</p>
            <p
              className="tabular mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {mounted && result ? result.toTime : "—"}
            </p>
            <p className="mt-0.5 text-xs text-faint">
              {mounted && result ? result.toOffset : "\u00A0"}
            </p>
          </div>
        </div>

        {mounted && result && (
          <p className="mt-5 border-t border-line pt-4 text-center text-sm text-muted">
            {to.name} is <span className="font-semibold text-accent">{result.diff}</span> {from.name}.
          </p>
        )}
      </div>
    </div>
  );
}
