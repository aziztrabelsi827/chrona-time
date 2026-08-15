"use client";

import type { City } from "@/data/locations";
import { useNow } from "@/hooks/useClock";
import { CityCard } from "@/components/CityCard";

/** Grid of cities with live times (used on timezone pages). */
export function LiveCityGrid({ cities }: { cities: City[] }) {
  const now = useNow();
  if (cities.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
        No covered cities use this time zone yet.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cities.map((c) => (
        <CityCard key={c.slug} city={c} now={now} />
      ))}
    </div>
  );
}
