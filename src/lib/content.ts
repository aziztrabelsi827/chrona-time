import type { City, Country } from "@/data/locations";
import type { TimeZone } from "@/data/timezones";
import {
  getOffsetMinutes,
  getTimeZoneLongName,
  formatOffset,
} from "@/lib/time";

interface StandardOffsets {
  standard: number;
  summer: number;
  observesDst: boolean;
}

/** Determine standard vs. summer offsets for a zone in the current year. */
function standardOffsets(timeZone: string): StandardOffsets {
  const y = new Date().getUTCFullYear();
  const jan = getOffsetMinutes(timeZone, new Date(Date.UTC(y, 0, 15, 12)));
  const jul = getOffsetMinutes(timeZone, new Date(Date.UTC(y, 6, 15, 12)));
  const standard = Math.min(jan, jul);
  const summer = Math.max(jan, jul);
  return { standard, summer, observesDst: jan !== jul };
}

export interface LocationContent {
  intro: string[];
  sections: { heading: string; body: string }[];
  faqs: { question: string; answer: string }[];
}

export function generateCityContent(city: City, country: Country): LocationContent {
  const tzName = getTimeZoneLongName(city.timezone);
  const tzId = city.timezone;
  const { standard, summer, observesDst } = standardOffsets(city.timezone);

  const intro = [
    `${city.name} is located in ${country.name} and currently uses the ${tzName} time zone (${tzId}). The live clock above shows the exact current time in ${city.name}, updating every second and accounting for any daylight-saving changes.`,
  ];

  const sections = [
    {
      heading: `Time zone in ${city.name}`,
      body: `${city.name} observes ${tzName}, which is identified by the IANA time-zone identifier ${tzId}. In standard time the local offset from Coordinated Universal Time (UTC) is ${formatOffset(
        standard
      )}.${observesDst ? ` During the summer months the clocks move forward to ${formatOffset(
        summer
      )}.` : ""} You can rely on the clock on this page to always reflect the correct offset for today.`,
    },
    {
      heading: `Daylight saving in ${city.name}`,
      body: observesDst
        ? `${city.name} observes daylight-saving time: clocks move forward in the summer months and back again, changing the UTC offset by one hour. The live clock automatically applies the correct offset, so the time you see is accurate whether clocks are currently forward or back.`
        : `${city.name} does not observe daylight-saving time, so the local offset from UTC stays at ${formatOffset(
            standard
          )} all year round.`,
    },
    {
      heading: `Where is ${city.name}?`,
      body: `${city.name} is in ${country.name}, ${country.continent}. Its coordinates are approximately ${city.lat.toFixed(
        2
      )}°, ${city.lng.toFixed(2)}°, which is used to calculate the sunrise and sunset times shown on this page.`,
    },
  ];

  const faqs = [
    {
      question: `What time zone is ${city.name} in?`,
      answer: `${city.name} is in the ${tzName} time zone (${tzId}), with a standard UTC offset of ${formatOffset(
        standard
      )}.${observesDst ? ` Daylight-saving time brings the offset to ${formatOffset(summer)}.` : ""}`,
    },
    {
      question: `Does ${city.name} use daylight-saving time?`,
      answer: observesDst
        ? `Yes. ${city.name} observes daylight-saving time, moving the clocks forward in summer and back in winter.`
        : `No. ${city.name} does not observe daylight-saving time, so the UTC offset stays the same all year.`,
    },
    {
      question: `What is the UTC offset for ${city.name}?`,
      answer: `In standard time, ${city.name} is ${formatOffset(
        standard
      )}.${observesDst ? ` In summer it is ${formatOffset(summer)}.` : ""} The offset shown on this page is always the live, correct value.`,
    },
  ];

  return { intro, sections, faqs };
}

