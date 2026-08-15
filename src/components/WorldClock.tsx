"use client";

import { useEffect, useMemo, useState } from "react";
import type { City } from "@/data/locations";
import { CITIES } from "@/data/locations";
import { siteConfig } from "@/config/site";
import { search, type SearchResult } from "@/lib/search";
import { useNow } from "@/hooks/useClock";
import { CityCard } from "@/components/CityCard";
import { PlusIcon, SearchIcon } from "@/components/icons";

const STORAGE_KEY = "chrona:worldclock";

export function WorldClock() {
  const now = useNow();
  const [slugs, setSlugs] = useState<string[]>([...siteConfig.defaultWorldClockCities]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");

  // Hydrate saved preferences after mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) setSlugs(arr.filter((s) => typeof s === "string"));
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch {
      /* ignore */
    }
  }, [slugs, loaded]);

  const cityMap = useMemo(() => new Map(CITIES.map((c) => [c.slug, c])), []);
  const cities = slugs.map((s) => cityMap.get(s)).filter(Boolean) as City[];
  const results = useMemo(
    () => (query.trim() ? search(query, 6).filter((r) => r.group === "Cities") : []),
    [query]
  );

  const remove = (slug: string) => setSlugs((s) => s.filter((x) => x !== slug));
  const add = (r: SearchResult) => {
    if (r.slug && !slugs.includes(r.slug)) setSlugs((s) => [...s, r.slug]);
    setAdding(false);
    setQuery("");
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {cities.length} {cities.length === 1 ? "city" : "cities"} · live, updates every second
        </p>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink transition-colors hover:border-faint"
        >
          <PlusIcon className="h-4 w-4" /> Add city
        </button>
      </div>

      {adding && (
        <div className="relative mb-4">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3">
            <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a city to add…"
              className="h-10 w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
            />
          </div>
          {results.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-surface shadow-lg">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => add(r)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-surface-2"
                  >
                    <span className="font-medium text-ink">{r.label}</span>
                    <span className="truncate text-xs text-muted">{r.entity} · {r.meta}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {cities.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((c) => (
            <CityCard key={c.slug} city={c} now={now} onRemove={loaded ? remove : undefined} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
          No cities yet. Add one to start your world clock.
        </p>
      )}
    </div>
  );
}
