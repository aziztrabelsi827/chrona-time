import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { SearchTrigger } from "@/components/SearchTrigger";
import {
  getCountriesByContinent,
  getCitiesByContinent,
  CONTINENT_ORDER,
  countryUrl,
  cityUrl,
} from "@/lib/locations";

export const metadata: Metadata = buildMetadata({
  title: "All Locations – Current Time in Every City & Country",
  description:
    "Browse the current time in the cities and countries covered by Chrona Time. Explore live clocks, time zones, UTC offsets and sunrise times on every continent.",
  path: "/time",
});

export default function BrowsePage() {
  const countriesByContinent = getCountriesByContinent();
  const citiesByContinent = getCitiesByContinent();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Current time by location
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Browse every city and country we cover. Each page shows a live clock, the UTC offset, sunrise &amp;
          sunset and the time difference to major world cities.
        </p>
        <div className="mt-6 flex justify-center">
          <SearchTrigger />
        </div>
      </header>

      <div id="countries" className="scroll-mt-20">
      {CONTINENT_ORDER.map((continent) => {
        const countries = countriesByContinent[continent];
        if (countries.length === 0) return null;
        return (
          <section key={continent} className="mt-12">
            <h2 className="text-xl font-semibold tracking-tight text-ink">{continent}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {countries.map((country) => (
                <Link
                  key={country.slug}
                  href={countryUrl(country.slug)}
                  className="group rounded-xl border border-line bg-surface p-4 transition-colors hover:border-faint"
                >
                  <span className="block font-medium text-ink group-hover:text-accent">
                    {country.name}
                  </span>
                  <span className="block text-xs text-faint">
                    {country.timezones.length === 1
                      ? country.timezones[0]
                      : `${country.timezones.length} time zones`}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      </div>

      <section id="cities" className="mt-14 scroll-mt-20">
        <h2 className="text-xl font-semibold tracking-tight text-ink">All cities</h2>
        <div className="mt-4 columns-2 gap-6 sm:columns-3 lg:columns-4">
          {CONTINENT_ORDER.flatMap((c) => citiesByContinent[c]).map((city) => (
            <Link
              key={city.slug}
              href={cityUrl(city.slug)}
              className="mb-1.5 block break-inside-avoid text-sm text-muted hover:text-accent"
            >
              {city.name}, <span className="text-faint">{city.country}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
