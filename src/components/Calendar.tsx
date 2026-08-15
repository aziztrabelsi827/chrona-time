"use client";

import { useEffect, useState } from "react";
import {
  addDays,
  dayOfYear,
  daysInMonth,
  daysRemainingInYear,
  diffBreakdown,
  diffDays,
  formatLongDate,
  formatMonthYear,
  isLeapYear,
  isoWeek,
  parseISODate,
  quarter,
  toISODate,
  today,
  weekdayName,
  WEEKDAY_LABELS,
} from "@/lib/dates";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

/** Monthly calendar with an information panel for the selected date. */
export function Calendar() {
  const [selected, setSelected] = useState<Date | null>(null);
  const [view, setView] = useState<{ y: number; m: number }>(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [todayDate, setTodayDate] = useState<Date | null>(null);

  // Hydrate on client to avoid SSR mismatch (today differs per render env).
  useEffect(() => {
    const t = today();
    setTodayDate(t);
    setSelected((s) => s ?? t);
  }, []);

  const firstOfMonth = new Date(view.y, view.m, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const gridStart = addDays(firstOfMonth, -startWeekday);

  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const weeks: Date[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const sameDay = (a: Date | null, b: Date | null) =>
    !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const goMonth = (delta: number) => {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const moveSelection = (days: number) => {
    setSelected((s) => {
      const base = s ?? todayDate ?? today();
      const next = addDays(base, days);
      setView({ y: next.getFullYear(), m: next.getMonth() });
      return next;
    });
  };

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveSelection(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveSelection(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveSelection(7);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveSelection(-7);
        break;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Calendar grid */}
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => goMonth(-1)} aria-label="Previous month" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted hover:text-ink">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-base font-semibold text-ink sm:text-lg">{formatMonthYear(firstOfMonth)}</h2>
          <button type="button" onClick={() => goMonth(1)} aria-label="Next month" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted hover:text-ink">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-faint">
          {WEEKDAY_LABELS.map((d, i) => (
            <div key={i} className="py-1">
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d[0]}</span>
            </div>
          ))}
        </div>

        <div role="grid" aria-label={`Calendar for ${formatMonthYear(firstOfMonth)}`} tabIndex={0} onKeyDown={onGridKeyDown} className="grid grid-cols-7 gap-1 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset rounded-lg">
          {weeks.flat().map((d) => {
            const inMonth = d.getMonth() === view.m;
            const isToday = sameDay(d, todayDate);
            const isSelected = sameDay(d, selected);
            return (
              <button
                key={d.toISOString()}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                aria-current={isToday ? "date" : undefined}
                aria-label={`${weekdayName(d)}, ${formatLongDate(d)}`}
                onClick={() => {
                  setSelected(d);
                  setView({ y: d.getFullYear(), m: d.getMonth() });
                }}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg text-sm transition-colors",
                  !inMonth && "text-faint/60",
                  inMonth && !isSelected && "text-ink hover:bg-surface-2",
                  isSelected ? "bg-ink font-semibold text-canvas" : "",
                  isToday && !isSelected && "ring-1 ring-inset ring-accent"
                )}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const t = todayDate ?? today();
              setView({ y: t.getFullYear(), m: t.getMonth() });
              setSelected(t);
            }}
            className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted hover:text-ink"
          >
            Today
          </button>
          <p className="text-xs text-faint">Use arrow keys to move the selected date</p>
        </div>
      </div>

      {/* Date information panel */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        {selected ? <DatePanel date={selected} /> : <p className="text-sm text-muted">Select a date to see its details.</p>}
      </div>
    </div>
  );
}

function DatePanel({ date }: { date: Date }) {
  const week = isoWeek(date);
  const rows: { label: string; value: string }[] = [
    { label: "Date", value: formatLongDate(date) },
    { label: "Weekday", value: weekdayName(date) },
    { label: "Day of year", value: `${dayOfYear(date)} of ${isLeapYear(date.getFullYear()) ? 366 : 365}` },
    { label: "ISO week", value: `Week ${week.week} of ${week.year}` },
    { label: "Month", value: new Intl.DateTimeFormat("en-US", { month: "long" }).format(date) },
    { label: "Quarter", value: `Q${quarter(date)}` },
    { label: "Days in month", value: String(daysInMonth(date.getFullYear(), date.getMonth())) },
    { label: "Days remaining in year", value: String(daysRemainingInYear(date)) },
    { label: "Leap year", value: isLeapYear(date.getFullYear()) ? "Yes" : "No" },
  ];
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-faint">Selected date</p>
      <h2 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">{formatLongDate(date)}</h2>
      <p className="mt-1 text-sm text-muted">
        Day {dayOfYear(date)} of {isLeapYear(date.getFullYear()) ? 366 : 365}
      </p>
      <dl className="mt-5 divide-y divide-line">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-sm text-muted">{r.label}</dt>
            <dd className="text-right text-sm font-medium text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Date difference + add/subtract days calculators. */
export function DateTools() {
  const todayISO = toISODate(today());

  // Difference
  const [startISO, setStartISO] = useState(todayISO);
  const [endISO, setEndISO] = useState(toISODate(addDays(today(), 20)));

  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  const diff = start && end ? diffDays(start, end) : null;
  const breakdown = start && end ? diffBreakdown(start, end) : null;

  // Add/subtract days
  const [baseISO, setBaseISO] = useState(todayISO);
  const [amount, setAmount] = useState("30");
  const base = parseISODate(baseISO);
  const amt = Number(amount);
  const result = base && Number.isFinite(amt) ? addDays(base, amt) : null;

  const inputCls = "h-11 rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none focus:border-accent";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Difference */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Date difference</h2>
        <p className="mt-1 text-sm text-muted">Number of whole days between two dates (exclusive of the end date).</p>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-faint">Start date</span>
            <input type="date" value={startISO} onChange={(e) => setStartISO(e.target.value)} className={cn(inputCls, "w-full")} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-faint">End date</span>
            <input type="date" value={endISO} onChange={(e) => setEndISO(e.target.value)} className={cn(inputCls, "w-full")} />
          </label>
        </div>
        {diff !== null && breakdown && (
          <div className="mt-4 rounded-xl border border-line bg-canvas p-4">
            <p className="tabular text-3xl font-semibold text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
              {Math.abs(diff)} {Math.abs(diff) === 1 ? "day" : "days"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {breakdown.sign < 0 ? "End date is before start date" : "From start to end date"}
            </p>
            {diff !== 0 && (
              <p className="mt-1 text-sm text-muted">
                = {Math.abs(Math.floor(diff / 7))} weeks ·{" "}
                {breakdown.years > 0 && `${breakdown.years}y `}
                {breakdown.months > 0 && `${breakdown.months}mo `}
                {breakdown.days > 0 && `${breakdown.days}d`}
                {breakdown.years === 0 && breakdown.months === 0 && breakdown.days === 0 ? "same day" : ""}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add / subtract */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Add or subtract days</h2>
        <p className="mt-1 text-sm text-muted">Calculate a date a number of days before or after another date.</p>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-faint">Date</span>
            <input type="date" value={baseISO} onChange={(e) => setBaseISO(e.target.value)} className={cn(inputCls, "w-full")} />
          </label>
          <div className="flex items-center gap-2">
            <label className="flex-1">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-faint">Days (use − to subtract)</span>
              <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d-]/g, ""))} className={cn(inputCls, "w-full")} />
            </label>
            <div className="flex gap-2 pt-5">
              <button type="button" onClick={() => setAmount(String(Math.max(0, Number(amount) - 1)))} className="h-11 w-11 rounded-lg border border-line text-ink hover:border-faint">−</button>
              <button type="button" onClick={() => setAmount(String(Number(amount) + 1))} className="h-11 w-11 rounded-lg border border-line text-ink hover:border-faint">+</button>
            </div>
          </div>
        </div>
        {result && (
          <div className="mt-4 rounded-xl border border-line bg-canvas p-4">
            <p className="text-xs uppercase tracking-wider text-faint">Result</p>
            <p className="mt-1 text-xl font-semibold text-ink">{formatLongDate(result)}</p>
            <p className="mt-0.5 text-sm text-muted">{weekdayName(result)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
