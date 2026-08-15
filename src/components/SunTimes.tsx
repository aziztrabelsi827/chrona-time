"use client";

import { useMemo } from "react";
import { useNow } from "@/hooks/useClock";
import { computeSunTimes } from "@/lib/sun";
import { formatInZone } from "@/lib/time";
import { SunIcon } from "@/components/icons";

interface SunTimesProps {
  lat: number;
  lng: number;
  timeZone: string;
}

function fmt(date: Date | null, timeZone: string): string | null {
  if (!date) return null;
  return formatInZone(date, timeZone, { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function SunTimes({ lat, lng, timeZone }: SunTimesProps) {
  const now = useNow({ intervalMs: 60000 });

  const data = useMemo(() => {
    if (now === null) return null;
    const d = new Date(now);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
    const ref = new Date(Date.UTC(+get("year"), +get("month") - 1, +get("day"), 12, 0, 0));
    const sun = computeSunTimes(lat, lng, ref);

    let dayLength: string | null = null;
    if (sun.sunrise && sun.sunset) {
      const mins = Math.round((sun.sunset.getTime() - sun.sunrise.getTime()) / 60000);
      dayLength = `${Math.floor(mins / 60)}h ${mins % 60}m`;
    }
    return {
      sunrise: fmt(sun.sunrise, timeZone),
      sunset: fmt(sun.sunset, timeZone),
      noon: fmt(sun.solarNoon, timeZone),
      polarDay: sun.polarDay,
      polarNight: sun.polarNight,
      dayLength,
    };
  }, [now, lat, lng, timeZone]);

  const dash = "\u00A0";

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
      <Cell label="Sunrise" value={data ? (data.sunrise ?? "—") : dash} />
      <Cell label="Solar noon" value={data ? (data.noon ?? "—") : dash} />
      <Cell label="Sunset" value={data ? (data.sunset ?? "—") : dash} />
      <Cell
        label="Daylight"
        value={
          data
            ? data.polarDay
              ? "All day"
              : data.polarNight
                ? "None"
                : (data.dayLength ?? "—")
            : dash
        }
      />
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-faint">
        {label === "Sunrise" && <SunIcon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className="tabular mt-1 text-lg font-semibold text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
    </div>
  );
}
