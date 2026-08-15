import { NextResponse } from "next/server";
import { getCity, getCountry, cityUrl, countryUrl } from "@/lib/locations";

export const dynamic = "force-dynamic";

/**
 * Legacy single-slug URLs (e.g. /time/sousse) are no longer canonical.
 * Country/city now live under explicit /time/country/ and /time/city/ paths.
 *
 * This route issues a **permanent (308)** redirect to the correct typed URL and
 * returns 404 for anything unknown. It is dynamic (never statically generated),
 * is excluded from the sitemap, and is never linked from the UI — the typed
 * routes are the canonical, indexable URLs.
 */
/** Resolve an absolute redirect URL, respecting proxy forwarding headers. */
function absoluteUrl(req: Request, path: string): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto");
  const origin = host
    ? `${proto ? proto.split(",")[0] : "https"}://${host.split(",")[0]}`
    : req.url;
  return new URL(path, origin).toString();
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const country = getCountry(slug);
  if (country) {
    return NextResponse.redirect(absoluteUrl(req, countryUrl(country.slug)), {
      status: 308,
    });
  }

  const city = getCity(slug);
  if (city) {
    return NextResponse.redirect(absoluteUrl(req, cityUrl(city.slug)), {
      status: 308,
    });
  }

  return new NextResponse(null, { status: 404 });
}
