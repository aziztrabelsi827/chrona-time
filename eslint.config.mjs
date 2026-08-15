import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  // This app intentionally initializes client-only state inside effects — reading
  // localStorage, detecting the browser time zone, and toggling a "mounted" flag —
  // specifically to avoid SSR/hydration mismatches. That is the documented
  // exception to the heuristic below, so we turn it off rather than sprinkle
  // inline disables across every client component.
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      // The interactive tools (timer, stopwatch, fullscreen) legitimately keep
      // mutable values in refs — a clock end-timestamp, a Web Audio context, a
      // latest-value ref read inside event handlers, and a ref forwarded from a
      // small hook — all in handlers/effects, the documented exception. This
      // React-Compiler heuristic can't verify those cases, so it is turned off
      // rather than disabled inline across every tool.
      "react-hooks/refs": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
