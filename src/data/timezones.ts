import { CITIES, COUNTRIES } from "./locations";

/**
 * Time-zone data model — kept separate from cities/countries.
 *
 * A time zone is its own entity. Cities reference a time zone; a time zone is
 * NOT represented by a city. The set below is derived deterministically from
 * the zones actually used by cities, plus the universal UTC & GMT zones, so
 * every city's zone always has a corresponding timezone page.
 */
export interface TimeZone {
  /** IANA identifier, e.g. "Europe/Paris" */
  id: string;
  /** Canonical URL slug, e.g. "europe-paris" */
  slug: string;
  /** Display label used in headings & metadata, e.g. "Europe/Paris" / "GMT" */
  label: string;
  /** Broad region, e.g. "Europe", "Asia", "Universal" */
  region: string;
  popular: boolean;
}

const POPULAR_IDS = new Set<string>([
  "UTC",
  "Etc/GMT",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Africa/Tunis",
  "Africa/Cairo",
  "Africa/Johannesburg",
]);

function regionOf(id: string): string {
  if (id === "UTC" || id === "Etc/GMT" || id === "GMT") return "Universal";
  return id.split("/")[0];
}

function labelOf(id: string): string {
  if (id === "Etc/GMT") return "GMT";
  return id;
}

/** Deterministic slug: lowercase, non-alphanumerics → single hyphen. */
export function timezoneSlug(id: string): string {
  if (id === "Etc/GMT") return "gmt";
  return id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Every zone used by a city or declared by a country, plus UTC & GMT.
const ids = new Set<string>(["UTC", "Etc/GMT"]);
for (const c of CITIES) ids.add(c.timezone);
for (const country of COUNTRIES) for (const tz of country.timezones) ids.add(tz);

export const TIME_ZONES: TimeZone[] = Array.from(ids)
  .sort((a, b) => a.localeCompare(b))
  .map((id) => ({
    id,
    slug: timezoneSlug(id),
    label: labelOf(id),
    region: regionOf(id),
    popular: POPULAR_IDS.has(id),
  }));

export const TIMEZONE_REGIONS: string[] = Array.from(
  new Set(TIME_ZONES.map((t) => t.region))
).sort();