export function generateCountryContent(
  country: Country,
  referenceName: string,
  referenceZone: string
): LocationContent {
  const zones = country.timezones;
  const isSingle = zones.length === 1;

  if (isSingle) {
    const tzId = zones[0];
    const tzName = getTimeZoneLongName(tzId);
    const { standard, summer, observesDst } = standardOffsets(tzId);

    const intro = [
      `${country.name} is in ${country.continent} and uses a single time zone, ${tzName} (${tzId}). The live clock above shows the exact current time across the whole country and updates every second.`,
    ];

    const sections = [
      {
        heading: `Time zone in ${country.name}`,
        body: `${country.name} observes ${tzName} (${tzId}). In standard time the offset from Coordinated Universal Time (UTC) is ${formatOffset(
          standard
        )}.${observesDst ? ` During daylight-saving time the offset becomes ${formatOffset(summer)}.` : ""}`,
      },
      {
        heading: `Daylight saving in ${country.name}`,
        body: observesDst
          ? `${country.name} observes daylight-saving time, advancing clocks in spring and returning them in autumn.`
          : `${country.name} does not observe daylight-saving time, so the offset stays at ${formatOffset(
              standard
            )} throughout the year.`,
      },
      {
        heading: `Major cities in ${country.name}`,
        body: `Explore the exact current time in ${country.name}'s most important cities using the links below. Each city page shows a live clock, the UTC offset, sunrise and sunset, and the time difference to major world cities.`,
      },
    ];

    const faqs = [
      {
        question: `What time zone is ${country.name} in?`,
        answer: `${country.name} uses the ${tzName} time zone (${tzId}). Its standard UTC offset is ${formatOffset(
          standard
        )}.${observesDst ? ` Daylight-saving time changes it to ${formatOffset(summer)}.` : ""}`,
      },
      {
        question: `Does ${country.name} observe daylight-saving time?`,
        answer: observesDst
          ? `Yes, ${country.name} observes daylight-saving time.`
          : `No, ${country.name} does not observe daylight-saving time.`,
      },
      {
        question: `What is the UTC offset for ${country.name}?`,
        answer: `The standard offset is ${formatOffset(standard)}.${
          observesDst ? ` In summer it is ${formatOffset(summer)}.` : ""
        }`,
      },
    ];

    return { intro, sections, faqs };
  }

  // Multi-timezone country — never collapse to a single national time.
  const zoneList = zones.join(", ");
  const intro = [
    `${country.name} spans several IANA time zones. The local time depends on each area's zone, so the time can differ between cities — the major zones and their current times are shown in the table above. ${referenceName} uses the ${referenceZone} time zone.`,
  ];

  const sections = [
    {
      heading: `Time zones in ${country.name}`,
      body: `${country.name} observes ${zones.length} IANA time zones: ${zoneList}. Each zone has its own UTC offset and daylight-saving rules, which is why the time can vary from one part of the country to another.`,
    },
    {
      heading: `Daylight saving across ${country.name}`,
      body: `Daylight-saving rules are determined per time zone, not per country. Within ${country.name} some zones move their clocks forward in summer while others keep a fixed offset all year. The table above shows each zone's current UTC offset and whether it is currently observing daylight-saving time.`,
    },
    {
      heading: `Major cities in ${country.name}`,
      body: `The cities below are grouped by their local time zone, so you can see at a glance which places share the same time. Each city page shows a live clock, the UTC offset, sunrise and sunset, and the time difference to major world cities.`,
    },
  ];

  const faqs = [
    {
      question: `How many time zones does ${country.name} have?`,
      answer: `${country.name} uses ${zones.length} IANA time zones: ${zoneList}.`,
    },
    {
      question: `Does ${country.name} observe daylight-saving time?`,
      answer: `It depends on the zone — some time zones in ${country.name} observe daylight saving while others do not. Check each zone's status in the table above.`,
    },
    {
      question: `What time zone is ${referenceName} in?`,
      answer: `${referenceName} is in the ${referenceZone} time zone.`,
    },
  ];

  return { intro, sections, faqs };
}

export function generateTimeZoneContent(tz: TimeZone): LocationContent {
  const tzName = getTimeZoneLongName(tz.id);
  const tzId = tz.id;
  const label = tz.label;
  const { standard, summer, observesDst } = standardOffsets(tz.id);

  const intro = [
    `${label} is the IANA time zone identified by ${tzId}. The live clock above shows the exact current time in this zone, with the correct UTC offset and daylight-saving status applied automatically.`,
  ];

  const sections = [
    {
      heading: `About ${label}`,
      body: `${label} (${tzId}) is commonly known as ${tzName}. In standard time the offset from Coordinated Universal Time (UTC) is ${formatOffset(
        standard
      )}.${observesDst ? ` When daylight-saving time is in effect, the offset becomes ${formatOffset(
        summer
      )}.` : ""} The offset shown on this page always reflects today's rules.`,
    },
    {
      heading: "Daylight saving",
      body: observesDst
        ? `${label} observes daylight-saving time: clocks move forward in the warmer months and back again, changing the UTC offset by one hour. The clock above applies the correct offset automatically.`
        : `${label} does not observe daylight-saving time, so its UTC offset stays at ${formatOffset(
            standard
          )} all year.`,
    },
    {
      heading: `Cities in ${label}`,
      body: `The cities listed below all use ${label} (${tzId}) as their local time zone. Each has its own page with a live clock, sunrise and sunset times, and the time difference to major world cities.`,
    },
  ];

  const faqs = [
    {
      question: `What is the current time in ${label}?`,
      answer: `The live clock at the top of this page shows the exact current time in ${label}, updating every second.`,
    },
    {
      question: `What is the UTC offset for ${label}?`,
      answer: `In standard time, ${label} is ${formatOffset(
        standard
      )}.${observesDst ? ` During daylight-saving time it is ${formatOffset(summer)}.` : ""}`,
    },
    {
      question: `Does ${label} use daylight-saving time?`,
      answer: observesDst
        ? `Yes, ${label} observes daylight-saving time.`
        : `No, ${label} does not observe daylight-saving time.`,
    },
  ];

  return { intro, sections, faqs };
}
