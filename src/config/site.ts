export type NavItem = { label: string; href: string };
export type ToolNavItem = { label: string; href: string; desc: string };

/**
 * Centralized brand + site configuration.
 * Change brand name, URLs and navigation in ONE place.
 */
export const siteConfig = {
  name: "Chrona Time",
  shortName: "Chrona",
  tagline: "Live, server-synchronized current time",
  description:
    "See the current time now with a live, server-synchronized clock. Explore the time in cities, countries and time zones, convert time zones and learn about UTC, GMT and daylight saving.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.chronatime.com").replace(/\/$/, ""),
  locale: "en_US",
  language: "en",
  themeColor: { light: "#fafafa", dark: "#09090b" },
  contactEmail: "hello@chronatime.com",
  social: {
    twitter: "@chronatime",
  },
  // Default cities for the homepage world clock + time-difference reference set.
  defaultWorldClockCities: [
    "london",
    "new-york",
    "paris",
    "tokyo",
    "dubai",
    "sydney",
    "los-angeles",
    "singapore",
  ],
  referenceCities: ["london", "paris", "new-york", "tokyo", "dubai"],
  popularCities: [
    "london",
    "new-york",
    "paris",
    "tokyo",
    "dubai",
    "sydney",
    "los-angeles",
    "singapore",
    "berlin",
    "rome",
    "cairo",
    "tunis",
  ],
  primaryNav: [
    { label: "World Clock", href: "/#world-clock" },
    { label: "Locations", href: "/time" },
    { label: "Time Zones", href: "/timezone" },
    { label: "Converter", href: "/converter" },
    { label: "About", href: "/about" },
  ] as NavItem[],
  // Tools surfaced in the header "Tools" menu and the /tools landing page.
  toolsNav: [
    { label: "Timer", href: "/timer", desc: "Countdown and focus timer" },
    { label: "Stopwatch", href: "/stopwatch", desc: "Measure elapsed time and record laps" },
    { label: "Calendar", href: "/calendar", desc: "Explore dates and calculate date differences" },
    { label: "Time Converter", href: "/converter", desc: "Compare times across time zones" },
  ] as ToolNavItem[],
} as const;

export type SiteConfig = typeof siteConfig;
