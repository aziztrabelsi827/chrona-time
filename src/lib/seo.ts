import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface BuildMetadataInput {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  /** Bypass the global title template (use the full title verbatim). */
  absolute?: boolean;
}

const siteUrl = siteConfig.url;

/** Centralized Next.js metadata builder so every route emits consistent SEO. */
export function buildMetadata({
  title,
  description,
  path = "/",
  type = "website",
  noIndex = false,
  absolute = false,
}: BuildMetadataInput): Metadata {
  const url = `${siteUrl}${path === "/" ? "" : path}`;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      // hreflang scaffolding — ready for future multilingual expansion.
      languages: {
        "en": url,
        "x-default": url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: siteConfig.social.twitter,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Build an absolute canonical URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${path === "/" ? "" : path}`;
}

/* ---------------------------- JSON-LD builders ---------------------------- */

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteUrl,
  description: siteConfig.description,
  // No SearchAction is declared: search is a client-side command palette and
  // there is no indexable search-results URL, so exposing one would be
  // misleading structured data.
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteUrl,
  email: siteConfig.contactEmail,
};

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function webpageJsonLd(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteUrl },
    publisher: { "@type": "Organization", name: siteConfig.name },
  };
}
