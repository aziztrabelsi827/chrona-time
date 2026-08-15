import Link from "next/link";
import { SearchTrigger } from "@/components/SearchTrigger";
import { siteConfig } from "@/config/site";
import { cityUrl } from "@/lib/locations";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28">
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-faint">Error 404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        The time you&apos;re looking for may be in another time zone. Search for a city or country, or head
        back to the current time.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
        >
          Go to Current Time
        </Link>
        <SearchTrigger />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {siteConfig.popularCities.slice(0, 6).map((slug) => (
          <Link
            key={slug}
            href={cityUrl(slug)}
            className="rounded-full border border-line bg-surface px-3 py-1 text-xs capitalize text-muted transition-colors hover:text-ink"
          >
            {slug.replace(/-/g, " ")}
          </Link>
        ))}
      </div>
    </div>
  );
}
