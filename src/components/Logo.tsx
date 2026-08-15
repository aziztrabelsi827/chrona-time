import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-semibold tracking-tight text-ink transition-opacity hover:opacity-80",
        className
      )}
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="text-line"
          />
          <circle cx="16" cy="16" r="1.6" fill="currentColor" className="text-accent" />
          <path
            d="M16 16V8M16 16l5 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="text-ink"
          />
          <path d="M16 3.5v1.8M16 26.7v1.8M3.5 16h1.8M26.7 16h1.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-faint" />
        </svg>
      </span>
      <span className="text-lg">{siteConfig.shortName}</span>
    </Link>
  );
}
