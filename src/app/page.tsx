import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { HeroClock } from "@/components/HeroClock";
import { WorldClock } from "@/components/WorldClock";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { getPopularCities, cityUrl, timezoneUrl } from "@/lib/locations";
import { TIME_ZONES } from "@/data/timezones";
import { homepageEditorial, homepageFaqs } from "@/data/content";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Current Time Now – Live World Clock | " + siteConfig.name,
    description:
      "See the current time now with a live, server-synchronized clock. Check the time in cities, countries and time zones, convert time zones and explore UTC offsets.",
    path: "/",
    absolute: true,
  }),
};

const heroChips = ["london", "new-york", "paris", "tokyo", "dubai", "sydney"];

export default function HomePage() {
  const popular = getPopularCities();

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero-glow relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-24">
          <HeroClock />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {heroChips.map((slug) => (
              <Link
                key={slug}
                href={cityUrl(slug)}
                className="rounded-full border border-line bg-surface px-3 py-1 text-xs capitalize text-muted transition-colors hover:border-faint hover:text-ink"
              >
                {slug.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- World clock ---------------- */}
      <section
        id="world-clock"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6"
        aria-labelledby="world-clock-heading"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="world-clock-heading" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              World Clock
            </h2>
            <p className="mt-1 text-sm text-muted">
              Compare the live time across major cities. Add or remove places — your selection is saved on this device.
            </p>
          </div>
          <Link href="/time" className="text-sm font-medium text-accent hover:underline">
            Browse all locations →
          </Link>
        </div>
        <WorldClock />
      </section>

      {/* ---------------- Popular cities ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Popular cities</h2>
        <p className="mt-1 text-sm text-muted">
          Live current time, sunrise &amp; sunset and time differences for the world&apos;s most-searched cities.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {popular.map((city) => (
            <Link
              key={city.slug}
              href={cityUrl(city.slug)}
              className="group rounded-xl border border-line bg-surface p-4 transition-colors hover:border-faint"
            >
              <div className="font-medium text-ink group-hover:text-accent">{city.name}</div>
              <div className="text-xs text-faint">{city.country}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Time zones ---------------- */}
      <section
        id="time-zones"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6"
        aria-labelledby="time-zones-heading"
      >
        <h2 id="time-zones-heading" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Time zones
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          The world is split into time zones defined as offsets from UTC and identified by IANA names such as{" "}
          <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">Europe/Paris</code>. Explore the current time in each major zone.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TIME_ZONES.filter((t) => t.popular).map((tz) => (
            <Link
              key={tz.id}
              href={timezoneUrl(tz.slug)}
              className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-faint"
            >
              <span>
                <span className="font-medium text-ink group-hover:text-accent">{tz.label}</span>
                <span className="block text-xs text-faint">{tz.id}</span>
              </span>
              <span className="text-xs text-muted">{tz.region}</span>
            </Link>
          ))}
        </div>
        <div className="mt-5">
          <Link href="/timezone" className="text-sm font-medium text-accent hover:underline">
            View all time zones →
          </Link>
        </div>
      </section>

      {/* ---------------- Time tools ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Time tools</h2>
          <Link href="/tools" className="text-sm font-medium text-accent hover:underline">
            All tools →
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted">Free, instant utilities — no sign-up required.</p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Timer", href: "/timer", desc: "Countdown and focus timer" },
            { label: "Stopwatch", href: "/stopwatch", desc: "Elapsed time with laps" },
            { label: "Calendar", href: "/calendar", desc: "Dates and date calculations" },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:border-faint"
            >
              <span className="block font-medium text-ink group-hover:text-accent">{t.label}</span>
              <span className="mt-1 block text-xs text-faint">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Editorial ---------------- */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Understanding time &amp; time zones
        </h2>
        <div className="mt-6 space-y-8">
          {homepageEditorial.map((item) => (
            <article key={item.heading}>
              <h3 className="text-lg font-semibold text-ink">{item.heading}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Frequently asked questions
        </h2>
        <FAQ items={homepageFaqs} className="mt-6" />
      </section>

      <JsonLd data={faqJsonLd(homepageFaqs)} />
    </>
  );
}


