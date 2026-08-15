import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { COUNTRIES, CITIES, type City } from "@/data/locations";
import { siteConfig } from "@/config/site";
import { SunTimes } from "@/components/SunTimes";
import { TimeDifferences } from "@/components/TimeDifferences";
import { FAQ } from "@/components/FAQ";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { CopyTimeButton } from "@/components/CopyTimeButton";
import { CountryTimeZoneGrid } from "@/components/CountryTimeZoneGrid";
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
  getCountry,
  getCitiesForCountry,
  getPopularCountries,
  getReferenceCity,
  getReferenceCitySlug,
  cityUrl,
  countryUrl,
  timezoneUrl,
  timezoneSlug,
} from "@/lib/locations";
import { generateCountryContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import {
  getOffsetMinutes,
  getTimeZoneLongName,
  formatOffset,
} from "@/lib/time";

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ slug: c.slug }));
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

function referenceCities() {
  return siteConfig.referenceCities
    .map((slug) => CITIES.find((c) => c.slug === slug))
    .filter((c): c is City => !!c)
    .map((c) => ({ name: c.name, slug: c.slug, timezone: c.timezone }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountry(slug);
  if (!country) {
    return buildMetadata({ title: "Location not found", description: "", path: countryUrl(slug), noIndex: true });
  }
  const multi = country.timezones.length > 1;
  return buildMetadata({
    title: multi
      ? `Current Time in ${country.name} – Time Zones & Exact Local Times`
      : `Current Time in ${country.name} – Exact Time Now`,
    description: multi
      ? `${country.name} spans ${country.timezones.length} time zones. See the exact local time, UTC offset and daylight-saving status for each zone and major city.`
      : `Check the current time in ${country.name}. See the exact local time, time zone, UTC offset and daylight-saving status.`,
    path: countryUrl(slug),
  });
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getCountry(slug);
  if (!country) notFound();

  const isSingle = country.timezones.length === 1;
  const primaryZone = country.timezones[0];
  const referenceCity = getReferenceCity(country);
  const referenceZone = referenceCity?.timezone ?? primaryZone;
  const referenceName = referenceCity?.name ?? getReferenceCitySlug(country) ?? country.name;
  const referenceLat = referenceCity?.lat ?? country.lat;
  const referenceLng = referenceCity?.lng ?? country.lng;
  const capitalName = country.capital
    ? CITIES.find((c) => c.slug === country.capital)?.name ?? country.capital
    : undefined;

  const content = generateCountryContent(country, referenceName, referenceZone);
  const crumbs = [
    { name: "Countries", href: "/time" },
    { name: country.name, href: countryUrl(country.slug) },
  ];
  const cities = getCitiesForCountry(country.slug);
  const popularCountries = getPopularCountries()
    .filter((c) => c.slug !== country.slug)
    .slice(0, 6);

  // For multi-timezone countries: one representative city per zone (most populous).
  const zoneEntries = isSingle
    ? []
    : country.timezones.map((zone) => {
        const rep = cities
          .filter((c) => c.timezone === zone)
          .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))[0];
        return rep
          ? { zone, cityName: rep.name, citySlug: rep.slug }
          : { zone };
      });

  const singleOffsets = isSingle ? offsetInfo(primaryZone) : null;
  const singleTzName = isSingle ? getTimeZoneLongName(primaryZone) : "";

  return (
    <PageShell>
      <Breadcrumbs items={crumbs} />

      <header className="mt-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-faint">
            {country.continent}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Current Time in {country.name}
          </h1>
        </div>
        <div className="mt-1 flex shrink-0 items-center gap-2">
          <CopyTimeButton timeZone={referenceZone} />
          <ShareButton label={`Current time in ${country.name}`} timeZone={referenceZone} />
        </div>
      </header>

      {isSingle ? (
        <>
          <ClockPanel zone={primaryZone} label={`Current time in ${country.name}`} />

          <p className="mt-4 text-sm text-muted">
            <Link
              href={timezoneUrl(timezoneSlug(primaryZone))}
              className="font-medium text-accent hover:underline"
            >
              View the {primaryZone} time zone →
            </Link>
          </p>

          <FactsGrid
            facts={[
              { label: "Time zone", value: singleTzName },
              { label: "IANA identifier", value: primaryZone },
              { label: "Standard offset", value: formatOffset(singleOffsets!.standard) },
              {
                label: "Daylight saving",
                value: singleOffsets!.observesDst
                  ? `Yes · ${formatOffset(singleOffsets!.summer)} in summer`
                  : "Not observed",
              },
              ...(capitalName ? [{ label: "Capital", value: capitalName }] : []),
              { label: "Calling code", value: country.phoneCode ?? "—" },
            ]}
          />
        </>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {country.name} spans several time zones. The local time depends on each area&apos;s zone —
            see the current time, UTC offset and daylight-saving status for each below.
          </p>

          <div className="mt-4">
            <CountryTimeZoneGrid entries={zoneEntries} />
          </div>

          <FactsGrid
            facts={[
              { label: "Time zones", value: `${country.timezones.length} time zones` },
              ...(capitalName ? [{ label: "Capital", value: capitalName }] : []),
              { label: "Calling code", value: country.phoneCode ?? "—" },
              { label: "Continent", value: country.continent },
            ]}
          />

          <Section title={`Time zones in ${country.name}`}>
            <ul className="space-y-2 rounded-xl border border-line bg-surface p-4 text-sm">
              {country.timezones.map((tz) => {
                const o = offsetInfo(tz);
                return (
                  <li key={tz} className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={timezoneUrl(timezoneSlug(tz))}
                      className="font-medium text-ink hover:text-accent"
                    >
                      {tz}
                    </Link>
                    <span className="text-xs text-muted">
                      {formatOffset(o.standard)} standard
                      {o.observesDst ? ` · ${formatOffset(o.summer)} in summer` : " · no DST"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Section>
        </>
      )}

      <Section title={`Sunrise & sunset in ${referenceName}`}>
        <p className="mb-4 text-sm text-muted">
          Calculated for {referenceName} using its coordinates — updated for today.
        </p>
        <SunTimes lat={referenceLat} lng={referenceLng} timeZone={referenceZone} />
      </Section>

      <Section title={`Time difference from ${referenceName}`}>
        <TimeDifferences baseZone={referenceZone} cities={referenceCities()} />
      </Section>

      <ContentBlocks intro={content.intro} sections={content.sections} />

      <Section title={`${country.name} time — frequently asked questions`}>
        <FAQ items={content.faqs} />
      </Section>

      {cities.length > 0 && (
        <Section title={`Cities in ${country.name}`}>
          {isSingle ? (
            <RelatedLinks
              links={cities.map((c) => ({ name: c.name, href: cityUrl(c.slug), sub: c.country }))}
            />
          ) : (
            <div className="space-y-6">
              {country.timezones.map((zone) => {
                const zoneCities = cities.filter((c) => c.timezone === zone);
                if (zoneCities.length === 0) return null;
                return (
                  <div key={zone}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">
                      {getTimeZoneLongName(zone)} · {zone}
                    </p>
                    <RelatedLinks
                      links={zoneCities.map((c) => ({
                        name: c.name,
                        href: cityUrl(c.slug),
                        sub: c.country,
                      }))}
                    />
                  </div>
                );
              })}
            </div>
          )}
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
        name={`Current Time in ${country.name}`}
        description={content.intro[0]}
        path={countryUrl(country.slug)}
        crumbs={crumbs}
        faqs={content.faqs}
      />
    </PageShell>
  );
}
