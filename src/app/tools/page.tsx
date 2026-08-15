import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, webpageJsonLd } from "@/lib/seo";
import { TimerIcon, StopwatchIcon, CalendarIcon, ArrowRightLeftIcon } from "@/components/icons";

export const metadata: Metadata = buildMetadata({
  title: "Time Tools – Timer, Stopwatch & Calendar",
  description:
    "Free online time tools from Chrona Time: an accurate countdown timer, a stopwatch with laps, and a calendar with date difference and add-days calculators.",
  path: "/tools",
});

const TOOLS = [
  { label: "Timer", href: "/timer", desc: "Countdown and focus timer with presets, fullscreen and completion alerts.", Icon: TimerIcon },
  { label: "Stopwatch", href: "/stopwatch", desc: "Measure elapsed time and record lap splits, accurate across tab switches.", Icon: StopwatchIcon },
  { label: "Calendar", href: "/calendar", desc: "Explore dates, weekdays, week numbers and calculate date differences.", Icon: CalendarIcon },
  { label: "Time Converter", href: "/converter", desc: "Compare the current time across cities and time zones.", Icon: ArrowRightLeftIcon },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Tools", href: "/tools" }]} />

      <header className="mt-5 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Time Tools</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Free, accurate time utilities — a countdown timer, a stopwatch with laps, and a calendar with date
          calculators. All run instantly in your browser, no sign-up required.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {TOOLS.map(({ label, href, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-faint"
          >
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-ink group-hover:text-accent">{label}</span>
              <span className="mt-1 block text-sm text-muted">{desc}</span>
            </span>
          </Link>
        ))}
      </div>

      <JsonLd data={webpageJsonLd("Time Tools", "Online timer, stopwatch and calendar tools from " + siteConfig.name, absoluteUrl("/tools"))} />
    </div>
  );
}
