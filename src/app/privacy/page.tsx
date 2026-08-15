import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.name} handles data. We aim to collect as little as possible and never sell your information.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-faint">Last updated: {new Date().getFullYear()}</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted">
        <p>
          {siteConfig.name} is designed to be privacy-friendly. This page explains, in plain language, how the
          site works and what data is involved.
        </p>
        <h2 className="text-lg font-semibold text-ink">Information we collect</h2>
        <p>
          To display your local time, the site reads your device&apos;s clock and detected time zone directly in
          your browser. This information never leaves your device. We do not require an account, and we do not
          ask for your name, email or location permissions to show the time.
        </p>
        <p>
          Your world-clock preferences are stored locally in your browser using localStorage. They are not sent
          to our servers.
        </p>
        <h2 className="text-lg font-semibold text-ink">Analytics</h2>
        <p>
          If configured, we may use privacy-respecting analytics (such as Google Analytics 4) to understand
          aggregate traffic and improve the product. Analytics is only enabled when a measurement ID is set by
          the site operator and is governed by the provider&apos;s own privacy policy.
        </p>
        <h2 className="text-lg font-semibold text-ink">Cookies</h2>
        <p>
          The site itself uses minimal local storage for preferences (such as your theme and chosen cities).
          Third-party analytics may set cookies if enabled.
        </p>
        <h2 className="text-lg font-semibold text-ink">Contact</h2>
        <p>
          For privacy questions, email <a className="text-accent hover:underline" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
        <p className="text-faint">
          This is a template privacy policy. Replace it with reviewed legal wording before launch.
        </p>
      </div>
    </div>
  );
}
