/**
 * Time + time-zone utilities.
 *
 * All calculations use the host Intl engine (V8 / browser) backed by the IANA
 * tz database. Offsets are NEVER hard-coded — they are always derived from the
 * real clock at a given instant so daylight-saving transitions are respected.
 */

export interface TimeParts {
  hour: string;
  minute: string;
  second: string;
  millisecond: string;
  dayPeriod: string; // "AM" | "PM" | "" in 24h
}

/** Returns the UTC offset for a time zone, in minutes, at the given instant. */
export function getOffsetMinutes(timeZone: string, date: Date = new Date()): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = dtf.formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
    const year = Number(get("year"));
    const month = Number(get("month")) - 1;
    const day = Number(get("day"));
    let hour = Number(get("hour"));
    if (hour === 24) hour = 0; // some engines emit 24 at midnight
    const minute = Number(get("minute"));
    const second = Number(get("second"));
    const wallAsUtc = Date.UTC(year, month, day, hour, minute, second);
    return Math.round((wallAsUtc - date.getTime()) / 60000);
  } catch {
    return 0;
  }
}

/** Format an offset in minutes as a human label, e.g. "UTC+1" or "UTC+5:30". */
export function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

export function getOffsetLabel(timeZone: string, date: Date = new Date()): string {
  return formatOffset(getOffsetMinutes(timeZone, date));
}

/** Long time-zone name, e.g. "Central European Time". */
export function getTimeZoneLongName(timeZone: string, date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "long",
    }).formatToParts(date);
    const name = parts.find((p) => p.type === "timeZoneName")?.value;
    return name && name !== "GMT" ? name : timeZone;
  } catch {
    return timeZone;
  }
}

/** Short time-zone abbreviation, e.g. "CET" or "EST". */
export function getTimeZoneAbbr(timeZone: string, date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(date);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

/**
 * Whether the zone is currently observing daylight saving time.
 * Compares the current offset against the standard (non-summer) offset.
 */
export function isDST(timeZone: string, date: Date = new Date()): boolean {
  const y = date.getUTCFullYear();
  const jan = getOffsetMinutes(timeZone, new Date(Date.UTC(y, 0, 15, 12)));
  const jul = getOffsetMinutes(timeZone, new Date(Date.UTC(y, 6, 15, 12)));
  const cur = getOffsetMinutes(timeZone, date);
  const standard = Math.min(jan, jul);
  return cur > standard;
}

/** Whether the zone ever uses daylight saving time at all. */
export function observesDST(timeZone: string, date: Date = new Date()): boolean {
  const y = date.getUTCFullYear();
  const jan = getOffsetMinutes(timeZone, new Date(Date.UTC(y, 0, 15, 12)));
  const jul = getOffsetMinutes(timeZone, new Date(Date.UTC(y, 6, 15, 12)));
  return jan !== jul;
}

/** Breaks a Date into hour/minute/second/millisecond parts in a given zone. */
export function getTimeParts(date: Date, timeZone: string, hour12 = false): TimeParts {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12,
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
    millisecond: String(date.getMilliseconds()).padStart(3, "0"),
    dayPeriod: get("dayPeriod"),
  };
}

/** Format a Date as a wall-clock time string in a zone, e.g. "14:30:05". */
export function formatInZone(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    ...options,
  }).format(date);
}

/** Full long date string in a zone, e.g. "Tuesday, August 11, 2026". */
export function getLongDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** Short date string in a zone, e.g. "Aug 11". */
export function getShortDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getWeekday(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(date);
}

/** Signed difference in minutes from zoneA to zoneB at an instant. */
export function timeDifferenceMinutes(zoneA: string, zoneB: string, date: Date = new Date()): number {
  return getOffsetMinutes(zoneB, date) - getOffsetMinutes(zoneA, date);
}

/** Returns "same time", "2 hours ahead" or "3 hours behind" style text. */
export function describeDifference(zoneA: string, zoneB: string, date: Date = new Date()): string {
  const diff = timeDifferenceMinutes(zoneA, zoneB, date);
  if (diff === 0) return "same time";
  const absHours = Math.abs(diff) / 60;
  const rounded = absHours % 1 === 0 ? `${absHours}` : absHours.toFixed(1);
  const unit = absHours === 1 ? "hour" : "hours";
  return diff > 0 ? `${rounded} ${unit} ahead` : `${rounded} ${unit} behind`;
}

/** Detect the visitor's IANA time zone. Falls back to UTC. */
export function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Validate an arbitrary IANA time-zone identifier at runtime. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}
