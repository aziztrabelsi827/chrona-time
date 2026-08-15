/**
 * Trusted-time endpoint.
 *
 * Returns the server's current timestamp so clients can estimate the offset
 * between their device clock and a trusted source. Marked non-cacheable so the
 * timestamp is always fresh. Intentionally tiny and dependency-free so it
 * responds as fast as possible (minimizing round-trip uncertainty).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { timestamp: Date.now() },
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        pragma: "no-cache",
        expires: "0",
        "access-control-allow-origin": "*",
      },
    }
  );
}
