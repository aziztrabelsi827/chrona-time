import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { TIME_ZONES, TIMEZONE_REGIONS } from "@/data/timezones";
import { timezoneUrl } from "@/lib/locations";

export const metadata: Metadata = buildMetadata({
  title: "Time Zones – Current Time & UTC Offsets",
  description:
    "Browse every time zone we cover. Each page shows the live current time, UTC offset, daylight-saving status and the cities that use the zone.",
  path: "/timezone",
});

export default function TimezoneIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Time zones</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Live current time, UTC offset and daylight-saving status for every time zone, identified by its
          IANA name.
        </p>
      </header>

      {TIMEZONE_REGIONS.map((region) => {
        const zones = TIME_ZONES.filter((t) => t.region === region);
        if (zones.length === 0) return null;
        return (
          <section key={region} className="mt-12">
            <h2 className="text-xl font-semibold tracking-tight text-ink">{region}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {zones.map((tz) => (
                <Link
                  key={tz.id}
                  href={timezoneUrl(tz.slug)}
                  className="group rounded-xl border border-line bg-surface p-4 transition-colors hover:border-faint"
                >
                  <span className="block font-medium text-ink group-hover:text-accent">{tz.label}</span>
                  <span className="block text-xs text-faint">{tz.id}</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
