import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use",
  description: `The terms governing your use of ${siteConfig.name}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Terms of Use</h1>
      <p className="mt-2 text-sm text-faint">Last updated: {new Date().getFullYear()}</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted">
        <p>
          By using {siteConfig.name}, you agree to these terms. Please read them carefully.
        </p>
        <h2 className="text-lg font-semibold text-ink">Use of the service</h2>
        <p>
          {siteConfig.name} is provided for general informational purposes. While we strive for accuracy, time
          information is derived from your device and the IANA time-zone database, and we cannot guarantee it
          will be free of errors or suitable for critical applications (such as legal, medical or financial
          timing).
        </p>
        <h2 className="text-lg font-semibold text-ink">Accuracy &amp; availability</h2>
        <p>
          We do not warrant that the service will be uninterrupted or error-free. Always verify important times
          against an authoritative source.
        </p>
        <h2 className="text-lg font-semibold text-ink">Intellectual property</h2>
        <p>
          The {siteConfig.name} brand, design and original content are owned by the site operator. Time-zone
          data is derived from the public IANA time-zone database.
        </p>
        <h2 className="text-lg font-semibold text-ink">Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the service constitutes acceptance of
          the updated terms.
        </p>
        <p className="text-faint">This is a template. Replace with reviewed legal wording before launch.</p>
      </div>
    </div>
  );
}
