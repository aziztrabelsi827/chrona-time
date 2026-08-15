import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted">
              {siteConfig.name} shows live, server-synchronized current time for the cities, countries and
              time zones it covers — derived live from the IANA time-zone database.
            </p>
          </div>

          <nav aria-label="Explore" className="text-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">Explore</h2>
            <ul className="space-y-2">
              <li><Link className="text-muted hover:text-ink" href="/">Current Time</Link></li>
              <li><Link className="text-muted hover:text-ink" href="/#world-clock">World Clock</Link></li>
              <li><Link className="text-muted hover:text-ink" href="/timezone">Time Zones</Link></li>
              <li><Link className="text-muted hover:text-ink" href="/converter">Time Converter</Link></li>
              <li><Link className="text-muted hover:text-ink" href="/tools">All Tools</Link></li>
            </ul>
          </nav>

          <nav aria-label="Time tools" className="text-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">Time Tools</h2>
            <ul className="space-y-2">
              <li><Link className="text-muted hover:text-ink" href="/timer">Timer</Link></li>
              <li><Link className="text-muted hover:text-ink" href="/stopwatch">Stopwatch</Link></li>
              <li><Link className="text-muted hover:text-ink" href="/calendar">Calendar</Link></li>
            </ul>
          </nav>

          <nav aria-label="Locations" className="text-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">Locations</h2>
            <ul className="space-y-2">
              <li><Link className="text-muted hover:text-ink" href="/time#countries">Countries</Link></li>
              <li><Link className="text-muted hover:text-ink" href="/time#cities">Cities</Link></li>
              <li><Link className="text-muted hover:text-ink" href="/time">All Locations</Link></li>
              <li><Link className="text-muted hover:text-ink" href="/about">About</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company" className="text-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">Company</h2>
            <ul className="space-y-2">
              <li><Link className="text-muted hover:text-ink" href="/contact">Contact</Link></li>
              <li><Link className="text-muted hover:text-ink" href="/privacy">Privacy</Link></li>
              <li><Link className="text-muted hover:text-ink" href="/terms">Terms</Link></li>
              <li>
                <a className="text-muted hover:text-ink" href={`mailto:${siteConfig.contactEmail}`}>
                  Email us
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center">
          <p>© {year} {siteConfig.name}. All times are derived live from the IANA time-zone database.</p>
          <p>Built by Aziz Trabelsi.</p>
        </div>
      </div>
    </footer>
  );
}
