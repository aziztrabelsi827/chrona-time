import type { Metadata } from "next";
import { Timer } from "@/components/Timer";
import { ToolLayout } from "@/components/ToolParts";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Online Timer – Countdown Timer",
  description:
    "Use Chrona Time's free online timer with custom durations, presets, fullscreen mode, completion alerts and accurate drift-free countdowns.",
  path: "/timer",
});

const sections = [
  {
    heading: "What is an online timer?",
    body: "An online timer counts down from a duration you choose — such as 25 minutes for a focus session — to zero, then alerts you when the time is up. Chrona Time's timer runs entirely in your browser, so it works the moment the page loads.",
  },
  {
    heading: "How to use the timer",
    body: "Pick a preset or enter a custom duration in hours, minutes and seconds, then press Start. You can Pause and Resume at any time, Reset to return to your chosen duration, and open Fullscreen for a distraction-free view. Turn on sound or browser alerts to be notified when the countdown finishes.",
  },
  {
    heading: "How timer accuracy works",
    body: "The countdown is calculated from real timestamps, not by adding one to a counter every second. That means background tabs, browser throttling and system sleep cannot make it drift — when you return to the tab, the remaining time is recomputed correctly.",
  },
];

export default function TimerPage() {
  return (
    <ToolLayout
      title="Timer"
      intro="A free online countdown timer with presets, custom durations, fullscreen mode and completion alerts."
      path="/timer"
      sections={sections}
      links={[
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Current Time", href: "/" },
        { label: "Time Converter", href: "/converter" },
      ]}
    >
      <Timer />
    </ToolLayout>
  );
}
