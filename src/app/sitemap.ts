import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { CITIES, COUNTRIES } from "@/data/locations";
import { TIME_ZONES } from "@/data/timezones";
import { cityUrl, countryUrl, timezoneUrl } from "@/lib/locations";
import { assertValidData } from "@/lib/validate-data";

// Fail the build loudly if location data is inconsistent (duplicate slugs,
// broken references, duplicate canonical routes, etc.).
assertValidData();

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  // No page has a tracked, reliable content-modification date (location pages
  // are generated from static data; the homepage shows live time), so
  // `lastModified` is intentionally omitted rather than stamped with "now" on
  // every generation. Each entry keeps its meaningful url/changeFrequency/priority.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/time`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/timezone`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/converter`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/tools`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/timer`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/stopwatch`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/calendar`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const countries: MetadataRoute.Sitemap = COUNTRIES.map((c) => ({
    url: `${base}${countryUrl(c.slug)}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const cities: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${base}${cityUrl(c.slug)}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const zones: MetadataRoute.Sitemap = TIME_ZONES.map((t) => ({
    url: `${base}${timezoneUrl(t.slug)}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...countries, ...cities, ...zones];
}
