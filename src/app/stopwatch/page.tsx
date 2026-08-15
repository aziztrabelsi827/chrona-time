import type { Metadata } from "next";
import { Stopwatch } from "@/components/Stopwatch";
import { ToolLayout } from "@/components/ToolParts";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Online Stopwatch – Accurate Stopwatch with Laps",
  description:
    "Use a free online stopwatch with accurate elapsed-time tracking, lap splits and fullscreen mode. No sign-up required.",
  path: "/stopwatch",
});

const sections = [
  {
    heading: "What is a stopwatch?",
    body: "A stopwatch measures elapsed time from a starting point, letting you record splits (laps) as you go. Chrona Time's stopwatch runs in your browser and shows time to the hundredth of a second.",
  },
  {
    heading: "How stopwatch timing works",
    body: "Elapsed time is measured from high-resolution timestamps (performance.now) rather than by counting intervals. This keeps the display accurate even after switching tabs, browser throttling or system sleep — the measured time never drifts.",
  },
  {
    heading: "How laps work",
    body: "Press Lap while running to record a split. Each lap shows the time for that interval and the total elapsed time. Stopping keeps your lap history; Reset clears everything to start fresh.",
  },
];

export default function StopwatchPage() {
  return (
    <ToolLayout
      title="Stopwatch"
      intro="A free online stopwatch with hundredth-of-a-second precision, lap recording and fullscreen mode."
      path="/stopwatch"
      sections={sections}
      links={[
        { label: "Timer", href: "/timer" },
        { label: "Current Time", href: "/" },
      ]}
    >
      <Stopwatch />
    </ToolLayout>
  );
}
