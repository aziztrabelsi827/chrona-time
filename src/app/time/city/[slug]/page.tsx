import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CITIES, type City, type Country } from "@/data/locations";
import { siteConfig } from "@/config/site";
import { SunTimes } from "@/components/SunTimes";
import { TimeDifferences } from "@/components/TimeDifferences";
import { FAQ } from "@/components/FAQ";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { CopyTimeButton } from "@/components/CopyTimeButton";
import {
  PageShell,
  ClockPanel,
  FactsGrid,
  Section,
  ContentBlocks,
  RelatedLinks,
  StructuredData,
} from "@/components/LocationParts";
import {
  getCity,
  getCountryForCity,
  getCitiesForCountry,
  getPopularCountries,
  cityUrl,
  countryUrl,
  timezoneUrl,
  timezoneSlug,
} from "@/lib/locations";
import { generateCityContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getOffsetMinutes, getTimeZoneLongName, formatOffset } from "@/lib/time";

export const dynamicParams = false;

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

function offsetInfo(zone: string) {
  const y = new Date().getUTCFullYear();
  const jan = getOffsetMinutes(zone, new Date(Date.UTC(y, 0, 15, 12)));
  const jul = getOffsetMinutes(zone, new Date(Date.UTC(y, 6, 15, 12)));
  return {
    standard: Math.min(jan, jul),
    summer: Math.max(jan, jul),
    observesDst: jan !== jul,
  };
}

function referenceCities(excludeSlug?: string) {
  return siteConfig.referenceCities
    .map((slug) => CITIES.find((c) => c.slug === slug))
    .filter((c): c is City => !!c && c.slug !== excludeSlug)
    .map((c) => ({ name: c.name, slug: c.slug, timezone: c.timezone }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) {
    return buildMetadata({ title: "Location not found", description: "", path: cityUrl(slug), noIndex: true });
  }
  const country = getCountryForCity(city);
  const countryName = country?.name ?? city.country;
  return buildMetadata({
    title: `Current Time in ${city.name}, ${countryName} – Exact Time Now`,
    description: `Check the current time in ${city.name}, ${countryName}. See the exact local time, time zone, UTC offset, date and time difference with major cities.`,
    path: cityUrl(slug),
  });
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();
  const country = getCountryForCity(city);
  if (!country) notFound();

  const content = generateCityContent(city, country);
  const tzName = getTimeZoneLongName(city.timezone);
  const offsets = offsetInfo(city.timezone);
  const crumbs = [
    { name: "Countries", href: "/time" },
    { name: country.name, href: countryUrl(country.slug) },
    { name: city.name, href: cityUrl(city.slug) },
  ];
  const related = getCitiesForCountry(country.slug).filter((c) => c.slug !== city.slug);
  const popularCountries = getPopularCountries()
    .filter((c) => c.slug !== country.slug)
    .slice(0, 6);

  return (
    <PageShell>
      <Breadcrumbs items={crumbs} />

      <header className="mt-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-faint">
            {country.name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Current Time in {city.name}, {country.name}
          </h1>
        </div>
        <div className="mt-1 flex shrink-0 items-center gap-2">
          <CopyTimeButton timeZone={city.timezone} />
          <ShareButton
            label={`Current time in ${city.name}, ${country.name}`}
            timeZone={city.timezone}
          />
        </div>
      </header>

      <ClockPanel zone={city.timezone} label={`Current time in ${city.name}, ${country.name}`} />

      <p className="mt-4 text-sm text-muted">
        <Link href={timezoneUrl(timezoneSlug(city.timezone))} className="font-medium text-accent hover:underline">
          View the {city.timezone} time zone →
        </Link>
      </p>

      <FactsGrid
        facts={[
          { label: "Time zone", value: tzName },
          { label: "IANA identifier", value: city.timezone },
          { label: "Standard offset", value: formatOffset(offsets.standard) },
          {
            label: "Daylight saving",
            value: offsets.observesDst
              ? `Yes · ${formatOffset(offsets.summer)} in summer`
              : "Not observed",
          },
          { label: "Country", value: country.name },
          { label: "Coordinates", value: `${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}°` },
        ]}
      />

      <Section title="Sunrise & sunset">
        <p className="mb-4 text-sm text-muted">
          Calculated for {city.name}&apos;s coordinates — updated for today.
        </p>
        <SunTimes lat={city.lat} lng={city.lng} timeZone={city.timezone} />
      </Section>

      <Section title={`Time difference from ${city.name}`}>
        <TimeDifferences baseZone={city.timezone} cities={referenceCities(city.slug)} />
      </Section>

      <ContentBlocks intro={content.intro} sections={content.sections} />

      <Section title={`${city.name} time — frequently asked questions`}>
        <FAQ items={content.faqs} />
      </Section>

      {related.length > 0 && (
        <Section title={`Other cities in ${country.name}`}>
          <RelatedLinks
            links={related.map((c) => ({ name: c.name, href: cityUrl(c.slug), sub: c.country }))}
          />
        </Section>
      )}

      <Section title="Popular countries">
        <RelatedLinks
          links={popularCountries.map((c) => ({
            name: c.name,
            href: countryUrl(c.slug),
            sub: c.continent,
          }))}
        />
      </Section>

      <StructuredData
        name={`Current Time in ${city.name}, ${country.name}`}
        description={content.intro[0]}
        path={cityUrl(city.slug)}
        crumbs={crumbs}
        faqs={content.faqs}
      />
    </PageShell>
  );
}


