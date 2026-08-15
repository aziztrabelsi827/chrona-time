import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TIME_ZONES } from "@/data/timezones";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { CopyTimeButton } from "@/components/CopyTimeButton";
import { LiveCityGrid } from "@/components/LiveCityGrid";
import { FAQ } from "@/components/FAQ";
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
  getTimeZone,
  getCitiesForTimeZone,
  getCountriesForTimeZone,
  getRelatedTimeZones,
  timezoneUrl,
  countryUrl,
} from "@/lib/locations";
import { generateTimeZoneContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getOffsetMinutes, getTimeZoneLongName, formatOffset } from "@/lib/time";

export const dynamicParams = false;

export function generateStaticParams() {
  return TIME_ZONES.map((t) => ({ slug: t.slug }));
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tz = getTimeZone(slug);
  if (!tz) {
    return buildMetadata({ title: "Time zone not found", description: "", path: timezoneUrl(slug), noIndex: true });
  }
  return buildMetadata({
    title: `${tz.label} Time – Current Time, UTC Offset & DST`,
    description: `Current time in the ${tz.label} time zone (${tz.id}). See the exact time, UTC offset, daylight-saving status and the major cities that use ${tz.label}.`,
    path: timezoneUrl(slug),
  });
}

export default async function TimezonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tz = getTimeZone(slug);
  if (!tz) notFound();

  const content = generateTimeZoneContent(tz);
  const tzName = getTimeZoneLongName(tz.id);
  const offsets = offsetInfo(tz.id);
  const crumbs = [
    { name: "Time Zones", href: "/timezone" },
    { name: tz.label, href: timezoneUrl(tz.slug) },
  ];
  const cities = getCitiesForTimeZone(tz.id);
  const tzCountries = getCountriesForTimeZone(tz.id);
  const related = getRelatedTimeZones(tz.id);

  return (
    <PageShell>
      <Breadcrumbs items={crumbs} />

      <header className="mt-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-faint">{tz.region}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {tz.label} Time
          </h1>
        </div>
        <div className="mt-1 flex shrink-0 items-center gap-2">
          <CopyTimeButton timeZone={tz.id} />
          <ShareButton label={`Current time in ${tz.label}`} timeZone={tz.id} />
        </div>
      </header>

      <ClockPanel zone={tz.id} label={`Current time in ${tz.label}`} />

      <FactsGrid
        facts={[
          { label: "Long name", value: tzName },
          { label: "IANA identifier", value: tz.id },
          { label: "Standard offset", value: formatOffset(offsets.standard) },
          {
            label: "Daylight saving",
            value: offsets.observesDst
              ? `Yes · ${formatOffset(offsets.summer)} in summer`
              : "Not observed",
          },
        ]}
      />

      <Section title={`Cities using ${tz.label}`}>
        <LiveCityGrid cities={cities} />
      </Section>

      {tzCountries.length > 0 && (
        <Section title={`Countries in the ${tz.label} time zone`}>
          <RelatedLinks
            links={tzCountries.map((c) => ({
              name: c.name,
              href: countryUrl(c.slug),
              sub: c.continent,
            }))}
          />
        </Section>
      )}

      <ContentBlocks intro={content.intro} sections={content.sections} />

      <Section title={`${tz.label} — frequently asked questions`}>
        <FAQ items={content.faqs} />
      </Section>

      {related.length > 0 && (
        <Section title="Related time zones">
          <RelatedLinks
            links={related.map((r) => ({ name: r.label, href: timezoneUrl(r.slug), sub: r.region }))}
          />
        </Section>
      )}

      <StructuredData
        name={`${tz.label} Time`}
        description={content.intro[0]}
        path={timezoneUrl(tz.slug)}
        crumbs={crumbs}
        faqs={content.faqs}
      />
    </PageShell>
  );
}
