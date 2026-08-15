import { CITIES, COUNTRIES } from "@/data/locations";
import { TIME_ZONES } from "@/data/timezones";
import { cityUrl, countryUrl, timezoneUrl } from "@/lib/locations";

export interface SearchResult {
  id: string;
  label: string;
  /** Entity type, shown to disambiguate otherwise-similar results. */
  entity: "City" | "Country" | "Timezone";
  group: "Cities" | "Countries" | "Time zones";
  /** Secondary descriptor (country for a city, continent for a country, region for a tz). */
  meta: string;
  /** Entity slug (stable; consumers should not parse hrefs). */
  slug: string;
  href: string;
  /** IANA id, used to show the live current time beside the result. */
  timeZone?: string;
  /** Popularity flag used as a ranking tiebreaker. */
  popular?: boolean;
}

interface ScoredResult {
  result: SearchResult;
  score: number;
}

/** Lightweight subsequence fuzzy matcher. Returns 0 for no match. */
function fuzzyScore(query: string, target: string): number {
  if (!target) return 0;
  if (target === query) return 1000;
  if (target.startsWith(query)) return 500 + query.length;

  let qi = 0;
  let score = 0;
  let streak = 0;
  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target[ti] === query[qi]) {
      qi++;
      streak++;
      score += 2 + streak; // reward consecutive matches
    } else {
      streak = 0;
    }
  }
  return qi === query.length ? score - (target.length - query.length) : 0;
}

function buildIndex(): SearchResult[] {
  const items: SearchResult[] = [];

  for (const c of CITIES) {
    items.push({
      id: `city:${c.slug}`,
      label: c.name,
      entity: "City",
      group: "Cities",
      meta: c.country,
      slug: c.slug,
      href: cityUrl(c.slug),
      timeZone: c.timezone,
      popular: c.popular,
    });
  }
  for (const country of COUNTRIES) {
    const multi = country.timezones.length > 1;
    items.push({
      id: `country:${country.slug}`,
      label: country.name,
      entity: "Country",
      group: "Countries",
      meta: multi ? "Multiple time zones" : country.continent,
      slug: country.slug,
      href: countryUrl(country.slug),
      timeZone: multi ? undefined : country.timezones[0],
      popular: country.popular,
    });
  }
  for (const tz of TIME_ZONES) {
    items.push({
      id: `tz:${tz.id}`,
      label: tz.label,
      entity: "Timezone",
      group: "Time zones",
      meta: tz.region,
      slug: tz.slug,
      href: timezoneUrl(tz.slug),
      timeZone: tz.id,
      popular: tz.popular,
    });
  }
  return items;
}

const INDEX = buildIndex();

/** alias → { kind, slug } for direct boosts (e.g. "nyc" → New York). */
const aliasMap = new Map<string, { kind: "city" | "country"; slug: string }>();
for (const c of CITIES) {
  (c.aliases ?? []).forEach((a) => aliasMap.set(a.toLowerCase(), { kind: "city", slug: c.slug }));
}
for (const c of COUNTRIES) {
  (c.aliases ?? []).forEach((a) =>
    aliasMap.set(a.toLowerCase(), { kind: "country", slug: c.slug })
  );
}

const TOKEN_SPLIT = /[\s,./_-]+/;

/**
 * Instant client-side search with deliberate ranking:
 *   1. exact label match
 *   2. alias match          (e.g. "nyc" → New York)
 *   3. label starts-with
 *   4. first-token starts-with, then any-token starts-with
 *   5. subsequence (fuzzy) on label, slug, timezone id, meta
 * Popularity is a small tiebreaker. No API call required.
 */
export function search(query: string, limit = 9): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const aliasHit = aliasMap.get(q);

  const scored: ScoredResult[] = [];
  for (const result of INDEX) {
    const label = result.label.toLowerCase();
    let score = 0;

    if (label === q) {
      score = 100000;
    } else if (label.startsWith(q)) {
      score = 60000 + q.length;
    } else {
      const tokens = label.split(TOKEN_SPLIT);
      const tokenIndex = tokens.findIndex((t) => t.startsWith(q));
      if (tokenIndex === 0) score = 40000 + q.length;
      else if (tokenIndex > 0) score = 30000 + q.length;
      else score = fuzzyScore(q, label);
    }

    // Secondary fields (slug, IANA id, meta) — never outrank a strong label hit.
    score = Math.max(
      score,
      fuzzyScore(q, result.slug.toLowerCase()),
      fuzzyScore(q, (result.timeZone ?? "").toLowerCase()),
      fuzzyScore(q, result.meta.toLowerCase())
    );

    if (
      aliasHit &&
      ((aliasHit.kind === "city" && result.entity === "City") ||
        (aliasHit.kind === "country" && result.entity === "Country")) &&
      result.slug === aliasHit.slug
    ) {
      score = Math.max(score, 90000);
    }

    if (result.popular) score += 25;

    if (score > 0) scored.push({ result, score });
  }

  scored.sort((a, b) => b.score - a.score);

  // De-duplicate by href, keep best score.
  const seen = new Set<string>();
  const out: SearchResult[] = [];
  for (const { result } of scored) {
    if (seen.has(result.href)) continue;
    seen.add(result.href);
    out.push(result);
    if (out.length >= limit) break;
  }
  return out;
}
