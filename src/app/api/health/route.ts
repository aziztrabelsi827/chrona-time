export const dynamic = "force-dynamic";

/**
 * Lightweight application-health endpoint.
 *
 * Chrona Time's core functionality (clock, locations, time zones, search,
 * converter, time synchronization) is fully self-contained and requires no
 * database, so this route simply confirms the application is responding.
 */
export async function GET() {
  return Response.json({ ok: true });
}
