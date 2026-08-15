/**
 * Dependency-free date utilities built on native `Date` / `Intl`.
 *
 * All calendar math is done on UTC-normalized midnight constructed from local
 * calendar fields, which avoids DST off-by-one errors. Leap years, month
 * lengths and year boundaries are handled by the native Date implementation.
 */

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/** Days in a month. `month` is 0-indexed (0 = January). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function utcMidnight(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 1-indexed day of the year (Jan 1 = 1). */
export function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  return Math.floor((utcMidnight(date) - start) / 86400000);
}

export function daysRemainingInYear(date: Date): number {
  return daysInYear(date.getFullYear()) - dayOfYear(date);
}

export function quarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

export function weekdayName(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const WEEKDAY_LABELS_NARROW = ["M", "T", "W", "T", "F", "S", "S"];

/** ISO 8601 week number (weeks start Monday; week 1 contains the first Thursday). */
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

/** Add (or subtract) whole days. Handles month/year/leap boundaries natively. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Signed number of whole calendar days from `a` to `b` (a < b → positive). */
export function diffDays(a: Date, b: Date): number {
  return Math.round((utcMidnight(b) - utcMidnight(a)) / 86400000);
}

export interface DiffBreakdown {
  years: number;
  months: number;
  days: number;
  sign: 1 | -1;
}

/** Calendar difference broken into years / months / days (always non-negative parts). */
export function diffBreakdown(a: Date, b: Date): DiffBreakdown {
  let sign: 1 | -1 = 1;
  let start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  let end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  if (end.getTime() < start.getTime()) {
    sign = -1;
    [start, end] = [end, start];
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days, sign };
}

/** Parse a `YYYY-MM-DD` string into a local-midnight Date (no UTC shift). */
export function parseISODate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Format a Date as `YYYY-MM-DD` for `<input type="date">`. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const da = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

/** Today as a local Date (midnight). */
export function today(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
