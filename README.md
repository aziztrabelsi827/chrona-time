# Chrona Time

A production-ready global time utility — a fast, server-synchronized live clock
with dedicated pages for the **cities, countries and time zones** it covers.

Chrona Time is built to be technically sound, factually trustworthy and
internally consistent. It does **not** claim worldwide coverage, atomic-clock
precision, or guaranteed search rankings.

> Brand name **"Chrona Time"** is a placeholder — change it in one place:
> [`src/config/site.ts`](src/config/site.ts).

---

## Tech stack

- [Next.js 16](https://next.org) (App Router, mostly static generation)
- TypeScript + React 19
- Tailwind CSS v4
- [`next-themes`](https://github.com/pacocoursey/next-themes)
- IANA time-zone database via the native `Intl` API — **offsets are never
  hard-coded**; they are always computed live so DST rules stay correct.

---

## URL architecture

Entity types live in **separate, explicit namespaces** so a city and country can
never collide (e.g. `/time/city/singapore` and `/time/country/singapore` both
exist and resolve to different pages).

| Entity    | Route                     | Example                            |
| --------- | ------------------------- | ---------------------------------- |
| Country   | `/time/country/[slug]`    | `/time/country/united-states`      |
| City      | `/time/city/[slug]`       | `/time/city/new-york`              |
| Time zone | `/timezone/[slug]`        | `/timezone/america-new-york`       |
| Browse    | `/time`, `/timezone`      | `/time`                            |
| Tools     | `/tools`, `/timer`, `/stopwatch`, `/calendar`, `/converter` | `/tools` (hub to Timer, Stopwatch, Calendar, Converter) |

All canonical URLs are produced by three centralized helpers in
[`src/lib/locations.ts`](src/lib/locations.ts):

```ts
countryUrl(slug)   // /time/country/<slug>
cityUrl(slug)      // /time/city/<slug>
timezoneUrl(slug)  // /timezone/<slug>
```

Time-zone slugs come from exactly one function, `timezoneSlug(id)` in
[`src/data/timezones.ts`](src/data/timezones.ts). Components never derive slugs
manually.

**Legacy redirect:** the old `/time/[slug]` route is kept as a **permanent 308
redirect** to the correct typed URL (e.g. `/time/sousse` → `/time/city/sousse`).
It is dynamic, excluded from the sitemap, and not linked from the UI.

---

## Time synchronization

The clock is **server-synchronized**, not just the device clock.

1. **`/api/time`** ([`src/app/api/time/route.ts`](src/app/api/time/route.ts)) — a
   dependency-free, `force-dynamic`, `no-store` endpoint returning
   `{ "timestamp": Date.now() }`.
2. **`TimeSyncProvider`** ([`src/hooks/useTimeSync.tsx`](src/hooks/useTimeSync.tsx))
   records send/receive times, estimates network round-trip, and computes a
   clock offset (`trustedNow ≈ Date.now() + offset`). It resynchronizes every
   5 minutes, on tab focus, and when the browser goes back online.
3. **`useNow`** ([`src/hooks/useClock.ts`](src/hooks/useClock.ts)) applies that
   offset on every tick and is re-read from the real clock each second (never
   incremented), with a `visibilitychange` snap-correction.
4. **Fallback:** if synchronization fails, the last known offset is retained so
   the clock keeps running; only when it has never synced does it use raw device
   time. A subtle **`SyncStatus`** indicator shows `Synchronized`, `Synchronizing…`
   or `Using device time`.

Accuracy is **best-effort to the nearest second** over the public internet. The
product does **not** claim millisecond or atomic-clock precision.

---

## Data model

Data is plain TypeScript, kept separate from UI.

### Countries — `src/data/locations.ts`

```ts
interface Country {
  slug: string; name: string; code: string;        // ISO 3166-1 alpha-2
  continent: Continent;
  capital?: string;            // optional declared capital (omitted where disputed)
  referenceCitySlug?: string;  // geographic reference for country pages (defaults to capital)
  timezones: string[];         // IANA zones spanning the country (can be many)
  lat: number; lng: number; phoneCode?: string;
  popular?: boolean; aliases?: string[];
}
```

`capital` and `referenceCitySlug` are deliberately separate. `capital` is
optional political metadata (shown only when present); `referenceCitySlug` is the
geographic reference used for a country page's sunrise/sunset and representative
location, falling back to `capital`. This lets disputed cases (e.g. Israel)
function without making a capital claim.

A country can span **multiple** time zones (e.g. United States, Canada, Russia,
Australia, Brazil, Mexico, Indonesia). Country pages for multi-zone countries
show a per-zone time grid and never imply one national time.

### Cities — `src/data/locations.ts`

```ts
interface City {
  slug: string; name: string; country: string; countryCode: string;
  timezone: string;      // a valid IANA zone
  lat: number; lng: number; population?: number; popular?: boolean; aliases?: string[];
}
```

`city.countryCode` is the authoritative city→country link.

### Time zones — `src/data/timezones.ts`

A time zone is its **own entity**, not a city proxy. `TIME_ZONES` is derived
deterministically from every zone used by a city **and** declared by a country,
plus `UTC` and `GMT`, so every referenced zone has a page.

```ts
interface TimeZone { id: string; slug: string; label: string; region: string; popular: boolean; }
```

---

## Build-time data validation

[`src/lib/validate-data.ts`](src/lib/validate-data.ts) runs during the build
(via the sitemap module) and **fails the build** on any of:

- duplicate country / city / timezone slug
- duplicate country code
- a city referencing a non-existent country
- an invalid (or page-less) city or country time zone
- a duplicate time zone within a country
- a country capital that is missing or belongs to another country
- invalid coordinates (lat/lng out of range)
- invalid country code format
- duplicate canonical route

---

## SEO architecture

- Centralized metadata builder ([`src/lib/seo.ts`](src/lib/seo.ts)): unique
  titles, descriptions, canonical URLs, Open Graph/Twitter, hreflang scaffolding.
- Per-page `WebPage` + `BreadcrumbList` JSON-LD; global `WebSite` +
  `Organization`; `FAQPage` only where real FAQs exist. All schema URLs are
  canonical.
- [`src/app/sitemap.ts`](src/app/sitemap.ts) lists **only** canonical indexable
  routes (homepage, `/time`, `/timezone`, all country/city/timezone pages,
  `/tools`, `/timer`, `/stopwatch`, `/calendar`, `/converter`, `/about`,
  `/contact`, `/privacy`, `/terms`). No legacy, search, or API routes.
- [`src/app/robots.ts`](src/app/robots.ts) allows all public content and
  disallows `/api/` and `/_next/`.

---

## Project structure

```
src/
  app/
    layout.tsx, page.tsx (home), globals.css, not-found.tsx
    api/time/route.ts          # trusted-time endpoint
    api/health/route.ts
    time/page.tsx              # browse (countries + cities)
    time/[slug]/route.ts       # legacy → permanent 308 redirect
    time/country/[slug]/       # country pages
    time/city/[slug]/          # city pages
    timezone/page.tsx          # time-zone index
    timezone/[slug]/           # time-zone pages
    tools/                     # tools hub (Timer, Stopwatch, Calendar, Converter)
    timer/ stopwatch/ calendar/ converter/
    about/ contact/ privacy/ terms/
    sitemap.ts robots.ts icon.svg
  components/                  # Clock, WorldClock, CityCard, CommandMenu,
                               # Timer, Stopwatch, Calendar, ToolsNav,
                               # Converter, SyncStatus, CountryTimeZoneGrid, …
  config/site.ts               # brand/nav/defaults
  data/locations.ts            # CITIES + COUNTRIES
  data/timezones.ts            # TIME_ZONES (+ canonical slug fn)
  hooks/                       # useClock, useTimeSync
  lib/                         # time, sun, locations, search, content, seo,
                               # validate-data, cn
```

---

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run typecheck    # tsc --noEmit
npm run lint
npm run build        # runs build-time data validation
npm run start        # serve the production build
```

---

## Production deployment

The app is fully static (SSG) plus two tiny dynamic server endpoints. **No
external database is required** — Chrona Time's core functionality (clock,
locations, time zones, search, converter, time synchronization) is entirely
self-contained and runs without PostgreSQL. It deploys cleanly to Vercel:

1. Push to Git and import the project in [Vercel](https://vercel.com).
2. Set environment variables (see below).
3. Deploy — Vercel detects Next.js automatically.

### Server endpoints

| Endpoint      | Behavior                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| `GET /api/time`  | Trusted server-time endpoint — dependency-free, `no-store`, returns `{ "timestamp": Date.now() }`. Used by the client to estimate the clock offset (see [Time synchronization](#time-synchronization)). |
| `GET /api/health` | Lightweight application-health endpoint — dependency-free, returns `{ "ok": true }` with HTTP 200. |

Neither endpoint connects to a database.

| Variable                 | Required | Notes                                                                  |
| ------------------------ | -------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | yes      | Canonical site URL, e.g. `https://www.chronatime.com`.                 |
| `NEXT_PUBLIC_GA_ID`      | no       | Google Analytics 4 ID (e.g. `G-XXXX`). Analytics is off unless set.    |

Set `NEXT_PUBLIC_SITE_URL` before launch so canonical URLs and the sitemap use
your real domain.

---

## Known limitations (honest)

- **Coverage is a curated subset**, not every place on Earth. Copy reflects this.
- **Israel's capital** is internationally disputed, so the country page makes no
  capital claim; Tel Aviv is used as the geographic reference city instead.
- **Hong Kong** (SAR of China) uses `Asia/Hong_Kong`; mainland China is modeled
  as the single official zone `Asia/Shanghai`. Both are UTC+8 with no DST.
- **South Africa** has three capitals; Pretoria (administrative) is used.
- Some **country-only time zones** (e.g. remote Russian zones) have no covered
  city and display without a representative city, as intended.
- Time accuracy is bounded by the server-sync round-trip estimate — reliable to
  the second, not millisecond-level.
