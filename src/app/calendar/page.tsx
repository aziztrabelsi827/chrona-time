import type { Metadata } from "next";
import { Calendar, DateTools } from "@/components/Calendar";
import { ToolLayout } from "@/components/ToolParts";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Online Calendar – Date & Calendar Tools",
  description:
    "View dates, find weekdays and week numbers, calculate date differences and add or subtract days with Chrona Time's free online calendar.",
  path: "/calendar",
});

const sections = [
  {
    heading: "How to use the calendar",
    body: "Move between months with the arrows, jump to today, or select any date to see its weekday, day of the year, ISO week number, quarter and more. You can also navigate with the arrow keys once the calendar grid is focused.",
  },
  {
    heading: "Leap years",
    body: "A year is a leap year if it is divisible by 4, except for end-of-century years which must be divisible by 400. Leap years have 366 days and a February 29. The calendar handles these rules, along with month lengths and year boundaries, automatically.",
  },
  {
    heading: "Week numbers",
    body: "Week numbers shown here follow the ISO 8601 standard: weeks start on Monday, and week 1 is the week containing the first Thursday of the year.",
  },
  {
    heading: "Date calculations",
    body: "Use the date difference tool to count the whole days between two dates, or the add/subtract tool to find a date a number of days before or after another date. Calculations account for leap years and varying month lengths.",
  },
];

export default function CalendarPage() {
  return (
    <ToolLayout
      title="Calendar"
      intro="Explore dates, weekdays and week numbers, and calculate date differences or add and subtract days."
      path="/calendar"
      sections={sections}
      links={[
        { label: "Current Time", href: "/" },
        { label: "Time Converter", href: "/converter" },
        { label: "Timer", href: "/timer" },
      ]}
    >
      <div className="space-y-8">
        <Calendar />
        <DateTools />
      </div>
    </ToolLayout>
  );
}
