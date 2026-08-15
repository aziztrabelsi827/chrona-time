import { CITIES, COUNTRIES } from "@/data/locations";
import { TIME_ZONES } from "@/data/timezones";
import { isValidTimeZone } from "@/lib/time";
import { countryUrl, cityUrl, timezoneUrl } from "@/lib/locations";

export interface ValidationIssue {
  type: string;
  message: string;
}

/**
 * Reusable data-integrity check. Verifies uniqueness of slugs/codes/routes and
 * referential integrity between cities, countries and time zones.
 *
 * Throws (fails loudly) if any problem is found, so it can be wired into the
 * build to prevent bad data from shipping.
 */
export function validateData(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const push = (type: string, message: string) => issues.push({ type, message });

  // Country slugs unique.
  const countrySlugs = countBy(COUNTRIES.map((c) => c.slug));
  for (const [slug, n] of countrySlugs) {
    if (n > 1) push("duplicate-country-slug", `Country slug "${slug}" appears ${n} times.`);
  }

  // Country codes unique.
  const countryCodes = countBy(COUNTRIES.map((c) => c.code));
  for (const [code, n] of countryCodes) {
    if (n > 1) push("duplicate-country-code", `Country code "${code}" appears ${n} times.`);
  }

  // City slugs unique.
  const citySlugs = countBy(CITIES.map((c) => c.slug));
  for (const [slug, n] of citySlugs) {
    if (n > 1) push("duplicate-city-slug", `City slug "${slug}" appears ${n} times.`);
  }

  // Every city references an existing country.
  const codeSet = new Set(COUNTRIES.map((c) => c.code));
  for (const c of CITIES) {
    if (!codeSet.has(c.countryCode)) {
      push("missing-country", `City "${c.slug}" references unknown countryCode "${c.countryCode}".`);
    }
  }

  // Time-zone ids valid; every city zone has a timezone page.
  const tzById = new Set(TIME_ZONES.map((t) => t.id));
  for (const t of TIME_ZONES) {
    if (!isValidTimeZone(t.id)) push("invalid-timezone-id", `Time zone id "${t.id}" is not a valid IANA zone.`);
  }
  for (const c of CITIES) {
    if (!isValidTimeZone(c.timezone)) {
      push("invalid-city-timezone", `City "${c.slug}" has invalid timezone "${c.timezone}".`);
    }
    if (!tzById.has(c.timezone)) {
      push("missing-timezone-page", `City "${c.slug}" uses "${c.timezone}" which has no timezone page.`);
    }
  }

  // Country time zones: non-empty, valid IANA id, has a page, no duplicates.
  for (const country of COUNTRIES) {
    if (!Array.isArray(country.timezones) || country.timezones.length === 0) {
      push("empty-country-timezones", `Country "${country.slug}" declares no time zones.`);
      continue;
    }
    const seenTz = new Set<string>();
    for (const tz of country.timezones) {
      if (seenTz.has(tz)) {
        push("duplicate-country-timezone", `Country "${country.slug}" lists "${tz}" more than once.`);
      }
      seenTz.add(tz);
      if (!isValidTimeZone(tz)) {
        push("invalid-country-timezone", `Country "${country.slug}" has invalid time zone "${tz}".`);
      }
      if (!tzById.has(tz)) {
        push("missing-timezone-page", `Country "${country.slug}" uses "${tz}" which has no timezone page.`);
      }
    }
  }

  // Coordinates valid.
  for (const c of CITIES) {
    if (!Number.isFinite(c.lat) || c.lat < -90 || c.lat > 90) {
      push("invalid-coordinates", `City "${c.slug}" has invalid latitude ${c.lat}.`);
    }
    if (!Number.isFinite(c.lng) || c.lng < -180 || c.lng > 180) {
      push("invalid-coordinates", `City "${c.slug}" has invalid longitude ${c.lng}.`);
    }
  }
  for (const country of COUNTRIES) {
    if (!Number.isFinite(country.lat) || country.lat < -90 || country.lat > 90) {
      push("invalid-coordinates", `Country "${country.slug}" has invalid latitude ${country.lat}.`);
    }
    if (!Number.isFinite(country.lng) || country.lng < -180 || country.lng > 180) {
      push("invalid-coordinates", `Country "${country.slug}" has invalid longitude ${country.lng}.`);
    }
  }

  // Country codes are two uppercase letters.
  for (const c of COUNTRIES) {
    if (!/^[A-Z]{2}$/.test(c.code)) {
      push("invalid-country-code", `Country "${c.slug}" has invalid code "${c.code}".`);
    }
  }

  // A declared capital (optional) must reference an existing city that belongs
  // to the country. Capital is omitted for some countries (e.g. disputed cases).
  const cityBySlug = new Map(CITIES.map((c) => [c.slug, c]));
  for (const country of COUNTRIES) {
    if (country.capital) {
      const capital = cityBySlug.get(country.capital);
      if (!capital) {
        push("missing-capital", `Country "${country.slug}" capital "${country.capital}" is not a known city.`);
      } else if (capital.countryCode !== country.code) {
        push("capital-mismatch", `Country "${country.slug}" capital "${country.capital}" does not belong to it.`);
      }
    }

    // The geographic reference city (explicit override, else the capital) must
    // exist, belong to the country, and use one of the country's declared zones.
    const refSlug = country.referenceCitySlug ?? country.capital;
    if (!refSlug) {
      push("missing-reference-city", `Country "${country.slug}" has no reference city or capital.`);
    } else {
      const ref = cityBySlug.get(refSlug);
      if (!ref) {
        push("missing-reference-city", `Country "${country.slug}" reference city "${refSlug}" is not a known city.`);
      } else if (ref.countryCode !== country.code) {
        push("reference-city-mismatch", `Country "${country.slug}" reference city "${refSlug}" does not belong to it.`);
      } else if (!country.timezones.includes(ref.timezone)) {
        push("reference-city-timezone", `Country "${country.slug}" reference city "${refSlug}" uses "${ref.timezone}", which is not in the country's declared time zones.`);
      }
    }
  }

  // Time-zone slugs unique.
  const tzSlugs = countBy(TIME_ZONES.map((t) => t.slug));
  for (const [slug, n] of tzSlugs) {
    if (n > 1) push("duplicate-timezone-slug", `Time zone slug "${slug}" appears ${n} times.`);
  }

  // Every canonical route unique across all entity types.
  const routes: string[] = [
    ...COUNTRIES.map((c) => countryUrl(c.slug)),
    ...CITIES.map((c) => cityUrl(c.slug)),
    ...TIME_ZONES.map((t) => timezoneUrl(t.slug)),
  ];
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const r of routes) {
    if (seen.has(r)) dups.add(r);
    seen.add(r);
  }
  if (dups.size > 0) {
    push("duplicate-canonical-route", `Duplicate canonical routes: ${Array.from(dups).join(", ")}.`);
  }

  return issues;
}

/** Runs {@link validateData} and throws if any issue is found. */
export function assertValidData(): void {
  const issues = validateData();
  if (issues.length > 0) {
    const detail = issues.map((i) => `  [${i.type}] ${i.message}`).join("\n");
    throw new Error(
      `Location data validation failed with ${issues.length} issue(s):\n${detail}`
    );
  }
}

function countBy(values: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}
