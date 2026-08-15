interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/** Renders Schema.org structured data. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Structured data is generated server-side from trusted, static data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
