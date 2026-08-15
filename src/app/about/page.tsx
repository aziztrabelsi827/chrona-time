import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About " + siteConfig.name,
  description: `${siteConfig.name} is a free, independent time utility. See a live, server-synchronized clock and explore the current time in the cities, countries and time zones it covers — powered by the IANA time-zone database.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">About {siteConfig.name}</h1>
      <div className="prose-custom mt-6 space-y-5 text-sm leading-relaxed text-muted">
        <p>
          {siteConfig.name} is a free, independent time utility built to answer one question as accurately as
          possible: <span className="text-ink">what time is it, right now?</span> Our clock is synchronized
          with our server and recalculated on every tick, so it stays accurate. If synchronization is
          temporarily unavailable, it falls back to your device&apos;s clock.
        </p>
        <p>
          Every time zone on {siteConfig.name} is derived live from the <strong className="text-ink">IANA
          time-zone database</strong> — the same standard used by operating systems worldwide. We never
          hard-code offsets like UTC+1, because daylight-saving rules and time-zone laws change. Instead, the
          correct offset is computed for the exact instant you are viewing.
        </p>
        <p>
          We care about speed and privacy. The site is built with server-side rendering and minimal
          JavaScript so pages load almost instantly, and we do not require an account or any personal data to
          show you the time.
        </p>
        <h2 className="text-lg font-semibold text-ink">What we offer</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>A live, server-synchronized clock for your location.</li>
          <li>World clock with customisable favourite cities.</li>
          <li>Detailed time pages for cities, countries and time zones, with sunrise, sunset and time differences.</li>
          <li>A time-zone converter that respects daylight saving.</li>
        </ul>
        <p>
          Questions or feedback? <Link className="text-accent hover:underline" href="/contact">Get in touch</Link>.
        </p>
      </div>
    </div>
  );
}
