"use client";

import Link from "next/link";
import { useNow } from "@/hooks/useClock";
import { describeDifference } from "@/lib/time";
import { cityUrl } from "@/lib/locations";

interface ReferenceCity {
  name: string;
  slug: string;
  timezone: string;
}

export function TimeDifferences({
  baseZone,
  cities,
}: {
  baseZone: string;
  cities: ReferenceCity[];
}) {
  const now = useNow({ intervalMs: 60000 });

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {cities.map((c) => (
        <li key={c.slug} className="flex items-center justify-between gap-3 px-5 py-3">
          <Link href={cityUrl(c.slug)} className="font-medium text-ink hover:underline">
            {c.name}
          </Link>
          <span className="tabular text-sm text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
            {now ? describeDifference(baseZone, c.timezone, new Date(now)) : "\u00A0"}
          </span>
        </li>
      ))}
    </ul>
  );
}
