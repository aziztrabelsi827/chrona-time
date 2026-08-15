"use client";

import { SearchIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export function SearchTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("chrona:open-search"))}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-muted transition-colors hover:border-faint hover:text-ink",
        className
      )}
    >
      <SearchIcon className="h-4 w-4" />
      Search a city, country or time zone
      <kbd className="ml-1 hidden rounded border border-line bg-surface-2 px-1.5 text-[10px] font-medium text-faint sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
