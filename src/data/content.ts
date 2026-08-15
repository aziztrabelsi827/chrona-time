import { siteConfig } from "@/config/site";

export interface EditorialSection {
  heading: string;
  body: string;
}

export const homepageEditorial: EditorialSection[] = [
  {
    heading: "What is the current time?",
    body: `The live clock above shows the current time for your location using a server-synchronized reference and your detected time zone. It updates every second and applies the appropriate IANA time-zone rules, so daylight saving is handled automatically. Use the world clock below to compare the time across major cities around the globe.`,
  },
  {
    heading: "What is UTC?",
    body: `Coordinated Universal Time (UTC) is the primary time standard by which the world regulates clocks. It is effectively the successor to Greenwich Mean Time (GMT) and is not adjusted for daylight saving. Every civil time zone is defined as an offset from UTC — for example, ${"Europe/Paris"} is UTC+1 in winter and UTC+2 in summer.`,
  },
  {
    heading: "How time zones work",
    body: `Earth is divided into 24 nominal time zones, each roughly 15° of longitude wide and one hour apart. In practice, time-zone boundaries follow national and regional borders, and many zones use offsets of 30 or 45 minutes. Each zone is identified by an IANA identifier such as America/New_York or Asia/Tokyo, which encodes the exact rules for offsets and daylight-saving changes.`,
  },
  {
    heading: "Why countries change their clocks",
    body: `Daylight-saving time (DST) shifts the clock forward by (usually) one hour during the warmer months to make better use of evening daylight. Not every country observes DST, and the start and end dates differ around the world. Because the rules change, this site computes every offset live from the IANA database rather than storing fixed numbers.`,
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const homepageFaqs: FaqItem[] = [
  {
    question: "What time is it right now?",
    answer:
      "The large clock at the top of this page shows the current time in your location, updating every second. It uses a server-synchronized time reference and applies the correct IANA time-zone rules for your area.",
  },
  {
    question: "What is UTC?",
    answer:
      "Coordinated Universal Time (UTC) is the global time standard. It does not change with daylight saving, and all other time zones are expressed as an offset from UTC, such as UTC+1 or UTC-5.",
  },
  {
    question: "What is GMT?",
    answer:
      "Greenwich Mean Time (GMT) is the mean solar time at the Royal Observatory in Greenwich, London. In everyday use it is often treated the same as UTC, although technically UTC is a precise atomic time standard.",
  },
  {
    question: "How can I convert time between zones?",
    answer:
      `Use the time-zone converter on ${siteConfig.name}. Pick a source city and a target city to see the current time in both places at once, and compare the time difference between them.`,
  },
  {
    question: "Is the clock on this page accurate?",
    answer:
      "The clock uses a server-synchronized time reference and applies the appropriate IANA time-zone rules. It updates every second and displays the current local time to the nearest second. If it can't reach the server it falls back to your device clock until it reconnects.",
  },
];

/** Headings used to describe the live clock region for screen readers & SEO. */
export const liveClockAriaLabel = "Live current time clock";
