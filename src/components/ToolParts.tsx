import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, webpageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export interface EditorialSection {
  heading: string;
  body: string;
}

interface ToolLayoutProps {
  title: string;
  intro: string;
  /** Canonical site-relative path (e.g. "/timer"). */
  path: string;
  /** The interactive tool component. */
  children: ReactNode;
  /** Optional server-rendered explanatory content. */
  sections?: EditorialSection[];
  /** Optional contextual internal links. */
  links?: { label: string; href: string }[];
}

/**
 * Shared layout for the standalone tool pages. Server-rendered (SEO content
 * stays crawlable); only `children` is the interactive client component.
 */
export function ToolLayout({
  title,
  intro,
  path,
  children,
  sections = [],
  links = [],
}: ToolLayoutProps) {
  const crumbs = [
    { name: "Tools", href: "/tools" },
    { name: title, href: path },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <Breadcrumbs items={crumbs} />

      <header className="mt-5 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{intro}</p>
      </header>

      <div className="mt-8">{children}</div>

      {sections.length > 0 && (
        <section className="mt-12 space-y-7">
          {sections.map((s) => (
            <article key={s.heading}>
              <h2 className="text-lg font-semibold text-ink">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </article>
          ))}
        </section>
      )}

      {links.length > 0 && (
        <nav aria-label="Related tools" className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}

      <JsonLd data={webpageJsonLd(title, intro, absoluteUrl(path))} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "Tools", url: absoluteUrl("/tools") },
          { name: title, url: absoluteUrl(path) },
        ])}
      />
    </div>
  );
}
