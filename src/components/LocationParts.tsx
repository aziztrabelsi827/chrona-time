import Link from "next/link";
import type { ReactNode } from "react";
import { Clock } from "@/components/Clock";
import { SyncStatus } from "@/components/SyncStatus";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/config/site";
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, webpageJsonLd } from "@/lib/seo";

/** Shared layout pieces for country / city / timezone pages. */

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">{children}</div>;
}

export function ClockPanel({ zone, label }: { zone: string; label: string }) {
  return (
    <div className="mt-8 rounded-2xl border border-line bg-surface px-6 py-10 text-center shadow-soft">
      <Clock
        timeZone={zone}
        showSeconds
        showDate
        showOffset
        sizeClass="text-[clamp(2.75rem,12vw,6.5rem)]"
        label={label}
      />
      <div className="mt-4 flex justify-center">
        <SyncStatus />
      </div>
    </div>
  );
}

export function FactsGrid({ facts }: { facts: { label: string; value: string }[] }) {
  return (
    <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
      {facts.map((f) => (
        <div key={f.label} className="bg-surface p-4">
          <dt className="text-xs font-medium uppercase tracking-wider text-faint">{f.label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ContentBlocks({
  intro,
  sections,
}: {
  intro: string[];
  sections: { heading: string; body: string }[];
}) {
  return (
    <section className="mt-12 space-y-6">
      {intro.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed text-muted">
          {p}
        </p>
      ))}
      {sections.map((s) => (
        <article key={s.heading}>
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{s.heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
        </article>
      ))}
    </section>
  );
}

export function RelatedLinks({ links }: { links: { name: string; href: string; sub: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="group rounded-xl border border-line bg-surface p-4 transition-colors hover:border-faint"
        >
          <span className="block font-medium text-ink group-hover:text-accent">{l.name}</span>
          <span className="block text-xs text-faint">{l.sub}</span>
        </Link>
      ))}
    </div>
  );
}

interface StructuredDataProps {
  name: string;
  description: string;
  /** Canonical relative path of this page. */
  path: string;
  /** Visible breadcrumb items (relative hrefs); Home is prepended. */
  crumbs: { name: string; href: string }[];
  faqs: { question: string; answer: string }[];
}

export function StructuredData({ name, description, path, crumbs, faqs }: StructuredDataProps) {
  const url = absoluteUrl(path);
  return (
    <>
      <JsonLd data={webpageJsonLd(name, description, url)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          ...crumbs.map((c) => ({ name: c.name, url: absoluteUrl(c.href) })),
        ])}
      />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
