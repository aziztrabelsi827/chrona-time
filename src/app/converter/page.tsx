import type { Metadata } from "next";
import { Converter } from "@/components/Converter";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Time Zone Converter – Convert Time Between Cities",
  description:
    "Convert the exact time between any two cities or time zones. Account for daylight saving automatically and see the time difference at a glance.",
  path: "/converter",
});

export default function ConverterPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-12 sm:px-6">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Time Zone Converter</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Pick two cities and a time to see the exact converted time. Daylight-saving rules are applied
          automatically using the IANA time-zone database.
        </p>
      </header>
      <div className="mt-8">
        <Converter />
      </div>
    </div>
  );
}
