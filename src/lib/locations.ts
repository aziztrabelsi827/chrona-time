import { CITIES, COUNTRIES, type City, type Country, type Continent } from "@/data/locations";
import { TIME_ZONES, timezoneSlug } from "@/data/timezones";

export type { City, Country, Continent };
export { TIME_ZONES, timezoneSlug };
export type { TimeZone } from "@/data/timezones";

const cityBySlug = new Map<string, City>(CITIES.map((c) => [c.slug, c]));
const countryBySlug = new Map<string, Country>(COUNTRIES.map((c) => [c.slug, c]));
const countryByCode = new Map<string, Country>(COUNTRIES.map((c) => [c.code, c]));
const tzBySlug = new Map(TIME_ZONES.map((t) => [t.slug, t]));
const tzById = new Map(TIME_ZONES.map((t) => [t.id, t]));

/* ------------------------------ URL helpers ------------------------------ */
/** Relative canonical paths. Centralized so entity URLs are consistent. */
export const countryUrl = (slug: string) => `/time/country/${slug}`;
export const cityUrl = (slug: string) => `/time/city/${slug}`;
export const timezoneUrl = (slug: string) => `/timezone/${slug}`;

/* ------------------------------ Lookups ---------------------------------- */
export function getCity(slug: string): City | undefined {
  return cityBySlug.get(slug);
}

export function getCountry(slug: string): Country | undefined {
  return countryBySlug.get(slug);
}

export function getCountryByCode(code: string): Country | undefined {
  return countryByCode.get(code.toUpperCase());
}

export function getCountryForCity(city: City): Country | undefined {
  return countryByCode.get(city.countryCode);
}

export function getCitiesForCountry(countrySlug: string): City[] {
  const country = countryBySlug.get(countrySlug);
  if (!country) return [];
  return CITIES.filter((c) => c.countryCode === country.code).sort((a, b) =>
    a.slug === country.capital ? -1 : b.slug === country.capital ? 1 : 0
  );
}

/** The slug used as a country's geographic reference (explicit override, else capital). */
export function getReferenceCitySlug(country: Country): string | undefined {
  return country.referenceCitySlug ?? country.capital;
}

/** The city used for country-level geography (sunrise/sunset, representative location). */
export function getReferenceCity(country: Country): City | undefined {
  const slug = getReferenceCitySlug(country);
  return slug ? cityBySlug.get(slug) : undefined;
}

export function getTimeZone(slug: string) {
  return tzBySlug.get(slug);
}

export function getTimeZoneById(id: string) {
  return tzById.get(id);
}

/** Cities that observe a given IANA time zone. */
export function getCitiesForTimeZone(id: string): City[] {
  return CITIES.filter((c) => c.timezone === id).sort(
    (a, b) => (b.population ?? 0) - (a.population ?? 0)
  );
}

/** IANA zones that apply across a country (looked up by country code). */
export function getTimeZonesForCountry(code: string): string[] {
  const country = countryByCode.get(code.toUpperCase());
  return country ? [...country.timezones] : [];
}

/** Countries whose territory includes a given IANA time zone. */
export function getCountriesForTimeZone(id: string): Country[] {
  return COUNTRIES.filter((c) => c.timezones.includes(id));
}

/** Other time zones, preferring the same region. */
export function getRelatedTimeZones(id: string, limit = 8) {
  const self = tzById.get(id);
  if (!self) return [];
  const sameRegion = TIME_ZONES.filter(
    (t) => t.id !== id && t.region === self.region
  );
  if (sameRegion.length >= limit) return sameRegion.slice(0, limit);
  const others = TIME_ZONES.filter(
    (t) => t.id !== id && t.region !== self.region && t.popular
  );
  return [...sameRegion, ...others].slice(0, limit);
}

export function getPopularCities(): City[] {
  return CITIES.filter((c) => c.popular);
}

export function getPopularCountries(): Country[] {
  return COUNTRIES.filter((c) => c.popular);
}

export function getCitiesByContinent(): Record<Continent, City[]> {
  const groups: Record<Continent, City[]> = {
    Africa: [],
    Europe: [],
    Asia: [],
    "North America": [],
    "South America": [],
    Oceania: [],
  };
  for (const city of CITIES) {
    const country = getCountryForCity(city);
    if (country) groups[country.continent].push(city);
  }
  return groups;
}

export function getCountriesByContinent(): Record<Continent, Country[]> {
  const groups: Record<Continent, Country[]> = {
    Africa: [],
    Europe: [],
    Asia: [],
    "North America": [],
    "South America": [],
    Oceania: [],
  };
  for (const country of COUNTRIES) groups[country.continent].push(country);
  return groups;
}

export const CONTINENT_ORDER: Continent[] = [
  "Africa",
  "Europe",
  "Asia",
  "North America",
  "South America",
  "Oceania",
];


