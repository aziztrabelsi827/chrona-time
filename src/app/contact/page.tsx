import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with the ${siteConfig.name} team. We welcome feedback, corrections and feature suggestions.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Contact</h1>
      <p className="mt-3 text-sm text-muted">
        Found a mistake in a city&apos;s time, or have an idea to make {siteConfig.name} better? We&apos;d love
        to hear from you.
      </p>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <p className="text-sm text-muted">Email us at</p>
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="mt-1 inline-block text-lg font-medium text-accent hover:underline"
        >
          {siteConfig.contactEmail}
        </a>
        <p className="mt-4 text-xs text-faint">
          {siteConfig.name} is an independent time utility. Response times may vary.
        </p>
      </div>
    </div>
  );
}
